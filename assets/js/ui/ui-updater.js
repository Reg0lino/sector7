// assets/js/ui/ui-updater.js - Updates score, timer, orders display, feedback messages, etc.

import * as GameState from '../core/game-state.js'; // To get initial time

// --- Private variables to hold references to DOM elements ---
let scoreDisplay = null;
let timeDisplay = null;
let orderDisplay = null;
// let feedbackContainer = null; // We removed this from HTML
let logFeedList = null; // Reference to the UL element for the log

const MAX_FEEDBACK_MESSAGES = 3; // Max messages to show at once
const MAX_LOG_ENTRIES = 20; // Keep the log from growing indefinitely
const TYPING_SPEED_MS = 20; // Milliseconds per character
const GLITCH_CHANCE = 0.10; // 10% chance for a character to glitch briefly
const GLITCH_DURATION_MS = 40;
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
let activeFeedbackMessages = []; // To keep track of message elements

// --- Initialization: Called once when the game loads to grab DOM elements ---
export function init() {
    scoreDisplay = document.getElementById('current-score-display');
    timeDisplay = document.getElementById('time-left-display');
    orderDisplay = document.getElementById('current-order-display');
    logFeedList = document.getElementById('log-feed-list');

    // Safety checks to ensure all elements were found
    if (!scoreDisplay) console.error('UIUpdater Error: Score display element not found! ID: current-score-display');
    if (!timeDisplay) console.error('UIUpdater Error: Time display element not found! ID: time-left-display');
    if (!orderDisplay) console.error('UIUpdater Error: Order display element not found! ID: current-order-display');
    if (!logFeedList) console.error('UIUpdater Error: Log feed list element (#log-feed-list) not found!');

    // Set initial text if desired (or use HTML defaults)
    updateScore(GameState.getScore()); // Get initial score from GameState
    updateTime(GameState.getInitialTime()); // Get initial time from GameState
    updateOrders(GameState.getCurrentOrder() || "Awaiting first assignment...");

    // Listen for game state changes to potentially update UI further (e.g., on gameOver)
    document.addEventListener('gamestatechanged', handleGameStateChange);

    console.log('UIUpdater: Initialized and UI elements linked.');
}

// --- Public Update Functions ---

export function updateScore(newScore) {
    if (scoreDisplay) {
        scoreDisplay.textContent = newScore;
        scoreDisplay.dataset.text = newScore; // For the glitch effect in CSS
    } else {
        console.warn('UIUpdater: Attempted to update score, but scoreDisplay element is not linked.');
    }
}

export function updateTime(secondsLeft) {
    if (timeDisplay) {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeDisplay.textContent = formattedTime;
        timeDisplay.dataset.text = formattedTime; // For the glitch effect
    } else {
        console.warn('UIUpdater: Attempted to update time, but timeDisplay element is not linked.');
    }
}

export function updateOrders(orderInfo) { // orderInfo can be simple text or a structured object
    if (orderDisplay) {
        if (typeof orderInfo === 'string') {
            orderDisplay.textContent = orderInfo;
        } else if (orderInfo && typeof orderInfo === 'object') {
            // Example for a structured order object:
            // orderInfo = { item: "Data Chip", quantity: "1/3", target: "Alpha" }
            let qtyText = orderInfo.progress !== undefined
                ? `${orderInfo.progress}/${orderInfo.quantity || 'N/A'}`
                : `${orderInfo.quantity || 'N/A'}`;
            // If quantity is already a string like "1/3", just use it
            if (typeof orderInfo.quantity === 'string') {
                qtyText = orderInfo.quantity;
            }
            let orderHTML = `REQ: <span class="order-quantity">${qtyText}</span> `;
            orderHTML += `<span class="order-item-name">${orderInfo.item || 'UNKNOWN ITEM'}</span>`;
            if(orderInfo.target) {
                orderHTML += ` → <span class="order-target-bin">${orderInfo.target}</span>`;
            }
            orderDisplay.innerHTML = orderHTML;
        } else {
            orderDisplay.textContent = "Order data corrupted...";
        }
    } else {
        console.warn('UIUpdater: Attempted to update orders, but orderDisplay element is not linked.');
    }
}

async function streamTextWithGlitch(targetElement, fullMessage) {
    targetElement.innerHTML = '';
    targetElement.classList.add('is-streaming');
    const characters = Array.from(fullMessage);
    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        const span = document.createElement('span');
        if (char === ' ' && Math.random() < GLITCH_CHANCE / 2) {
            const tempGlitchChar = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            span.textContent = tempGlitchChar;
            span.classList.add('glitch-char-temp');
            targetElement.appendChild(span);
            await new Promise(resolve => setTimeout(resolve, GLITCH_DURATION_MS / 2));
            span.textContent = char;
            span.classList.remove('glitch-char-temp');
            span.style.opacity = 1;
        } else if (char !== ' ' && Math.random() < GLITCH_CHANCE) {
            const tempGlitchChar = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            span.textContent = tempGlitchChar;
            span.classList.add('glitch-char-temp');
            targetElement.appendChild(span);
            await new Promise(resolve => setTimeout(resolve, GLITCH_DURATION_MS));
            span.textContent = char;
            span.classList.remove('glitch-char-temp');
            span.style.opacity = 1;
        } else {
            span.textContent = char;
            targetElement.appendChild(span);
            span.style.opacity = 1;
        }
        await new Promise(resolve => setTimeout(resolve, TYPING_SPEED_MS));
    }
    targetElement.classList.remove('is-streaming');
}

export function showFeedbackMessage(message, type = 'info') {
    if (typeof message !== 'string') {
        console.error("UIUpdater: showFeedbackMessage called with non-string message. Message:", message);
        message = String(message || "System Alert: Undefined message content.");
    }
    if (!logFeedList) {
        console.warn('UIUpdater: Log feed list not found, cannot show message.');
        return;
    }
    const logEntryEl = document.createElement('li');
    logEntryEl.classList.add('log-entry', `log-${type}`);
    const timestamp = `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}] `;
    const fullMessageWithTimestamp = timestamp + message;
    // Insert at the top
    if (logFeedList.firstChild) {
        logFeedList.insertBefore(logEntryEl, logFeedList.firstChild);
    } else {
        logFeedList.appendChild(logEntryEl);
    }
    streamTextWithGlitch(logEntryEl, fullMessageWithTimestamp);
    // Scroll to top to show newest
    if (logFeedList.parentElement) {
        logFeedList.parentElement.scrollTop = 0;
    }
    // Remove oldest (bottom) if over limit
    while (logFeedList.children.length > MAX_LOG_ENTRIES) {
        // console.log(`UIUpdater Loop Start: children.length=${logFeedList.children.length}`); // Optional: for deep debugging
        const oldestChild = logFeedList.lastChild;

        if (!oldestChild) {
            // If there's no oldestChild, we absolutely cannot proceed.
            // console.error("UIUpdater FATAL: logFeedList.lastChild is null even though children.length > MAX. Breaking.");
            break;
        }

        // Log the state of oldestChild JUST BEFORE trying to access classList
        // console.log("UIUpdater Pre-Check: oldestChild is:", oldestChild, "classList:", oldestChild.classList);

        // Check if classList itself exists before trying to use .contains()
        if (oldestChild.classList && oldestChild.classList.contains('is-streaming') && logFeedList.children.length <= (MAX_LOG_ENTRIES + 3)) {
            // console.log("UIUpdater: Oldest log entry is still streaming, delaying removal (within buffer).");
            break;
        }

        // If we reach here, either oldestChild.classList didn't exist (which is bad),
        // it wasn't streaming, or we are beyond the buffer.
        // console.log("UIUpdater: Removing oldest log entry:", oldestChild.textContent ? oldestChild.textContent.substring(0,20) + "..." : "Empty Node");
        try {
            logFeedList.removeChild(oldestChild);
        } catch (e) {
            // console.error("UIUpdater: Error removing oldestChild. It might have been removed by another process.", e);
            // If an error occurs here, it might mean the child was already gone.
            // The loop condition will be checked again.
            break; // Exit loop to prevent potential infinite loop if removeChild fails consistently
        }
    }
}

// --- Private Functions ---

function handleGameStateChange(event) {
    const { state, score: finalScore, reason } = event.detail;
    if (state === 'gameOver') {
        console.log('UIUpdater: Received game over event.');
        if (reason === 'timeUp') {
            showFeedbackMessage(`TIME'S UP! Final Score: ${finalScore}`, 'error', 6000);
        } else {
            showFeedbackMessage(`SHIFT ENDED. Final Score: ${finalScore}`, 'info', 6000);
        }
        // Here you could also trigger a specific Game Over modal directly from UIUpdater
        // Or ensure the score and time displays are correctly showing final values
        updateScore(finalScore);
        updateTime(0); // Explicitly set time to 00:00
    }
}

// Add more functions here to update other UI parts like modals, character status, etc.

console.log('UIUpdater: Module Loaded.');

// Filename: ui-updater.js
// Directory: assets/js/ui/