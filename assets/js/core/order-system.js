// assets/js/core/order-system.js - Generates and manages player orders

import * as AIDirector from './ai-director.js';
import * as ItemFactory from './item-factory.js';
import * as GameState from './game-state.js';
import * as UIUpdater from '../ui/ui-updater.js'; // To update order display
import { getAllBinConfigs } from './bin-system.js';
import { FIXERS, getAllFixerIds, getFixerById } from './fixer-profiles.js';

let currentGeneratedOrder = null;
let currentFixerId = null; // Track the fixer for the current order

// Example Order Structures:
// { id: 'order-123', description: "Collect 2x Datachips for Fixer Alpha.",
//   itemsToCollect: [ { type: ItemFactory.ITEM_TYPES.DATACHIP, quantity: 2, collected: 0 } ],
//   targetBinOverride: null, // Or specific bin ID if order demands it
//   timeBonus: 30, reward: 100, fixerId: 'fixerAlpha' }

export function init() {
    currentGeneratedOrder = null;
    currentFixerId = null;
    console.log("OrderSystem: Initialized.");
}

export function generateNewOrder() {
    console.log("OrderSystem.generateNewOrder(): ENTERED");

    // 1. Select a Fixer (randomly for now, can be smarter later)
    const availableFixerIds = getAllFixerIds();
    if (availableFixerIds.length === 0) {
        console.error("OrderSystem: No fixers defined!");
        return null;
    }
    currentFixerId = availableFixerIds[Math.floor(Math.random() * availableFixerIds.length)];
    const selectedFixer = FIXERS[currentFixerId];
    if (!selectedFixer) {
        console.error(`OrderSystem: Could not find fixer profile for ID: ${currentFixerId}`);
        return null;
    }

    // 2. Determine item type based on Fixer preference
    let itemTypeForOrder;
    if (selectedFixer.preferredItemTypes && selectedFixer.preferredItemTypes.length > 0) {
        itemTypeForOrder = selectedFixer.preferredItemTypes[Math.floor(Math.random() * selectedFixer.preferredItemTypes.length)];
    } else {
        const allItemTypes = Object.values(ItemFactory.ITEM_TYPES).filter(type => type !== ItemFactory.ITEM_TYPES.SCRAP);
        itemTypeForOrder = allItemTypes[Math.floor(Math.random() * allItemTypes.length)];
    }

    // 3. Determine quantity based on Fixer complexity
    const complexity = selectedFixer.orderComplexity;
    const quantity = Math.floor(Math.random() * (complexity.maxQuantity - complexity.minQuantity + 1)) + complexity.minQuantity;

    // 4. Determine target bin (same logic as before)
    const allBins = getAllBinConfigs();
    let targetBinForOrder = allBins.find(bin => bin.accepts.includes(itemTypeForOrder)) ||
                            allBins.find(b => b.id === 'bin-discard') ||
                            { id: 'unknown-bin', label: 'UNKNOWN' };

    // 5. Create item overrides based on fixer preferences (e.g. fragile, corruption)
    let itemOverrides = {};
    if (complexity.prefersNonCorrupted) itemOverrides.corruptionLevel = 0;
    if (complexity.acceptsCorrupted === undefined && Math.random() < 0.1) itemOverrides.corruptionLevel = Math.random() * 0.3;
    if (complexity.mightNeedFragile && Math.random() < 0.3) itemOverrides.isFragile = true;

    const sampleItem = ItemFactory.createItem(itemTypeForOrder, itemOverrides);
    if (!sampleItem) {
        console.error(`OrderSystem: Failed to create sample item of type ${itemTypeForOrder} for order generation.`);
        return null;
    }
    const itemNameForDisplay = sampleItem.name;

    // 6. Generate flavor text for order description
    let orderDescription = `REQ: ${quantity}x ${itemNameForDisplay} → ${targetBinForOrder.label}`;
    if (selectedFixer.dialogueStyle && selectedFixer.dialogueStyle.orderPrefixes) {
        const prefix = selectedFixer.dialogueStyle.orderPrefixes[Math.floor(Math.random() * selectedFixer.dialogueStyle.orderPrefixes.length)];
        orderDescription = `${prefix}\nSort ${quantity}x "${itemNameForDisplay}" to BIN:${targetBinForOrder.label}. - ${selectedFixer.name}`;
    }

    currentGeneratedOrder = {
        id: `order-${Date.now()}`,
        fixerId: currentFixerId,
        fixerName: selectedFixer.name,
        descriptionForUI: orderDescription,
        itemTypeRequired: itemTypeForOrder,
        itemNameForDisplay: itemNameForDisplay,
        quantityRequired: quantity,
        quantityCollected: 0,
        targetBinId: targetBinForOrder.id,
        targetBinLabel: targetBinForOrder.label,
        reward: (quantity * (sampleItem.value || 20)) * (1 + selectedFixer.reputation * 0.01),
        isFragileRequired: sampleItem.isFragile,
    };

    GameState.setCurrentOrder(currentGeneratedOrder);
    UIUpdater.updateOrders({
        fixer: selectedFixer.name,
        item: itemNameForDisplay,
        quantity: `${currentGeneratedOrder.quantityCollected}/${currentGeneratedOrder.quantityRequired}`,
        target: targetBinForOrder.label,
        fullText: orderDescription
    });

    console.log(`OrderSystem: New order from ${selectedFixer.name}:`, currentGeneratedOrder);
    return currentGeneratedOrder;
}

/**
 * Attempts to fulfill the current order with the dropped item and target bin.
 * @param {object} droppedItemData - The data of the item dropped.
 * @param {object} targetBinConfig - The configuration of the bin the item was dropped into.
 * @returns {boolean} True if the item contributed to the order, false otherwise.
 */
export function attemptToFulfillOrder(droppedItemData, targetBinConfig) {
    if (!currentGeneratedOrder || !GameState.isGameActive() || currentGeneratedOrder.quantityCollected >= currentGeneratedOrder.quantityRequired) {
        return false;
    }
    if (currentGeneratedOrder.itemTypeRequired === droppedItemData.type &&
        currentGeneratedOrder.targetBinLabel === targetBinConfig.label) {
        currentGeneratedOrder.quantityCollected++;
        UIUpdater.updateOrders({
            item: currentGeneratedOrder.itemNameForDisplay,
            quantity: `${currentGeneratedOrder.quantityCollected}/${currentGeneratedOrder.quantityRequired}`,
            target: currentGeneratedOrder.targetBinLabel
        });
        UIUpdater.showFeedbackMessage(`+1 ${droppedItemData.name} for order!`, "success");
        if (currentGeneratedOrder.quantityCollected >= currentGeneratedOrder.quantityRequired) {
            orderComplete();
        }
        return true;
    }
    return false;
}

function orderComplete() {
    if (!currentGeneratedOrder) return;
    console.log(`OrderSystem: Order ${currentGeneratedOrder.id} complete! Reward: ${currentGeneratedOrder.reward}`);
    UIUpdater.showFeedbackMessage(`Order Complete! +${Math.round(currentGeneratedOrder.reward)} Creds`, "success");
    GameState.addScore(Math.round(currentGeneratedOrder.reward));
    UIUpdater.updateScore(GameState.getScore());

    // --- NOTIFY AI DIRECTOR OF SUCCESS ---
    AIDirector.notifyOrderSuccess();

    currentGeneratedOrder = null;
    setTimeout(() => {
        if (GameState.isGameActive()) {
            generateNewOrder();
        }
    }, 1500);
}

// How to handle order failure?
// If time runs out and an order is active, GameState.gameOver() is called.
// We need a way for OrderSystem to know this or for GameState to tell AIDirector.
// Let's add a function to explicitly fail an order if needed (e.g. too many errors on it)
export function failCurrentOrder(reason = "unknown") {
    if (currentGeneratedOrder) {
        console.log(`OrderSystem: Order ${currentGeneratedOrder.id} FAILED. Reason: ${reason}`);
        UIUpdater.showFeedbackMessage(`Order Failed: ${currentGeneratedOrder.itemNameForDisplay}`, "error");
        AIDirector.notifyOrderFailure();
        currentGeneratedOrder = null;
        // Generate next order after a short delay
        setTimeout(() => {
            if (GameState.isGameActive()) {
                generateNewOrder();
            }
        }, 2000);
    }
}

export function getCurrentOrderDetails() {
    return currentGeneratedOrder;
}

console.log("OrderSystem: Module Loaded.");

// Filename: order-system.js
// Directory: assets/js/core/