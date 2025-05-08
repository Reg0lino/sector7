// assets/js/core/bin-system.js - Manages the sorting bins

import * as Conveyor from './conveyor.js';
import * as OrderSystem from './order-system.js';
import * as UIUpdater from '../ui/ui-updater.js';
import * as GameState from './game-state.js';

const BINS_CONFIG = [
    { id: 'bin-tech', label: 'TECH', accepts: ['datachip', 'hardware_common'], icon: '⚙️', color: 'var(--neon-cyan)' },
    { id: 'bin-bio', label: 'BIO', accepts: ['biomod', 'organic_sample'], icon: '🧬', color: 'var(--neon-green)' },
    { id: 'bin-discard', label: 'DISCARD', accepts: ['scrap', 'corrupted_data', 'waste'], icon: '♻️', color: 'var(--neon-magenta)' }
    // Example: also accepts 'corrupted' type
];

const interactionArea = document.getElementById('interaction-area');

export function initBins() {
    if (!interactionArea) {
        console.error("BinSystem: Interaction area (#interaction-area) not found!");
        return;
    }
    interactionArea.innerHTML = ''; // Clear any placeholders

    BINS_CONFIG.forEach(binConfig => {
        const binEl = document.createElement('div');
        binEl.id = binConfig.id;
        binEl.classList.add('sorting-bin'); // General class for styling (ensure this exists in CSS)
        binEl.dataset.accepts = binConfig.accepts.join(','); // Store what it accepts for game logic

        // Style the bin dynamically or use more CSS classes
        binEl.style.setProperty('--bin-glow-color', binConfig.color); // For dynamic glow

        const iconEl = document.createElement('span');
        iconEl.classList.add('bin-icon');
        iconEl.textContent = binConfig.icon;

        const labelEl = document.createElement('span');
        labelEl.classList.add('bin-label');
        labelEl.textContent = binConfig.label;

        binEl.appendChild(iconEl);
        binEl.appendChild(labelEl);
        interactionArea.appendChild(binEl);

        // Basic Drag and Drop listeners (will need actual draggable items later)
        binEl.addEventListener('dragover', (event) => {
            event.preventDefault(); // Allow dropping
            binEl.classList.add('drag-over'); // Add visual feedback
        });
        binEl.addEventListener('dragleave', () => {
            binEl.classList.remove('drag-over'); // Remove visual feedback
        });
        binEl.addEventListener('drop', (event) => {
            event.preventDefault();
            binEl.classList.remove('drag-over');
            console.log("BinSystem Drop: Drop target element:", event.target); // Log the element the drop occurred on

            // --- CRITICAL LINE FOR GETTING DRAG DATA ---
            let itemId = null;
            if (event.dataTransfer) {
                itemId = event.dataTransfer.getData('text/plain');
            }

            // --- ADD MORE LOGGING HERE ---
            console.log(`BinSystem Drop: Raw dataTransfer.getData('text/plain') retrieved: "${itemId}"`);

            if (!itemId || itemId.trim() === "") {
                console.error("BinSystem Drop: Retrieved item ID is null, empty, or invalid.");
                UIUpdater.showFeedbackMessage("SORT ERROR: Invalid item data transferred!", "error");
                return;
            }

            const droppedItemData = Conveyor.getItemData(itemId);

            if (!droppedItemData) {
                console.error(`BinSystem Drop: Conveyor.getItemData failed to find item with ID: "${itemId}". Active conveyor items:`, Conveyor.getAllActiveItems ? Conveyor.getAllActiveItems() : "Couldn't fetch active items.");
                UIUpdater.showFeedbackMessage(`SORT ERROR: Item [${itemId.substring(0,10)}...] not found on conveyor!`, "error");
                return;
            }

            // ...existing drop logic...
            console.log(`BinSystem: Item '${droppedItemData.name}' (Type: ${droppedItemData.type}, ID: ${itemId}) dropped on Bin '${binConfig.label}' (ID: ${binConfig.id})`);
            Conveyor.removeItemFromConveyor(itemId);
            const acceptsItemType = binConfig.accepts.includes(droppedItemData.type);
            const basePenalty = -10;
            let penalty = basePenalty;

            if (droppedItemData.isFragile) {
                penalty *= 3; // Fragile items have triple penalty for any misplacement
                UIUpdater.showFeedbackMessage(`FRAGILE ITEM '${droppedItemData.name}' DAMAGED!`, "error", 4000);
            }

            if (acceptsItemType) {
                const orderFulfilled = OrderSystem.attemptToFulfillOrder(droppedItemData, binConfig);
                if (orderFulfilled) {
                    // Success, no penalty (OrderSystem handles reward)
                } else {
                    const currentOrder = OrderSystem.getCurrentOrderDetails();
                    if (currentOrder && currentOrder.itemTypeRequired === droppedItemData.type && currentOrder.targetBinId !== binConfig.id) {
                        UIUpdater.showFeedbackMessage(`FRAGILE: WRONG BIN! '${droppedItemData.name}' belongs elsewhere.`, "error");
                        GameState.addScore(penalty - 5); // Extra -5 for order item in wrong bin
                    } else if (binConfig.id === 'bin-discard' && (droppedItemData.type === 'scrap' || droppedItemData.type === 'corrupted_data')) {
                        UIUpdater.showFeedbackMessage(`'${droppedItemData.name}' discarded.`, "info");
                        GameState.addScore(droppedItemData.isFragile ? -5 : 5); // Fragile items shouldn't be discarded for points
                    } else {
                        UIUpdater.showFeedbackMessage(`Misplaced '${droppedItemData.name}'.`, "error");
                        GameState.addScore(penalty);
                    }
                    UIUpdater.updateScore(GameState.getScore());
                }
            } else {
                UIUpdater.showFeedbackMessage(`INVALID SORT! '${binConfig.label}' doesn't accept '${droppedItemData.type}'.`, "error");
                GameState.addScore(penalty - 15); // Base penalty for this is -25, fragile makes it much worse
                UIUpdater.updateScore(GameState.getScore());
            }
        });
    });
    console.log('BinSystem: Bins initialized dynamically with enhanced drop logic.');
}

export function getBinConfigById(binId) {
    return BINS_CONFIG.find(bin => bin.id === binId);
}

export function getAllBinConfigs() {
    return BINS_CONFIG;
}

console.log("BinSystem: Module Loaded.");

// Filename: bin-system.js
// Directory: assets/js/core/