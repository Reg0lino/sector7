// assets/js/core/game-logic.js - Handles the core logic of sorting items

import * as GameState from './game-state.js';
import * as OrderSystem from './order-system.js';
import * as Conveyor from './conveyor.js';
import * as BinSystem from './bin-system.js';
import * as UIUpdater from '../ui/ui-updater.js';
import * as AIDirector from './ai-director.js'; // Import AI Director
import * as UpgradesSystem from './upgrades-system.js'; // Add/Ensure this

// Constants for scoring
const POINTS_CORRECT_SORT = 25;
const POINTS_CORRECT_ORDER_ITEM = 50; // Bonus for fulfilling current order item
const PENALTY_INCORRECT_SORT = -15; // Made penalty slightly harsher
const PENALTY_WRONG_ITEM_FOR_ORDER = -5;
const PENALTY_MISSED_ITEM = -10; // Penalty for items falling off conveyor (handled in conveyor.js but good to have constant here)

export function init() {
    console.log("GameLogic: Initialized.");
}

/**
 * Handles the logic when an item is sorted (dropped into a bin).
 * @param {string} itemId - The ID of the item being sorted.
 * @param {string} targetBinId - The ID of the bin the item was dropped into.
 */
export function handleItemSort(itemId, targetBinId) {
    if (!GameState.isGameActive() || GameState.isGamePaused()) {
        console.warn("GameLogic: Attempted to sort item while game not active/paused.");
        return;
    }

    const itemData = Conveyor.getItemData(itemId);
    const binConfig = BinSystem.getBinConfigById(targetBinId);
    const currentOrder = OrderSystem.getCurrentOrderDetails();

    if (!itemData) {
        console.error(`GameLogic: Item data not found for ID ${itemId}. Cannot process sort.`);
        return;
    }
    if (!binConfig) {
        console.error(`GameLogic: Bin configuration not found for ID ${targetBinId}.`);
        return;
    }

    // Remove the item from the conveyor. This also gives us the definitive item data.
    const sortedItem = Conveyor.removeItemFromConveyor(itemData.id);
    if (!sortedItem) {
        console.error(`GameLogic: Failed to remove ${itemData.id} from conveyor after confirming its data. This shouldn't happen.`);
        return;
    }

    console.log(`GameLogic: Sorting item "${sortedItem.name}" (Type: ${sortedItem.type}) into bin "${binConfig.label}" (Accepts: ${binConfig.accepts.join(', ')})`);

    let sortSuccessfulThisAction = false; // Was this specific drop action correct?
    let message = "";
    let messageType = "error"; // Assume error initially
    let scoreChange = 0;

    if (binConfig.accepts.includes(sortedItem.type)) { // Correct Bin Type
        sortSuccessfulThisAction = true;
        scoreChange += POINTS_CORRECT_SORT;
        message = `Correct: "${sortedItem.name}" to ${binConfig.label}.`;
        messageType = "success";

        // Check order fulfillment
        if (currentOrder && currentOrder.itemTypeRequired === sortedItem.type) {
            if (OrderSystem.fulfillOrderItem(sortedItem.type)) {
                scoreChange += POINTS_CORRECT_ORDER_ITEM;
                message += ` Order progress!`;
                // Apply Rush Order Bonus if applicable (Needs GameState integration or direct check)
                // Example: if (EventManager.isEventActive('rush_order_bonus')) { scoreChange += RUSH_BONUS_AMOUNT; }
            }
        } else if (currentOrder) {
             message += ` (Not current order).`;
             scoreChange += PENALTY_WRONG_ITEM_FOR_ORDER;
             if (messageType === "success") messageType = "info";
        }

        // Apply Recycle Bonus if applicable
        if (binConfig.id === 'bin-discard') {
            const recycleBonus = UpgradesSystem.getRecycleBonusValue(); // Use correct function name
            if (recycleBonus > 0) {
                scoreChange += recycleBonus;
                message += ` +${recycleBonus} recycle bonus!`;
            }
            // ParticleSystem.createScrapBurst(burstX, burstY);
        } else {
            // ParticleSystem.createSuccessBurst(burstX, burstY);
        }

    } else { // Incorrect Bin Type
        sortSuccessfulThisAction = false;
        let incorrectSortPenalty = PENALTY_INCORRECT_SORT; // Base penalty
        message = `WRONG BIN! "${sortedItem.name}" to ${binConfig.label}.`;
        messageType = "error";

        if (sortedItem.isFragile) {
            const fragilePenaltyModifier = UpgradesSystem.getFragilePenaltyModifier(); // 1.0 if no upgrade, 0.5 if owned
            const fragilePenalty = Math.round(25 * fragilePenaltyModifier); // Calculate modified penalty
            message += ` It shattered! (-${fragilePenalty} extra)`;
            incorrectSortPenalty -= fragilePenalty; // Add extra penalty
            // ParticleSystem.createBurst(burstX, burstY, '#EEEEEE', 50, 5, 4.5, 1200);
        } else {
             // ParticleSystem.createErrorBurst(burstX, burstY);
        }

        scoreChange += incorrectSortPenalty; // Apply total incorrect sort penalty
        AIDirector.notifyIncorrectSort();
    }

    // Update score using GameState (tracks shift score)
    if (scoreChange !== 0) {
        GameState.addScoreToShift(scoreChange);
        UIUpdater.updateScore(PlayerState.getTotalCreds());
    }
    // Show feedback message *after* all calculations
    UIUpdater.showFeedbackMessage(message, messageType);

    console.log(`GameLogic: Sort for ${sortedItem.name} - Action Success: ${sortSuccessfulThisAction}, Shift Score Change: ${scoreChange}, Message: "${message}"`);
}

// This function can be called from conveyor.js when an item falls off
export function handleItemMissed(itemData) {
    if (!GameState.isGameActive()) return;

    console.log(`GameLogic: Item "${itemData.name}" (Type: ${itemData.type}) missed (fell off conveyor).`);
    UIUpdater.showFeedbackMessage(`Missed: ${itemData.name}!`, "error");

    GameState.addScoreToShift(PENALTY_MISSED_ITEM); // Affect shift score
    UIUpdater.updateScore(PlayerState.getTotalCreds()); // Update UI display
    AIDirector.notifyItemMissed();

    // Check if this missed item was critical for an order
    const currentOrder = OrderSystem.getCurrentOrderDetails();
    if (currentOrder && currentOrder.itemTypeRequired === itemData.type) {
        // Potentially fail the order if it becomes impossible, or just make it harder.
        // For now, just a log. Order failure due to impossibility is more complex.
        console.log(`GameLogic: Missed item was part of the current order.`);
    }
}

console.log("GameLogic: Module Loaded.");