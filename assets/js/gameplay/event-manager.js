// assets/js/gameplay/event-manager.js - Manages random market events and system glitches

import * as UIUpdater from '../ui/ui-updater.js';
import * as Conveyor from '../core/conveyor.js'; // To control conveyor speed
import * as GameState from '../core/game-state.js'; // To check if game is active

const EVENTS_CONFIG = {
    CONVEYOR_SURGE: {
        id: "conveyorSurge",
        name: "Conveyor Surge!",
        description: "Main drive overclocked! Hold on tight!",
        duration: 15000, // 15 seconds
        effect_on_start: function() {
            UIUpdater.showFeedbackMessage(`SYSTEM ALERT: ${this.name} ${this.description}`, "warning");
            Conveyor.setSpeedMultiplier(1.75); // 75% faster
        },
        effect_on_end: function() {
            UIUpdater.showFeedbackMessage(`SYSTEM NORMAL: ${this.name} ended. Conveyor speed stabilized.`, "info");
            Conveyor.setSpeedMultiplier(1.0); // Back to normal
        },
        weight: 10 // Chance of occurring
    },
    CONVEYOR_LAG: {
        id: "conveyorLag",
        name: "Conveyor Lag Spike!",
        description: "Power fluctuations... main drive sputtering!",
        duration: 20000, // 20 seconds
        effect_on_start: function() {
            UIUpdater.showFeedbackMessage(`SYSTEM ALERT: ${this.name} ${this.description}`, "warning");
            Conveyor.setSpeedMultiplier(0.5); // 50% slower
        },
        effect_on_end: function() {
            UIUpdater.showFeedbackMessage(`SYSTEM NORMAL: ${this.name} ended. Conveyor speed restored.`, "info");
            Conveyor.setSpeedMultiplier(1.0);
        },
        weight: 8
    },
    // Add more events later: "Data Scramble (item visuals obscure)", "Bin Malfunction", "Rush Order Bonus"
};

let activeEvents = []; // Array of { config, startTime, duration, isActive }
let eventCooldownTimer = 0; // Time since last event ended or game started
const MIN_TIME_BETWEEN_EVENTS = 30000; // 30 seconds minimum between events
const EVENT_CHECK_CHANCE_PER_SECOND = 0.05; // 5% chance per second to try to trigger an event (if cooldown passed)

export function init() {
    activeEvents = [];
    eventCooldownTimer = MIN_TIME_BETWEEN_EVENTS / 2; // Start with half cooldown
    console.log("EventManager: Initialized.");
}

function selectRandomEvent() {
    const availableEvents = Object.values(EVENTS_CONFIG).filter(event =>
        !activeEvents.find(active => active.config.id === event.id) // Don't pick an already active event
    );
    if (availableEvents.length === 0) return null;

    let totalWeight = availableEvents.reduce((sum, event) => sum + (event.weight || 1), 0);
    let randomNum = Math.random() * totalWeight;

    for (const event of availableEvents) {
        if (randomNum < (event.weight || 1)) {
            return event;
        }
        randomNum -= (event.weight || 1);
    }
    return null; // Should not happen if weights are positive
}

function tryToTriggerEvent() {
    if (activeEvents.length > 0) return; // Only one major event at a time for now
    if (eventCooldownTimer < MIN_TIME_BETWEEN_EVENTS) return;

    if (Math.random() < EVENT_CHECK_CHANCE_PER_SECOND) { // Check only once per second effectively
        const eventConfig = selectRandomEvent();
        if (eventConfig) {
            console.log(`EventManager: Triggering event "${eventConfig.name}" for ${eventConfig.duration / 1000}s.`);
            const newEvent = {
                config: eventConfig,
                startTime: performance.now(),
                duration: eventConfig.duration,
                isActive: true,
            };
            activeEvents.push(newEvent);

            if (typeof eventConfig.effect_on_start === 'function') {
                eventConfig.effect_on_start.call(eventConfig); // Use .call to set 'this' context
            }
            eventCooldownTimer = 0; // Reset cooldown
        }
    }
}

let timeSinceLastEventCheck = 0;

export function update(deltaTime) { // deltaTime in milliseconds
    if (!GameState.isGameActive() || GameState.isGamePaused()) return;

    eventCooldownTimer += deltaTime;
    timeSinceLastEventCheck += deltaTime;

    if (timeSinceLastEventCheck >= 1000) { // Check roughly every second
        tryToTriggerEvent();
        timeSinceLastEventCheck %= 1000; // Reset with remainder
    }

    // Update active events
    for (let i = activeEvents.length - 1; i >= 0; i--) {
        const event = activeEvents[i];
        if (!event.isActive) continue;

        // if (typeof event.config.update_effect === 'function') { // For ongoing effects
        //     event.config.update_effect.call(event.config, deltaTime);
        // }

        if (performance.now() - event.startTime >= event.duration) {
            console.log(`EventManager: Event "${event.config.name}" ended.`);
            event.isActive = false;
            if (typeof event.config.effect_on_end === 'function') {
                event.config.effect_on_end.call(event.config); // Use .call
            }
            activeEvents.splice(i, 1);
        }
    }
}

console.log("EventManager: Module Loaded.");
