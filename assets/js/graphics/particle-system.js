// assets/js/utils/localstorage.js - Handles saving and loading data from localStorage

const GAME_PREFIX = "sector7MarketScramble_";

/**
 * Saves data to localStorage with the game's prefix.
 * @param {string} key - The key to save data under (without prefix).
 * @param {any} data - The data to save (will be JSON.stringified).
 */
export function saveData(key, data) {
    try {
        const prefixedKey = GAME_PREFIX + key;
        localStorage.setItem(prefixedKey, JSON.stringify(data));
        console.log(`LocalStorage: Saved data for key "${prefixedKey}".`);
    } catch (error) {
        console.error(`LocalStorage: Error saving data for key "${key}".`, error);
        // Potentially notify user if storage is full or unavailable
    }
}

/**
 * Loads data from localStorage.
 * @param {string} key - The key to load data from (without prefix).
 * @returns {any | null} The parsed data or null if not found or error.
 */
export function loadData(key) {
    try {
        const prefixedKey = GAME_PREFIX + key;
        const dataString = localStorage.getItem(prefixedKey);
        if (dataString === null) {
            // console.log(`LocalStorage: No data found for key "${prefixedKey}".`);
            return null;
        }
        console.log(`LocalStorage: Loaded data for key "${prefixedKey}".`);
        return JSON.parse(dataString);
    } catch (error) {
        console.error(`LocalStorage: Error loading or parsing data for key "${key}".`, error);
        return null;
    }
}

/**
 * Removes data from localStorage.
 * @param {string} key - The key to remove (without prefix).
 */
export function removeData(key) {
    try {
        const prefixedKey = GAME_PREFIX + key;
        localStorage.removeItem(prefixedKey);
        console.log(`LocalStorage: Removed data for key "${prefixedKey}".`);
    } catch (error) {
        console.error(`LocalStorage: Error removing data for key "${key}".`, error);
    }
}

console.log("LocalStorage: Module Loaded.");