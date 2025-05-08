// assets/js/ui/modal-system.js - Manages modals for start, pause, game over, settings etc.

import * as GameState from '../core/game-state.js';
import * as Renderer from '../graphics/renderer.js';
import * as OrderSystem from '../core/order-system.js'; // Ensure this import is here
import * as UIUpdater from './ui-updater.js'; // Not strictly needed here but good for consistency if other modals use it
import * as Conveyor from '../core/conveyor.js'; // Needed for restart

let modalOverlay = null;
let modalContent = null;
let currentlyOpenModalType = null; // To prevent multiple modals or track current

export function init() {
    modalOverlay = document.getElementById('modal-overlay');
    modalContent = document.getElementById('modal-content');

    if (!modalOverlay || !modalContent) {
        console.error("ModalSystem Error: Modal overlay or content element not found!");
        return;
    }

    // Close modal if overlay is clicked (optional, good UX)
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay && currentlyOpenModalType !== 'initialLoad') { // Don't close initial modal this way
            // For some modals, you might not want this behavior, e.g., game over.
            // closeModal();
        }
    });

    console.log("ModalSystem: Initialized.");

    // Show initial "Start Game" modal
    showModal('initialLoad');
}

export function showModal(type, data = {}) {
    if (!modalOverlay || !modalContent) {
        console.error("ModalSystem: Cannot show modal, elements not found.");
        return;
    }

    currentlyOpenModalType = type;
    let htmlContent = '';

    switch (type) {
        case 'initialLoad':
        case 'startMenu':
            htmlContent = `
                <h2>SECTOR 7 MARKET SCRAMBLE</h2>
                <p>The neon glow of Sector 7 beckons. Another shift, another chance to earn your creds. Are you ready to sort the chaos?</p>
                <button id="start-game-button">Start Shift</button>
                <button id="settings-button" style="display:none;">Settings (NYI)</button>
            `;
            if (GameState.isGameActive()) GameState.pauseGame(); // Pause if game was somehow active
            break;
        case 'gameOver':
            htmlContent = `
                <h2>TRANSMISSION LOST</h2>
                <p>Time's up, Runner. The market waits for no one.</p>
                <p>Final Score: <span class="modal-score">${data.score !== undefined ? data.score : GameState.getScore()}</span></p>
                <button id="restart-game-button">Retry Shift</button>
                <button id="main-menu-button" style="display:none;">Main Menu (NYI)</button>
            `;
            break;
        case 'pauseMenu':
            htmlContent = `
                <h2>SHIFT PAUSED</h2>
                <p>Catch your breath. The conveyor never truly stops.</p>
                <button id="resume-game-button">Resume Shift</button>
                <button id="quit-to-menu-button" style="display:none;">Quit to Menu (NYI)</button>
            `;
            break;
        // Add more cases for settings, story, etc.
        default:
            htmlContent = `<p>Unknown modal type: ${type}</p><button id="close-modal-button">Close</button>`;
    }

    modalContent.innerHTML = htmlContent;
    modalOverlay.classList.remove('hidden');
    // Disable tabbing outside the modal (basic accessibility)
    // More complex solutions exist, but this is a start
    Array.from(document.body.children).forEach(child => {
        if (child !== modalOverlay) child.inert = true;
    });
    modalContent.querySelector('button')?.focus(); // Focus the first button

    // Add event listeners for buttons within this specific modal
    addModalButtonListeners(type);
}

function addModalButtonListeners(type) {
    console.log(`ModalSystem: Adding button listeners for modal type "${type}"`);
    const startGameButton = document.getElementById('start-game-button');
    const restartGameButton = document.getElementById('restart-game-button');
    const resumeGameButton = document.getElementById('resume-game-button');
    const closeModalButton = document.getElementById('close-modal-button'); // For generic close

    if (startGameButton) {
        console.log("ModalSystem: Found 'start-game-button'. Attaching click listener.");
        startGameButton.onclick = () => {
            console.log("ModalSystem: 'Start Shift' button CLIKED!");
            try {
                closeModal();
                console.log("ModalSystem: Modal closed.");

                GameState.startGame(); // Sets gameActive = true, resets score/time
                console.log("ModalSystem: GameState.startGame() called.");

                Renderer.startGameLoop(); // Starts the requestAnimationFrame loop
                console.log("ModalSystem: Renderer.startGameLoop() called.");

                OrderSystem.generateNewOrder(); // Generates the first order and updates UI
                console.log("ModalSystem: OrderSystem.generateNewOrder() called.");

                console.log("ModalSystem: Game start sequence complete from button click.");
            } catch (error) {
                console.error("ModalSystem: ERROR during start game sequence!", error);
                // Optionally show an error message to the user in the UI
                // UIUpdater.showFeedbackMessage("Critical error starting game!", "error", 5000);
            }
        };
    } else if (type === 'initialLoad' || type === 'startMenu') {
        console.warn("ModalSystem: 'start-game-button' NOT FOUND for modal type initialLoad/startMenu.");
    }

    if (restartGameButton) {
        console.log("ModalSystem: Found 'restart-game-button'. Attaching click listener.");
        restartGameButton.onclick = () => {
            console.log("ModalSystem: 'Retry Shift' button CLICKED!");
            try {
                closeModal();
                GameState.init(); // Full reset of score, time, active status
                // UIUpdater needs to re-initialize its display based on fresh GameState
                // This should be handled by UIUpdater.init() if we re-ran full game init,
                // or by manually calling update functions.
                // Let's ensure UI is correctly reflecting the reset state:
                // The following might be redundant if GameState.startGame() updates UI via events or direct calls.
                // However, explicit calls ensure the UI reflects the GameState.init() reset
                // *before* GameState.startGame() potentially changes it again.
                UIUpdater.updateScore(GameState.getScore());
                UIUpdater.updateTime(GameState.getInitialTime());
                UIUpdater.updateOrders("Awaiting first assignment..."); // Reset order display

                Conveyor.init(); // Reset conveyor, clear items

                GameState.startGame();
                Renderer.startGameLoop();
                OrderSystem.generateNewOrder();
                console.log("ModalSystem: Game restart sequence complete.");
            } catch (error) {
                console.error("ModalSystem: ERROR during restart game sequence!", error);
            }
        };
    } else if (type === 'gameOver') {
        console.warn("ModalSystem: 'restart-game-button' NOT FOUND for modal type gameOver.");
    }

    if (resumeGameButton) {
        resumeGameButton.onclick = () => {
            console.log("ModalSystem: 'Resume Shift' button CLICKED!");
            closeModal();
            GameState.resumeGame();
            // The game loop should automatically continue as it checks GameState.isPaused()
            console.log("ModalSystem: Game resumed.");
        };
    }

    if (closeModalButton) {
        closeModalButton.onclick = () => {
            console.log("ModalSystem: Generic 'Close' button CLICKED!");
            closeModal();
        };
    }
}

export function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('hidden');
    currentlyOpenModalType = null;
    // Re-enable tabbing for other elements
    Array.from(document.body.children).forEach(child => {
        if (child !== modalOverlay) child.inert = false;
    });
}

// Listen for external requests to show modals (e.g., from GameState on game over)
document.addEventListener('showmodal', (event) => {
    const { type, ...data } = event.detail;
    showModal(type, data);
});


console.log("ModalSystem: Module Loaded.");