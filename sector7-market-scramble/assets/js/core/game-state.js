// assets/js/core/game-state.js - Score, time, orders, player progress

let score = 0;
let timeLeft = 120; // seconds
let currentOrder = null;
let gameActive = false;
let gamePaused = false;

const initialTime = 120;

export function init() {
    score = 0;
    timeLeft = initialTime;
    currentOrder = null; // Will be set by order-system
    gameActive = false; // Game starts inactive until player action (e.g. modal close)
    gamePaused = false;
    console.log('GameState initialized.');
}

export function startGame() {
    gameActive = true;
    console.log('Game has started.');
}

export function pauseGame() {
    if (!gameActive) return;
    gamePaused = true;
    console.log('Game paused.');
}

export function resumeGame() {
    if (!gameActive) return;
    gamePaused = false;
    console.log('Game resumed.');
}

export function resetTime() {
    timeLeft = initialTime;
}

export function decreaseTime() {
    if (gameActive && !gamePaused && timeLeft > 0) {
        timeLeft--;
    }
    return timeLeft;
}

export function addScore(points) {
    if (gameActive) {
        score += points;
    }
    return score;
}

export function setCurrentOrder(order) {
    currentOrder = order;
}

// --- Getters ---
export function getScore() { return score; }
export function getTimeLeft() { return timeLeft; }
export function getCurrentOrder() { return currentOrder; }
export function isGameActive() { return gameActive; }
export function isGamePaused() { return gamePaused; }