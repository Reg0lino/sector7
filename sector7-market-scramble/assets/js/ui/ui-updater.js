// assets/js/ui/ui-updater.js - Updates score, timer, orders display, feedback messages, etc.

import * as GameState from '../core/game-state.js'; // To get initial time

// --- Private variables to hold references to DOM elements ---
let scoreDisplay = null;
let timeDisplay = null;
let orderDisplay = null;
let feedbackContainer = null;
// Add more for other UI elements as needed, e.g., modal elements

// --- Initialization: Called once when the game loads to grab DOM elements ---
export function init() {
    scoreDisplay = document.getElementById('current-score-display');
    timeDisplay = document.getElementById('time-left-display');
    orderDisplay = document.getElementById('current-order-display');
    feedbackContainer = document.getElementById('feedback-message-container');

    // Safety checks to ensure all elements were found
    if (!scoreDisplay) console.error('UIUpdater Error: Score display element not found! ID: current-score-display');
    if (!timeDisplay) console.error('UIUpdater Error: Time display element not found! ID: time-left-display');
    if (!orderDisplay) console.error('UIUpdater Error: Order display element not found! ID: current-order-display');
    if (!feedbackContainer) console.error('UIUpdater Error: Feedback message container not found! ID: feedback-message-container');

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
            // orderInfo = { item: "Data Chip", quantity: 3, progress: 1, target: "Alpha" }
            let qtyText = orderInfo.progress !== undefined
                ? `${orderInfo.progress}/${orderInfo.quantity || 'N/A'}`
                : `${orderInfo.quantity || 'N/A'}`;
            let orderHTML = `REQ: <span class="order-quantity">${qtyText}</span> `;
            orderHTML += `<span class="order-item-name">${orderInfo.item || 'UNKNOWN ITEM'}</span>`;
            if(orderInfo.target) { // Changed from targetBin to target to match OrderSystem
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

export function showFeedbackMessage(message, type = 'info', duration = 3000) {
    if (!feedbackContainer) {
        console.warn('UIUpdater: Feedback container not found, cannot show message.');
        return;
    }

    const messageEl = document.createElement('div');
    messageEl.classList.add('feedback-message', type); // type can be 'success', 'error', 'info' as per effects.css
    messageEl.textContent = message;

    feedbackContainer.appendChild(messageEl);

    // Trigger enter animation (defined in effects.css or main.css)
    // We need to ensure the element is in the DOM before adding 'show' class for transition
    requestAnimationFrame(() => {
        messageEl.classList.add('show');
    });

    // Automatically remove the message after the duration
    setTimeout(() => {
        messageEl.classList.remove('show');
        // Wait for the fade-out transition to complete before removing the element
        messageEl.addEventListener('transitionend', () => {
            if (messageEl.parentElement) { // Check if still in DOM
                messageEl.remove();
            }
        }, { once: true }); // {once: true} ensures the listener is removed after firing
    }, duration);
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