// assets/js/core/upgrades-system.js - Manages player upgrades and augmentations

import * as GameState from './game-state.js'; // To get current shift score for checks if needed
import * as PlayerState from './player-state.js'; // To spend persistent Creds and save purchased IDs
import * as UIUpdater from '../ui/ui-updater.js';
import * as Conveyor from './conveyor.js'; // To apply conveyor-related effects

// --- Upgrade Catalog ---
export const UPGRADE_CATALOG = {
    // Passive Upgrades
    'conveyor_clutch_1': {
        id: 'conveyor_clutch_1', name: "Conveyor Clutch Mk1", type: 'passive',
        description: "Increases base time between item spawns by 10%.",
        cost: 250, purchased: false, maxLevel: 1, currentLevel: 0, // For potential multi-level upgrades
        applyEffect: () => { Conveyor.adjustBaseSpawnIntervalMultiplier(1.1); },
        removeEffect: () => { Conveyor.adjustBaseSpawnIntervalMultiplier(1/1.1); } // Needed if upgrades can be removed/disabled
    },
    'recycle_efficiency_1': {
        id: 'recycle_efficiency_1', name: "Recycle Efficiency v1", type: 'passive',
        description: "Gain 5 Creds for items correctly sorted into DISCARD.",
        cost: 300, purchased: false, maxLevel: 1, currentLevel: 0,
        effectValue: 5, // Can be accessed by GameLogic
        applyEffect: null, // Effect checked passively by GameLogic
        removeEffect: null
    },
    'fumble_insurance_1': {
        id: 'fumble_insurance_1', name: "Fumble Insurance T1", type: 'passive',
        description: "Reduces penalty for fumbled items (dropped outside bin) by 50%. (NYI)",
        cost: 150, purchased: false, maxLevel: 1, currentLevel: 0,
        effectValue: 0.5,
        applyEffect: null, // GameLogic would check for this when applying fumble penalty
        removeEffect: null
    },
    'fragile_handling': {
        id: 'fragile_handling', name: "Fragile Handling", type: 'passive',
        description: "Reduces penalty for breaking fragile items on wrong sort by 50%.",
        cost: 400, purchased: false, maxLevel: 1, currentLevel: 0,
        effectValue: 0.5,
        applyEffect: null, // GameLogic checks for this
        removeEffect: null
    },

    // Active Abilities (Not fully implemented yet)
    'optic_scan_v1': {
        id: 'optic_scan_v1', name: "Optical Scanner v1", type: 'active',
        description: "Briefly highlights correct bins for items on conveyor. Cooldown: 60s. (NYI)",
        cost: 500, purchased: false, maxLevel: 1, currentLevel: 0,
        cooldown: 60000, lastUsed: 0,
        activate: () => { /* Future: Logic to highlight bins */ console.log("ABILITY: Optic Scan Used (NYI)"); }
    },
};

// --- System State ---
// We don't store purchased upgrades here anymore, PlayerState handles persistence.

export function init() {
    // PlayerState handles loading purchased upgrades.
    // Apply passive effects of already purchased upgrades on game init.
    applyAllPurchasedPassiveEffects();
    console.log("UpgradesSystem: Initialized and applied existing passive upgrades.");
}

function applyAllPurchasedPassiveEffects() {
    const purchasedIds = PlayerState.getPurchasedUpgradeIds();
    purchasedIds.forEach(id => {
        const upgrade = UPGRADE_CATALOG[id];
        if (upgrade && upgrade.type === 'passive' && typeof upgrade.applyEffect === 'function') {
            try {
                console.log(`UpgradesSystem: Applying initial effect for purchased upgrade "${id}".`);
                upgrade.applyEffect();
            } catch (error) {
                console.error(`UpgradesSystem: Error applying initial effect for ${id}:`, error);
            }
        }
    });
}

export function getAvailableUpgrades() {
    const purchasedIds = PlayerState.getPurchasedUpgradeIds();
    return Object.values(UPGRADE_CATALOG).filter(upg => !purchasedIds.includes(upg.id));
}

export function getPurchasedUpgrades() {
    const purchasedIds = PlayerState.getPurchasedUpgradeIds();
    return purchasedIds.map(id => UPGRADE_CATALOG[id]).filter(upg => upg); // Get full objects
}

export function hasUpgrade(upgradeId) {
    const purchasedIds = PlayerState.getPurchasedUpgradeIds();
    return purchasedIds.includes(upgradeId);
}

export function purchaseUpgrade(upgradeId) {
    const upgrade = UPGRADE_CATALOG[upgradeId];
    if (!upgrade) {
        console.error(`UpgradesSystem: Upgrade "${upgradeId}" not found.`);
        return false;
    }
    if (hasUpgrade(upgradeId)) {
        UIUpdater.showFeedbackMessage("Augmentation Already Installed!", "info");
        return false;
    }

    if (PlayerState.spendCreds(upgrade.cost)) { // Use PlayerState to handle Creds
        PlayerState.addPurchasedUpgrade(upgradeId); // Persist the purchase

        // Apply immediate effect if any
        if (upgrade.type === 'passive' && typeof upgrade.applyEffect === 'function') {
             try {
                 upgrade.applyEffect();
             } catch (error) {
                 console.error(`UpgradesSystem: Error applying effect for ${upgradeId} on purchase:`, error);
             }
        }

        UIUpdater.updateScore(PlayerState.getTotalCreds()); // Update UI score display
        UIUpdater.showFeedbackMessage(`Installed: ${upgrade.name}!`, "success");
        console.log(`UpgradesSystem: Purchased "${upgradeId}".`);
        return true;
    } else {
        UIUpdater.showFeedbackMessage("Insufficient Creds!", "error");
        return false;
    }
}

// --- Functions for other modules to query effects ---

export function getRecycleBonusValue() {
    const upgradeId = 'recycle_efficiency_1';
    return hasUpgrade(upgradeId) ? UPGRADE_CATALOG[upgradeId].effectValue : 0;
}

export function getFragilePenaltyModifier() {
    const upgradeId = 'fragile_handling';
    return hasUpgrade(upgradeId) ? (1 - UPGRADE_CATALOG[upgradeId].effectValue) : 1.0; // Returns 0.5 if owned, 1.0 otherwise
}

// Note: Conveyor speed/spawn interval modifications are now applied directly via applyEffect
// when the upgrade is purchased, rather than being polled every time.

console.log("UpgradesSystem: Module Loaded.");

// Filename: upgrades-system.js
// Directory: assets/js/core/