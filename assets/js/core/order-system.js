// assets/js/core/order-system.js - Generates and manages player orders

import * as AIDirector from './ai-director.js';
import * as ItemFactory from './item-factory.js';
import * as GameState from './game-state.js';
import * as UIUpdater from '../ui/ui-updater.js'; // To update order display
import { getAllBinConfigs } from './bin-system.js';

let currentGeneratedOrder = null;

// Example Order Structures:
// { id: 'order-123', description: "Collect 2x Datachips for Fixer Alpha.",
//   itemsToCollect: [ { type: ItemFactory.ITEM_TYPES.DATACHIP, quantity: 2, collected: 0 } ],
//   targetBinOverride: null, // Or specific bin ID if order demands it
//   timeBonus: 30, reward: 100, fixerId: 'fixerAlpha' }

export function init() {
    currentGeneratedOrder = null;
    console.log("OrderSystem: Initialized.");
}

export function generateNewOrder() {
    console.log("OrderSystem.generateNewOrder(): ENTERED");
    // --- GET PARAMS FROM AI DIRECTOR ---
    const orderParams = AIDirector.getAdjustedOrderParameters();
    console.log("OrderSystem: Generating order with params from AIDirector:", orderParams);

    const itemTypesArray = Object.values(ItemFactory.ITEM_TYPES).filter(type => type !== ItemFactory.ITEM_TYPES.SCRAP && type !== ItemFactory.ITEM_TYPES.CORRUPTED);
    const randomItemType = itemTypesArray[Math.floor(Math.random() * itemTypesArray.length)];

    // Use orderParams.maxItemsInOrder (or a part of it) for quantity
    const quantity = Math.min(orderParams.maxItemsInOrder, Math.floor(Math.random() * 2) + 1); // e.g. 1 to 2, capped by director

    // Determine the correct bin for this item type (simplified)
    let targetBinLabel = 'UNKNOWN';
    if (['datachip', 'hardware_common'].includes(randomItemType)) targetBinLabel = 'TECH';
    else if (['biomod', 'organic_sample'].includes(randomItemType)) targetBinLabel = 'BIO';
    else targetBinLabel = 'DISCARD';

    const itemName = ItemFactory.createItem(randomItemType)?.name || randomItemType;

    currentGeneratedOrder = {
        id: `order-${Date.now()}`,
        description: `Collect ${quantity}x ${itemName} → ${targetBinLabel}`,
        itemTypeRequired: randomItemType,
        itemNameForDisplay: itemName,
        quantityRequired: quantity,
        quantityCollected: 0,
        targetBinLabel: targetBinLabel,
        reward: quantity * (ItemFactory.createItem(randomItemType)?.value || 20) * (1 + (AIDirector.getCurrentDifficultyParams().orderComplexity - 1) * 0.1),
    };

    GameState.setCurrentOrder(currentGeneratedOrder);
    UIUpdater.updateOrders({
        item: currentGeneratedOrder.itemNameForDisplay,
        quantity: `${currentGeneratedOrder.quantityCollected}/${currentGeneratedOrder.quantityRequired}`,
        target: currentGeneratedOrder.targetBinLabel
    });

    console.log("OrderSystem: New order generated.", currentGeneratedOrder);
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