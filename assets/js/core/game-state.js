// assets/js/core/game-state.js - Score, time, orders, player progress

// --- Private State Variables ---
let score = 0;
let timeLeft = 120; // Default starting time in seconds
let currentOrder = null; // Will hold the current active order object
let gameActive = false;  // Is the game currently running? (e.g., not in a menu or game over screen)
let gamePaused = false;  // Is the game paused mid-action?

const initialTime = 120; // Store initial time for resets

let temporaryBonuses = {}; // e.g., { rushOrder: 50, fragileBonus: 20 }

import * as OrderSystem from './order-system.js'; // To fail the order

// --- Initialization ---
export function init() {
    score = 0;
    timeLeft = initialTime;
    currentOrder = null; // Reset to null, will be set by order-system later
    gameActive = false;  // Game usually starts inactive until player triggers start (e.g. closing intro modal)
    gamePaused = false;
    console.log('GameState: Initialized. Score, Time, and Status reset.');
    // Future: Load any saved progress from local storage here
}

// --- Game Flow Control ---
export function startGame() {
    console.log("GameState.startGame(): ENTERED"); // <-- ADD THIS
    if (gameActive) {
        console.warn('GameState: startGame() called but game is already active.');
        return;
    }
    gameActive = true;
    gamePaused = false; // Ensure not paused when starting
    timeLeft = initialTime; // Reset time on new game start
    score = 0; // Reset score on new game start
    console.log('GameState: Game Started. Good luck, Runner!');
    // Future: trigger initial order generation, start game loop
}

export function pauseGame() {
    if (!gameActive) {
        console.warn('GameState: pauseGame() called but game is not active.');
        return;
    }
    if (gamePaused) {
        console.warn('GameState: pauseGame() called but game is already paused.');
        return;
    }
    gamePaused = true;
    console.log('GameState: Game Paused.');
    // Future: stop animations, mute certain sounds
}

export function resumeGame() {
    if (!gameActive) {
        console.warn('GameState: resumeGame() called but game is not active.');
        return;
    }
    if (!gamePaused) {
        console.warn('GameState: resumeGame() called but game is not paused.');
        return;
    }
    gamePaused = false;
    console.log('GameState: Game Resumed.');
    // Future: restart animations, unmute sounds
}

export function gameOver() {
    if (!gameActive && !gamePaused) {
        // console.warn("GameState: gameOver() called but game not currently active or paused.");
        // return; // Allow proceeding to show modal regardless for robustness
    }
    const finalScore = score; // Capture score before it might be reset elsewhere
    gameActive = false;
    gamePaused = false;
    console.log(`GameState: GAME OVER. Final Score: ${finalScore}`);

    // --- IF GAME OVER DUE TO TIME AND ORDER IS ACTIVE, FAIL IT ---
    if (timeLeft <= 0 && currentOrder) {
        OrderSystem.failCurrentOrder("Time Expired"); // This will notify AIDirector
    }

    // Dispatch event for ModalSystem to pick up
    document.dispatchEvent(new CustomEvent('showmodal', {
        detail: {
            type: 'gameOver',
            score: finalScore, // Pass the score to the modal
            reason: timeLeft <= 0 ? 'timeUp' : 'manual'
        }
    }));

    // The game loop in renderer.js will see gameActive is false and stop.
}

// --- Time Management ---
export function decreaseTime(amount = 1) {
    if (gameActive && !gamePaused && timeLeft > 0) {
        timeLeft -= amount;
        if (timeLeft <= 0) {
            timeLeft = 0;
            // --- THIS IS IMPORTANT ---
            // Game over can be called from here, which will set gameActive = false
            // The loop in renderer.js will then naturally stop on its next check.
            gameOver();
        }
    }
    return timeLeft;
}

export function addTime(amount) {
    if (gameActive) {
        timeLeft += amount;
        console.log(`GameState: Time added. New time: ${timeLeft}s`);
    }
}

export function resetTime() {
    timeLeft = initialTime;
    console.log(`GameState: Timer reset to ${initialTime}s.`);
}


// --- Score Management ---
export function addScore(points) {
    if (gameActive) {
        score += points;
        console.log(`GameState: Score updated. Added ${points}. New score: ${score}`);
    }
    return score;
}

export function setScore(newScore) {
    score = newScore;
    console.log(`GameState: Score set directly to ${newScore}.`);
}

// --- Order Management ---
export function setCurrentOrder(order) {
    currentOrder = order; // order can be an object or null
    if (order) {
        console.log('GameState: New order set.', order);
    } else {
        console.log('GameState: Current order cleared.');
    }
    // UIUpdater.updateOrders is now called by OrderSystem directly when an order is generated/updated
}

// --- Temporary Bonuses Management ---
export function setTemporaryBonus(bonusId, bonusValue) {
    temporaryBonuses[bonusId] = bonusValue;
    console.log(`GameState: Temporary bonus "${bonusId}" of ${bonusValue} activated.`);
}

export function clearTemporaryBonus(bonusId) {
    if (temporaryBonuses[bonusId]) {
        console.log(`GameState: Temporary bonus "${bonusId}" cleared.`);
        delete temporaryBonuses[bonusId];
    }
}

export function getActiveBonusesValue() {
    let totalBonus = 0;
    for (const bonusId in temporaryBonuses) {
        totalBonus += temporaryBonuses[bonusId];
    }
    return totalBonus;
}

// --- Getters (to safely access state from other modules) ---
export function getScore() { return score; }
export function getTimeLeft() { return timeLeft; }
export function getCurrentOrder() { return currentOrder; }
export function isGameActive() { return gameActive; }
export function isGamePaused() { return gamePaused; }
export function getInitialTime() { return initialTime; }

console.log('GameState: Module Loaded.');