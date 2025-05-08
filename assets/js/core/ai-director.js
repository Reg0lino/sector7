// assets/js/core/ai-director.js - Manages game difficulty, event triggering, and pacing.

import * as GameState from './game-state.js';
import * as OrderSystem from './order-system.js';
// Future imports: EventManager, RivalSystem, ItemFactory (to influence item properties)

// --- Director State & Configuration ---
let directorLevel = 1; // Simple difficulty/progression metric
let consecutiveSuccesses = 0;
let consecutiveFailures = 0;

const MAX_DIRECTOR_LEVEL = 10;
const SUCCESS_THRESHOLD_FOR_LEVEL_UP = 3; // e.g., 3 successful orders to potentially level up director
const FAILURE_THRESHOLD_FOR_LEVEL_DOWN = 2;

// --- Difficulty Parameters (examples, will be expanded) ---
const DIFFICULTY_SETTINGS = {
    // Level: [maxOrderItems, minItemValue, spawnRateMultiplier, chanceOfSpecialItem]
    1: { orderComplexity: 1, itemValueMin: 10, itemSpawnRateMod: 1.0, specialItemChance: 0.05 },
    2: { orderComplexity: 1, itemValueMin: 20, itemSpawnRateMod: 0.95, specialItemChance: 0.10 },
    3: { orderComplexity: 2, itemValueMin: 25, itemSpawnRateMod: 0.90, specialItemChance: 0.15 },
    // ... up to MAX_DIRECTOR_LEVEL
    [MAX_DIRECTOR_LEVEL]: { orderComplexity: 3, itemValueMin: 50, itemSpawnRateMod: 0.7, specialItemChance: 0.35 }
};

export function init() {
    directorLevel = 1;
    consecutiveSuccesses = 0;
    consecutiveFailures = 0;
    console.log("AIDirector: Initialized. Level:", directorLevel);
    // ApplyInitialDifficulty(); // Might call this from GameState.startGame()
}

export function notifyOrderSuccess() {
    consecutiveSuccesses++;
    consecutiveFailures = 0; // Reset failures on success
    console.log("AIDirector: Order Success noted. Consecutive successes:", consecutiveSuccesses);

    if (consecutiveSuccesses >= SUCCESS_THRESHOLD_FOR_LEVEL_UP && directorLevel < MAX_DIRECTOR_LEVEL) {
        directorLevel++;
        consecutiveSuccesses = 0; // Reset for next level
        console.log("AIDirector: Level UP! New Director Level:", directorLevel);
        // Future: Trigger a positive mini-event or announce "Market Conditions Improving"
    }
    // applyCurrentDifficulty();
}

export function notifyOrderFailure() { // e.g. item missorted badly, time ran out before completion
    consecutiveFailures++;
    consecutiveSuccesses = 0; // Reset successes on failure
    console.log("AIDirector: Order Failure noted. Consecutive failures:", consecutiveFailures);

    if (consecutiveFailures >= FAILURE_THRESHOLD_FOR_LEVEL_DOWN && directorLevel > 1) {
        directorLevel--;
        consecutiveFailures = 0; // Reset for next level
        console.log("AIDirector: Level DOWN! New Director Level:", directorLevel);
        // Future: Trigger a minor negative event or "Supply Chain Disrupted"
    }
    // applyCurrentDifficulty();
}

export function notifyIncorrectSort() {
    // Could have a more nuanced impact, e.g., increase a "chaos" meter slightly
    // For now, major failures (like failing an order) impact director level.
    console.log("AIDirector: Incorrect sort noted.");
}

export function notifyItemMissed() {
    console.log("AIDirector: Item missed from conveyor noted.");
    // Potentially treat this as a minor failure, contributing to order failure if too many.
}


// --- Functions to get difficulty-adjusted parameters ---
export function getCurrentDifficultyParams() {
    return DIFFICULTY_SETTINGS[directorLevel] || DIFFICULTY_SETTINGS[1]; // Fallback to level 1
}

export function getAdjustedOrderParameters() {
    const params = getCurrentDifficultyParams();
    // Example: Use params.orderComplexity to determine quantity/variety in OrderSystem
    return {
        maxItemsInOrder: params.orderComplexity * 2, // e.g., level 1 -> 2 items, level 3 -> 6 items
        minRarityLevel: directorLevel, // Higher level, rarer items can be requested
        // Add more parameters: chance of fragile/volatile, specific item combos
    };
}

export function getAdjustedConveyorParameters() {
    const params = getCurrentDifficultyParams();
    return {
        spawnIntervalModifier: params.itemSpawnRateMod, // Multiplier for SPAWN_INTERVAL in conveyor.js
        // Add more: conveyor speed, chance of "glitch" items
    };
}

// This function would be called by OrderSystem, ConveyorSystem etc.
// function applyCurrentDifficulty() {
//     console.log("AIDirector: Applying difficulty for level", directorLevel);
//     const conveyorParams = getAdjustedConveyorParameters();
//     Conveyor.setSpawnRateModifier(conveyorParams.spawnIntervalModifier); // Conveyor needs this function
//     // OrderSystem will call getAdjustedOrderParameters() when generating a new order
// }

console.log("AIDirector: Module Loaded.");

// Filename: ai-director.js
// Directory: assets/js/core/