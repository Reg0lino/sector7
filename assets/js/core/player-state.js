// assets/js/core/player-state.js - Manages persistent player data like Creds, high scores, reputation.

import * as LocalStorage from '../utils/localstorage.js';

const PLAYER_DATA_KEY = "playerData";

let playerData = {
    totalCreds: 0, // Player's accumulated currency
    highScore: 0,
    fixerReputation: {}, // Example: { 'fixerWhisper': 50, 'docNyx': 20 }
    purchasedUpgrades: [], // Array of upgrade IDs
    // Add more persistent stats: shiftsCompleted, favoriteFixer, etc.
};

export function init() {
    const loadedData = LocalStorage.loadData(PLAYER_DATA_KEY);
    if (loadedData) {
        // Merge loaded data with defaults to ensure new properties are added
        playerData = { ...playerData, ...loadedData };
        // Ensure sub-objects are also merged or initialized if not present in saved data
        playerData.fixerReputation = loadedData.fixerReputation || {};
        playerData.purchasedUpgrades = loadedData.purchasedUpgrades || [];
        console.log("PlayerState: Loaded player data.", playerData);
    } else {
        console.log("PlayerState: No saved player data found. Using defaults.");
        // Save initial default data if none exists
        savePlayerData();
    }
    console.log("PlayerState: Initialized.");
}

function savePlayerData() {
    LocalStorage.saveData(PLAYER_DATA_KEY, playerData);
}

// --- Creds Management ---
export function getTotalCreds() {
    return playerData.totalCreds;
}

export function addCreds(amount) {
    playerData.totalCreds += amount;
    playerData.totalCreds = Math.max(0, playerData.totalCreds); // Ensure creds don't go below 0
    console.log(`PlayerState: Creds changed by ${amount}. New total: ${playerData.totalCreds}`);
    savePlayerData();
    return playerData.totalCreds;
}

export function spendCreds(amount) {
    if (playerData.totalCreds >= amount) {
        playerData.totalCreds -= amount;
        savePlayerData();
        return true; // Purchase successful
    }
    return false; // Not enough creds
}

// --- High Score Management ---
export function getHighScore() {
    return playerData.highScore;
}

export function updateHighScore(currentShiftScore) {
    if (currentShiftScore > playerData.highScore) {
        playerData.highScore = currentShiftScore;
        console.log(`PlayerState: New High Score! ${playerData.highScore}`);
        savePlayerData();
        return true; // New high score set
    }
    return false;
}

// --- Fixer Reputation Management ---
export function getFixerReputation(fixerId) {
    return playerData.fixerReputation[fixerId] || 0; // Default to 0 rep if not set
}

export function changeFixerReputation(fixerId, amount) {
    if (!playerData.fixerReputation[fixerId]) {
        playerData.fixerReputation[fixerId] = 0;
    }
    playerData.fixerReputation[fixerId] += amount;
    // Clamp reputation if needed, e.g., between -100 and 100
    // playerData.fixerReputation[fixerId] = Math.max(-100, Math.min(100, playerData.fixerReputation[fixerId]));
    console.log(`PlayerState: Reputation for Fixer "${fixerId}" changed by ${amount}. New rep: ${playerData.fixerReputation[fixerId]}`);
    savePlayerData();
}

// --- Purchased Upgrades (basic for now, to be used by UpgradesSystem) ---
export function addPurchasedUpgrade(upgradeId) {
    if (!playerData.purchasedUpgrades.includes(upgradeId)) {
        playerData.purchasedUpgrades.push(upgradeId);
        savePlayerData();
    }
}
export function getPurchasedUpgradeIds() {
    return [...playerData.purchasedUpgrades]; // Return a copy
}


console.log("PlayerState: Module Loaded.");