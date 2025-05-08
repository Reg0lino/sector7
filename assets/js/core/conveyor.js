// assets/js/core/conveyor.js - Manages items on the conveyor belt

import * as ItemFactory from './item-factory.js';
import * as ItemRenderer from '../graphics/item-renderer.js';
import * as GameState from './game-state.js';
import * as AIDirector from './ai-director.js';
import * as GameLogic from './game-logic.js';
import * as UIUpdater from '../ui/ui-updater.js';
import * as OrderSystem from './order-system.js'; // Needed for spawnItem order logic
import * as UpgradesSystem from './upgrades-system.js'; // Add this

const conveyorBeltElement = document.getElementById('conveyor-belt');
let activeItems = [];
let spawnTimer = 0;

const SPAWN_INTERVAL_MIN = 2000;
const SPAWN_INTERVAL_MAX = 4000;

let spawnIntervalModifier = 1.0; // Default modifier
let baseSpawnIntervalMultiplier = 1.0; // For upgrades

export function adjustBaseSpawnIntervalMultiplier(factor) {
    baseSpawnIntervalMultiplier *= factor;
    // Clamp the multiplier if needed
    baseSpawnIntervalMultiplier = Math.max(0.5, Math.min(2.0, baseSpawnIntervalMultiplier)); // e.g., 0.5x to 2x speed
    console.log("Conveyor: Base spawn interval multiplier adjusted to", baseSpawnIntervalMultiplier);
}

// --- Conveyor speed logic for event effects ---
const BASE_CONVEYOR_SPEED = 50;
let speedModifier = 1.0;
let currentConveyorSpeed = BASE_CONVEYOR_SPEED;

export function setSpeedModifier(modifier) {
    speedModifier = Math.max(0.1, modifier); // Ensure it's not too slow or stopped
    currentConveyorSpeed = BASE_CONVEYOR_SPEED * speedModifier;
    console.log("Conveyor: Speed modifier set to", speedModifier, "New effective speed:", currentConveyorSpeed);
}

let nextSpawnTime = calculateNextSpawnTime();

const MISSED_ITEM_PENALTY = -10; // Define the penalty for missed items

function calculateNextSpawnTime() {
    const baseInterval = (Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN) + SPAWN_INTERVAL_MIN);
    // Apply AI director modifier AND base multiplier from upgrades
    return baseInterval * spawnIntervalModifier * baseSpawnIntervalMultiplier;
}

export function setSpawnRateModifier(modifier) {
    spawnIntervalModifier = Math.max(0.1, modifier);
    console.log("Conveyor: Spawn rate modifier set to", spawnIntervalModifier);
}

export function init() {
    if (!conveyorBeltElement) {
        console.error("Conveyor: Conveyor belt element (#conveyor-belt) not found!");
        return;
    }
    activeItems = [];
    spawnTimer = 0;
    // Re-initialize spawnIntervalModifier and nextSpawnTime if they can change per game session
    baseSpawnIntervalMultiplier = 1.0; // Reset upgrade effect on new game
    spawnIntervalModifier = 1.0; // Reset AI director effect
    nextSpawnTime = calculateNextSpawnTime();
    conveyorBeltElement.innerHTML = '';
    console.log("Conveyor: Initialized.");
}

export function update(deltaTime) { // deltaTime in milliseconds
    // --- DEBUG: Is update being called? ---
    // console.log(`Conveyor Update: deltaTime=${deltaTime}`); // Can be very noisy, enable if needed

    if (!GameState.isGameActive() || GameState.isGamePaused()) {
        return; // Do nothing if game isn't running
    }

    // --- Item Spawning ---
    spawnTimer += deltaTime;
    // --- DEBUG: Check timer values ---
    // console.log(`Conveyor Update: spawnTimer=${spawnTimer.toFixed(0)}, nextSpawnTime=${nextSpawnTime.toFixed(0)}`);

    if (spawnTimer >= nextSpawnTime) {
        // --- DEBUG: Is spawn condition met? ---
        console.log(`Conveyor Update: SPAWN TRIGGERED! (Timer: ${spawnTimer.toFixed(0)} >= Next: ${nextSpawnTime.toFixed(0)})`);
        spawnItem();
        spawnTimer = 0; // Reset timer
        nextSpawnTime = calculateNextSpawnTime();
        // --- DEBUG: What's the *next* spawn time? ---
        console.log(`Conveyor Update: New nextSpawnTime calculated: ${nextSpawnTime.toFixed(0)} ms`);
    }

    // --- Item Movement & Removal ---
    const itemsToRemoveData = [];
    for (let i = activeItems.length - 1; i >= 0; i--) {
        const item = activeItems[i];
        item.position.x += (currentConveyorSpeed * (deltaTime / 1000));

        ItemRenderer.updateItemPosition(item.id, item.position.x);

        const conveyorWidth = conveyorBeltElement.offsetWidth;
        if (item.position.x > conveyorWidth + 50) {
            itemsToRemoveData.push(item);
            activeItems.splice(i, 1);
            ItemRenderer.removeItemElement(item.id);
        }
    }

    itemsToRemoveData.forEach(itemData => {
        console.log(`Conveyor: Item ${itemData.id} (Type: ${itemData.type}) moved off screen.`);
        GameLogic.handleItemMissed(itemData);
    });
}

function spawnItem() {
    // --- DEBUG: Is spawnItem function being entered? ---
    console.log("Conveyor: spawnItem() called.");
    if (!conveyorBeltElement) {
        console.error("Conveyor: spawnItem() called but conveyorBeltElement is missing!");
        return;
    }

    const currentOrder = OrderSystem.getCurrentOrderDetails();
    let itemTypeToSpawn;
    const directorParams = AIDirector.getCurrentDifficultyParams(); // Assuming AIDirector is initialized
    const shouldSpawnOrderItem = currentOrder && Math.random() < (0.6 + (directorParams?.specialItemChance || 0));

    if (shouldSpawnOrderItem && currentOrder.quantityCollected < currentOrder.quantityRequired) {
        itemTypeToSpawn = currentOrder.itemTypeRequired;
        console.log(`Conveyor (spawnItem): Prioritizing order item: ${itemTypeToSpawn}`);
    } else {
        const itemTypesArray = Object.values(ItemFactory.ITEM_TYPES).filter(
            type => type !== ItemFactory.ITEM_TYPES.SCRAP && type !== ItemFactory.ITEM_TYPES.CORRUPTED
        );
        if (itemTypesArray.length > 0) {
            itemTypeToSpawn = itemTypesArray[Math.floor(Math.random() * itemTypesArray.length)];
            console.log(`Conveyor (spawnItem): Spawning random type: ${itemTypeToSpawn}`);
        } else {
            itemTypeToSpawn = ItemFactory.ITEM_TYPES.DATACHIP; // Fallback
            console.log(`Conveyor (spawnItem): No random types available, falling back to: ${itemTypeToSpawn}`);
        }
    }
    // --- DEBUG: What type are we trying to create? ---
    console.log(`Conveyor (spawnItem): Attempting to create item of type: ${itemTypeToSpawn}`);

    const newItemData = ItemFactory.createItem(itemTypeToSpawn);

    // --- DEBUG: Did ItemFactory succeed? ---
    if (newItemData) {
        console.log(`Conveyor (spawnItem): ItemFactory created data for ${newItemData.id}`);
        newItemData.position = { x: -80, y: (conveyorBeltElement.clientHeight / 2) }; // Start further off-screen
        activeItems.push(newItemData);
        // --- DEBUG: Calling ItemRenderer ---
        console.log(`Conveyor (spawnItem): Calling ItemRenderer.createItemElement for ${newItemData.id}`);
        ItemRenderer.createItemElement(newItemData, conveyorBeltElement);
    } else {
        // --- DEBUG: ItemFactory failed ---
        console.error(`Conveyor (spawnItem): ItemFactory.createItem returned null/undefined for type: ${itemTypeToSpawn}`);
    }
}

export function getItemData(itemId) {
    return activeItems.find(item => item.id === itemId);
}

export function removeItemFromConveyor(itemId) {
    console.log(`Conveyor: Attempting to remove item ${itemId} from data and call renderer.`); // Add log
    const itemIndex = activeItems.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const itemToRemove = activeItems[itemIndex];
        activeItems.splice(itemIndex, 1); // Remove from data array first

        // --- Directly call ItemRenderer to remove the element ---
        // Pass the ID, ItemRenderer will find the element by ID.
        ItemRenderer.removeItemElement(itemToRemove.id);

        console.log(`Conveyor: Item ${itemId} removed from data, renderer notified.`);
        return itemToRemove; // Return the data for GameLogic processing
    } else {
        console.warn(`Conveyor: Could not find item ${itemId} in activeItems data array for removal.`);
        return null;
    }
}

// console.log("Conveyor: Module Loaded."); // Already at the end from previous script