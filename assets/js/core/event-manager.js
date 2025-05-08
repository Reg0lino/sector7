// assets/js/core/event-manager.js - Manages random market events and system glitches

// --- FIX THE TYPOS HERE ---
import * as GameState from './game-state.js';         // Was: import *s GameState
import * as UIUpdater from '../ui/ui-updater.js';     // Was: import *s UIUpdater
import * as Conveyor from './conveyor.js';
import * as AIDirector from './ai-director.js';

// ... (rest of the file: activeEvent, eventTimer, EVENT_CATALOG, etc.) ...

let activeEvent = null;
let eventTimer = 0;
let nextEventCheckTime = 0;

const MIN_TIME_BETWEEN_EVENTS = 20000; // 20 seconds
const MAX_TIME_BETWEEN_EVENTS = 45000; // 45 seconds

// --- Event Catalog ---
// Each event needs: id, name (player-facing), duration (ms),
// effect_on_start(params), effect_on_end(params)
const EVENT_CATALOG = [
    {
        id: 'conveyor_speed_boost',
        name: "Conveyor Surge!",
        description: "Conveyor speed temporarily increased!",
        duration: 10000, // 10 seconds
        minDirectorLevel: 2, // Minimum AI Director level for this event
        originalConveyorSpeed: null, // To store original speed
        effect_on_start: () => {
            // Storing original speed is tricky if Conveyor.CONVEYOR_SPEED is const.
            // For now, let's assume Conveyor module can handle speed changes.
            // This event would be more complex if we need to revert precisely.
            // A simpler approach: Conveyor has a speedMultiplier.
            Conveyor.setSpeedModifier(1.5); // Conveyor needs setSpeedModifier()
            UIUpdater.showFeedbackMessage("EVENT: Conveyor Surge!", "info", 3000);
        },
        effect_on_end: () => {
            Conveyor.setSpeedModifier(1.0); // Revert to normal speed
            UIUpdater.showFeedbackMessage("Conveyor speed normalized.", "info", 2000);
        }
    },
    {
        id: 'rush_order_bonus',
        name: "Rush Order!",
        description: "Bonus points for next 2 completed orders!",
        duration: 30000, // 30 seconds or until 2 orders complete
        minDirectorLevel: 1,
        ordersAffected: 0,
        originalOrderCompleteFn: null, // To wrap OrderSystem.orderComplete
        effect_on_start: () => {
            // This is more complex: needs to modify scoring temporarily.
            // GameState might need a temporaryScoreMultiplier.
            GameState.setTemporaryBonus("rushOrder", 50); // GameState needs this function
            UIUpdater.showFeedbackMessage("EVENT: Rush Order! Bonus Creds!", "success", 3000);
        },
        effect_on_end: () => {
            GameState.clearTemporaryBonus("rushOrder");
            UIUpdater.showFeedbackMessage("Rush Order bonus ended.", "info", 2000);
        }
    },
    {
        id: 'sensor_glitch',
        name: "Sensor Glitch!",
        description: "Order display flickering!",
        duration: 7000, // 7 seconds
        minDirectorLevel: 3,
        effect_on_start: () => {
            document.getElementById('current-order-display')?.classList.add('text-flicker-strong'); // CSS class for effect
            UIUpdater.showFeedbackMessage("EVENT: Sensor Glitch!", "error", 3000);
        },
        effect_on_end: () => {
            document.getElementById('current-order-display')?.classList.remove('text-flicker-strong');
        }
    },
    // Add more events: "Fragile Items Only", "Corrupted Data Wave", "Low Visibility (dim screen)", "Specific Item Bonus Value"
];

function calculateNextEventTime() {
    return Math.random() * (MAX_TIME_BETWEEN_EVENTS - MIN_TIME_BETWEEN_EVENTS) + MIN_TIME_BETWEEN_EVENTS;
}

export function init() {
    activeEvent = null;
    eventTimer = 0;
    nextEventCheckTime = calculateNextEventTime();
    console.log("EventManager: Initialized. Next event check in approx:", (nextEventCheckTime / 1000).toFixed(1), "s");
}

export function update(deltaTime) { // deltaTime in milliseconds
    if (!GameState.isGameActive() || GameState.isGamePaused()) {
        return;
    }

    eventTimer += deltaTime;

    if (activeEvent) {
        // Check if current event duration has passed
        if (eventTimer >= activeEvent.duration) {
            console.log(`EventManager: Event "${activeEvent.name}" ended.`);
            activeEvent.effect_on_end();
            activeEvent = null;
            eventTimer = 0; // Reset timer for cooldown before next event can trigger
            nextEventCheckTime = calculateNextEventTime(); // Schedule next check
        }
    } else {
        // No active event, check if it's time to try triggering a new one
        if (eventTimer >= nextEventCheckTime) {
            tryToTriggerEvent();
            eventTimer = 0; // Reset timer regardless of trigger success
            // If an event was triggered, nextEventCheckTime is effectively its duration.
            // If not, schedule a new check.
            if (!activeEvent) {
                nextEventCheckTime = calculateNextEventTime();
            }
        }
    }
}

function tryToTriggerEvent() {
    const directorLevel = AIDirector.getCurrentDifficultyParams().orderComplexity; // Or a dedicated directorLevel from AIDirector
    const possibleEvents = EVENT_CATALOG.filter(event => directorLevel >= event.minDirectorLevel);

    if (possibleEvents.length === 0) {
        // console.log("EventManager: No possible events for current director level.");
        return;
    }

    // Basic random chance to trigger an event even if conditions are met
    if (Math.random() > 0.65) { // 35% chance to trigger an event per check cycle if one is possible
        console.log("EventManager: Event trigger chance did not pass this cycle.");
        return;
    }


    const randomIndex = Math.floor(Math.random() * possibleEvents.length);
    activeEvent = { ...possibleEvents[randomIndex] }; // Create a copy to store runtime data like originalSpeed

    console.log(`EventManager: Triggering event "${activeEvent.name}" for ${activeEvent.duration / 1000}s.`);
    activeEvent.effect_on_start();
    eventTimer = 0; // Reset eventTimer to count duration of this new event
    // nextEventCheckTime will be set when this event ends.
}

export function isEventActive(eventId) {
    return activeEvent && activeEvent.id === eventId;
}

console.log("EventManager: Module Loaded.");