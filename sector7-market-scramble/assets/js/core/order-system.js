// assets/js/core/order-system.js - Generates and manages player orders

import * as ItemFactory from './item-factory.js';
import * as GameState from './game-state.js';
import * as UIUpdater from '../ui/ui-updater.js'; // To update order display

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
    // For now, a very simple order generator. This will become much more complex.
    const itemTypesArray = Object.values(ItemFactory.ITEM_TYPES).filter(type => type !== ItemFactory.ITEM_TYPES.SCRAP && type !== ItemFactory.ITEM_TYPES.CORRUPTED); // Don't ask for scrap/corrupted initially
    const randomItemType = itemTypesArray[Math.floor(Math.random() * itemTypesArray.length)];
    const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3 items

    // Determine the correct bin for this item type (simplified)
    let targetBinLabel = 'UNKNOWN';
    // This logic should ideally come from BinSystem or a shared config
    if (['datachip', 'hardware_common'].includes(randomItemType)) targetBinLabel = 'TECH';
    else if (['biomod', 'organic_sample'].includes(randomItemType)) targetBinLabel = 'BIO';
    else targetBinLabel = 'DISCARD'; // Fallback if type not in main bins


    const itemName = ItemFactory.createItem(randomItemType)?.name || randomItemType; // Get a sample name

    currentGeneratedOrder = {
        id: `order-${Date.now()}`,
        description: `Collect ${quantity}x ${itemName} &rarr; ${targetBinLabel}`,
        itemTypeRequired: randomItemType, // The actual type string
        itemNameForDisplay: itemName,    // A display-friendly name
        quantityRequired: quantity,
        quantityCollected: 0,
        targetBinLabel: targetBinLabel, // For UI display
        // targetBinId: getBinIdForType(randomItemType) // Logic needed here
        reward: quantity * (ItemFactory.createItem(randomItemType)?.value || 20),
    };

    GameState.setCurrentOrder(currentGeneratedOrder);
    UIUpdater.updateOrders({ // Send structured data to UIUpdater
        item: currentGeneratedOrder.itemNameForDisplay,
        quantity: currentGeneratedOrder.quantityRequired,
        target: currentGeneratedOrder.targetBinLabel
    });

    console.log("OrderSystem: New order generated.", currentGeneratedOrder);
    return currentGeneratedOrder;
}

export function fulfillOrderItem(itemType) {
    if (!currentGeneratedOrder || !GameState.isGameActive()) return false;

    if (currentGeneratedOrder.itemTypeRequired === itemType &&
        currentGeneratedOrder.quantityCollected < currentGeneratedOrder.quantityRequired) {
        currentGeneratedOrder.quantityCollected++;
        UIUpdater.updateOrders({ // Update display with progress
            item: currentGeneratedOrder.itemNameForDisplay,
            quantity: `${currentGeneratedOrder.quantityCollected}/${currentGeneratedOrder.quantityRequired}`,
            target: currentGeneratedOrder.targetBinLabel
        });
        console.log(`OrderSystem: Item ${itemType} fulfilled. Progress: ${currentGeneratedOrder.quantityCollected}/${currentGeneratedOrder.quantityRequired}`);

        if (currentGeneratedOrder.quantityCollected >= currentGeneratedOrder.quantityRequired) {
            orderComplete();
            return true; // Item fulfilled, and order completed
        }
        return true; // Item fulfilled, order ongoing
    }
    return false; // Item not part of current order or order already complete
}

function orderComplete() {
    if (!currentGeneratedOrder) return;
    console.log(`OrderSystem: Order ${currentGeneratedOrder.id} complete! Reward: ${currentGeneratedOrder.reward}`);
    UIUpdater.showFeedbackMessage(`Order Complete! +${currentGeneratedOrder.reward} Creds`, "success");
    GameState.addScore(currentGeneratedOrder.reward);
    UIUpdater.updateScore(GameState.getScore()); // Ensure score UI updates

    currentGeneratedOrder = null;
    //GameState.setCurrentOrder(null); // Clear it in game state

    // Generate next order after a short delay
    setTimeout(() => {
        if (GameState.isGameActive()) { // Check if game is still running
             generateNewOrder();
        }
    }, 1500);
}

export function getCurrentOrderDetails() {
    return currentGeneratedOrder;
}

console.log("OrderSystem: Module Loaded.");