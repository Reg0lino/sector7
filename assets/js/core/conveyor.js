// assets/js/core/conveyor.js - Manages items on the conveyor belt

import * as ItemFactory from './item-factory.js';
import * as ItemRenderer from '../graphics/item-renderer.js'; // We will create this next
import * as GameState from './game-state.js'; // To check if game is active
import * as UIUpdater from '../ui/ui-updater.js';

const conveyorBeltElement = document.getElementById('conveyor-belt');
let activeItems = []; // Array to hold data of items currently on the belt
let spawnTimer = 0;
const SPAWN_INTERVAL_MIN = 2000; // Minimum ms between spawns
const SPAWN_INTERVAL_MAX = 4000; // Maximum ms between spawns
let nextSpawnTime = calculateNextSpawnTime();

const CONVEYOR_SPEED = 50; // Pixels per second

function calculateNextSpawnTime() {
    return Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN) + SPAWN_INTERVAL_MIN;
}

export function init() {
    if (!conveyorBeltElement) {
        console.error("Conveyor: Conveyor belt element (#conveyor-belt) not found!");
        return;
    }
    activeItems = [];
    spawnTimer = 0;
    nextSpawnTime = calculateNextSpawnTime();
    conveyorBeltElement.innerHTML = ''; // Clear any old items on init
    console.log("Conveyor: Initialized.");
}

export function update(deltaTime) { // deltaTime in milliseconds
    if (!GameState.isGameActive() || GameState.isGamePaused()) {
        return;
    }

    // --- Item Spawning ---
    spawnTimer += deltaTime;
    if (spawnTimer >= nextSpawnTime) {
        spawnItem();
        spawnTimer = 0; // Reset timer
        nextSpawnTime = calculateNextSpawnTime();
    }

    // --- Item Movement & Removal ---
    const itemsToRemove = [];
    for (let i = 0; i < activeItems.length; i++) {
        const item = activeItems[i];
        item.position.x += (CONVEYOR_SPEED * (deltaTime / 1000)); // Move item

        // Update visual position
        ItemRenderer.updateItemPosition(item.id, item.position.x);

        // --- VOLATILE ITEM CHECK ---
        if (item.isVolatile && item.spawnTime && item.lifespan) {
            const timeAlive = performance.now() - item.spawnTime;
            // Visual feedback for timer (e.g., blinking faster - can be done in ItemRenderer based on timeAlive/lifespan)
            const itemElement = document.getElementById(item.id);
            if (itemElement) {
                const urgency = Math.max(0, 1 - (timeAlive / item.lifespan));
                if (urgency < 0.3) {
                    itemElement.style.animationDuration = `${0.2 + urgency * 0.5}s`;
                } else {
                    itemElement.style.animationDuration = '';
                }
            }
            if (timeAlive >= item.lifespan) {
                itemsToRemove.push(item);
                console.log(`Conveyor: VOLATILE Item ${item.id} exploded!`);
                UIUpdater.showFeedbackMessage(`VOLATILE OVERLOAD: '${item.name}' exploded!`, "error", 4000);
                GameState.addScore(-50);
                UIUpdater.updateScore(GameState.getScore());
                continue;
            }
        }

        // Check if item is off-screen (assuming conveyor width)
        const conveyorWidth = conveyorBeltElement.offsetWidth;
        if (item.position.x > conveyorWidth + 50) { // +50 as a buffer
            itemsToRemove.push(item);
            // Future: Penalize player for missed item
            console.log(`Conveyor: Item ${item.id} moved off screen.`);
            // UIUpdater.showFeedbackMessage("Item Missed!", "error");
            // GameState.addScore(-10); // Penalty
        }
    }

    // Remove items that are off-screen
    itemsToRemove.forEach(itemToRemove => {
        ItemRenderer.removeItemElement(itemToRemove.id);
        activeItems = activeItems.filter(item => item.id !== itemToRemove.id);
    });
}

function spawnItem() {
    if (!conveyorBeltElement) return;

    // For now, spawn a random item type. Later, this will be driven by the OrderSystem.
    const itemTypesArray = Object.values(ItemFactory.ITEM_TYPES);
    const randomType = itemTypesArray[Math.floor(Math.random() * itemTypesArray.length)];
    const newItemData = ItemFactory.createItem(randomType);

    if (newItemData) {
        newItemData.position = { x: -60, y: (conveyorBeltElement.clientHeight / 2) }; // Start off-screen to the left, centered vertically
        activeItems.push(newItemData);
        ItemRenderer.createItemElement(newItemData, conveyorBeltElement); // Create its DOM element
        console.log(`Conveyor: Spawned item ${newItemData.id} of type ${newItemData.type}`);
    }
}

export function getItemData(itemId) {
    return activeItems.find(item => item.id === itemId);
}

export function getAllActiveItems() {
    return activeItems.map(item => ({ id: item.id, type: item.type, name: item.name, x: item.position.x })); // Return a simplified version for logging
}

export function removeItemFromConveyor(itemId) {
    const itemToRemove = activeItems.find(item => item.id === itemId);
    if (itemToRemove) {
        ItemRenderer.removeItemElement(itemToRemove.id);
        activeItems = activeItems.filter(item => item.id !== itemToRemove.id);
        console.log(`Conveyor: Item ${itemId} removed explicitly.`);
        return itemToRemove; // Return data for processing (e.g. scoring)
    }
    return null;
}

console.log("Conveyor: Module Loaded.");

// Filename: conveyor.js
// Directory: assets/js/core/