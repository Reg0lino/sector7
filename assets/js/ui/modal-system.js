// assets/js/ui/modal-system.js - Manages modals for start, pause, game over, settings etc.

import * as GameState from '../core/game-state.js';
import * as Renderer from '../graphics/renderer.js';
import * as OrderSystem from '../core/order-system.js';
import * as UpgradesSystem from '../core/upgrades-system.js';
import * as UIUpdater from './ui-updater.js';
import * as PlayerState from '../core/player-state.js'; // Need this to get Creds
import * as Conveyor from '../core/conveyor.js';

let modalOverlay = null;
let modalContent = null;
let currentlyOpenModalType = null;

export function init() {
    modalOverlay = document.getElementById('modal-overlay');
    modalContent = document.getElementById('modal-content');

    if (!modalOverlay || !modalContent) {
        console.error("ModalSystem Error: Modal overlay or content element not found!");
        return;
    }

    // Close modal if overlay is clicked (optional, good UX, but careful with game state)
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            // Avoid closing critical modals this way
            if (currentlyOpenModalType === 'initialLoad' || currentlyOpenModalType === 'gameOver' || currentlyOpenModalType === 'pauseMenu') {
                return;
            }
            // Maybe close the shop? Or require explicit button click. For now, allow closing shop this way.
            if (currentlyOpenModalType === 'upgradesShop') {
                 closeModalAndHandleState();
            }
        }
    });

    console.log("ModalSystem: Initialized.");
    showModal('initialLoad'); // Show initial "Start Game" modal
}

// Helper function to close modal and manage game state (pause/resume)
function closeModalAndHandleState() {
    const wasPausedForModal = GameState.isGamePaused() && currentlyOpenModalType === 'upgradesShop'; // Or other pause-inducing modals
    closeModal();
    if (wasPausedForModal && GameState.isGameActive()) { // Check if game is active, might have ended while shop was open
        GameState.resumeGame();
    }
}

export function showModal(type, data = {}) {
    if (!modalOverlay || !modalContent) return;

    // If game is active and not paused, pause it when opening non-game-over modals
    if (GameState.isGameActive() && !GameState.isGamePaused() && type !== 'gameOver') {
        GameState.pauseGame();
    }

    currentlyOpenModalType = type;
    let htmlContent = '';

    switch (type) {
        case 'initialLoad':
        case 'startMenu':
            htmlContent = `
                <h2>SECTOR 7 MARKET SCRAMBLE</h2>
                <p>Another shift, another chance to earn your creds. Sort the chaos, Runner.</p>
                <div class="modal-button-group">
                    <button id="start-game-button" class="modal-button-primary">Start Shift</button>
                    <button id="open-upgrades-shop-button">Chop Shop</button>
                </div>
            `;
            break;

        case 'gameOver':
            // Access data passed from GameState: score, highScore, totalCreds
            const score = data.score !== undefined ? data.score : 0;
            const highScore = data.highScore !== undefined ? data.highScore : 0;
            const totalCreds = data.totalCreds !== undefined ? data.totalCreds : PlayerState.getTotalCreds(); // Get latest if not passed
            htmlContent = `
                <h2>TRANSMISSION LOST</h2>
                <p>Shift ended. Status:</p>
                <p>Shift Score: <span class="modal-score">${score}</span></p>
                <p>High Score: <span class="modal-score">${highScore}</span></p>
                <p>Total Creds: <span class="modal-score">${totalCreds}</span></p>
                <div class="modal-button-group">
                    <button id="restart-game-button" class="modal-button-primary">Retry Shift</button>
                    <button id="open-upgrades-shop-button">Chop Shop</button>
                </div>
            `;
            break;

        case 'pauseMenu':
            htmlContent = `
                <h2>SHIFT PAUSED</h2>
                <p>The market waits...</p>
                 <div class="modal-button-group">
                    <button id="resume-game-button" class="modal-button-primary">Resume Shift</button>
                    <button id="open-upgrades-shop-button">Chop Shop</button>
                     <button id="quit-game-button" style="opacity:0.5;">Quit (NYI)</button>
                </div>
            `;
            break;

        case 'upgradesShop':
            const availableUpgrades = UpgradesSystem.getAvailableUpgrades();
            const purchasedUpgradesList = UpgradesSystem.getPurchasedUpgrades();
            const currentCreds = PlayerState.getTotalCreds(); // Get current persistent Creds

            htmlContent = `<h2>CHOP SHOP - Augmentations</h2>`;
            htmlContent += `<p class="creds-display">Creds Available: <span class="glitch-text">${currentCreds}</span> C</p>`;
            htmlContent += `<div class="upgrades-list-container">`;

            if (availableUpgrades.length === 0 && purchasedUpgradesList.length > 0) {
                htmlContent += `<p>All available augmentations installed.</p>`;
            } else if (availableUpgrades.length === 0 && purchasedUpgradesList.length === 0) {
                htmlContent += `<p>No augmentations currently available.</p>`;
            }

            availableUpgrades.forEach(upg => {
                const canAfford = currentCreds >= upg.cost;
                htmlContent += `<div class="upgrade-item ${canAfford ? '' : 'cannot-afford'}">
                                  <div class="upgrade-item-header">
                                    <h4>${upg.name}</h4>
                                    <span class="upgrade-cost">${upg.cost} C</span>
                                  </div>
                                  <p class="upgrade-description">${upg.description}</p>
                                  <button class="purchase-upgrade-button" data-upgrade-id="${upg.id}" ${canAfford ? '' : 'disabled'}>Install</button>
                                </div>`;
            });
            htmlContent += `</div>`; // end upgrades-list-container

            if (purchasedUpgradesList.length > 0) {
                htmlContent += `<h3 class="installed-augs-header">Installed Augs:</h3><ul class="installed-augs-list">`;
                purchasedUpgradesList.forEach(upg => {
                    htmlContent += `<li>${upg.name}</li>`;
                });
                htmlContent += `</ul>`;
            }

            htmlContent += `<button id="close-modal-button" class="modal-button-secondary">Exit Shop</button>`;
            break;

        default:
            htmlContent = `<p>Unknown modal type: ${type}</p><button id="close-modal-button">Close</button>`;
    }

    modalContent.innerHTML = htmlContent;
    modalOverlay.classList.remove('hidden');
    modalContent.querySelector('button:not([disabled])')?.focus(); // Focus first non-disabled button

    // --- INERT LOGIC - Seems fixed, keep it ---
    Array.from(document.body.children).forEach(child => {
        if (child !== modalOverlay && !child.contains(modalOverlay)) child.inert = true;
    });

    addModalButtonListeners(type); // Add listeners AFTER content is set
}


function addModalButtonListeners(type) {
    const startGameButton = document.getElementById('start-game-button');
    const restartGameButton = document.getElementById('restart-game-button');
    const resumeGameButton = document.getElementById('resume-game-button');
    const openUpgradesShopButton = document.getElementById('open-upgrades-shop-button');
    const closeModalButton = document.getElementById('close-modal-button'); // Generic close / Exit Shop

    // Remove previous listeners specifically for dynamic buttons to avoid duplicates
    document.querySelectorAll('.purchase-upgrade-button').forEach(button => {
        button.replaceWith(button.cloneNode(true)); // Simple way to remove all listeners
    });

    // Re-add listeners for purchase buttons if they exist now
    document.querySelectorAll('.purchase-upgrade-button').forEach(button => {
        button.addEventListener('click', (event) => { // Use addEventListener
            const upgradeId = event.target.dataset.upgradeId;
            if (UpgradesSystem.purchaseUpgrade(upgradeId)) {
                showModal('upgradesShop'); // Refresh shop modal
            }
        });
    });


    // --- Standard Button Handlers ---
    if (startGameButton) {
        startGameButton.onclick = () => {
            closeModal();
            GameState.init(); // Reset shift state
            PlayerState.init(); // Ensure player state is loaded if not already
            UpgradesSystem.init(); // Apply passive upgrades from player state
            UIUpdater.updateScore(PlayerState.getTotalCreds()); // Show correct creds
            UIUpdater.updateTime(GameState.getInitialTime());
            Conveyor.init(); // Clear conveyor
            GameState.startGame();
            Renderer.startGameLoop();
            OrderSystem.generateNewOrder();
        };
    }

    if (restartGameButton) {
        restartGameButton.onclick = () => {
             // Functionally same as startGameButton now
             closeModal();
             GameState.init();
             PlayerState.init(); // Reload potentially updated high score/creds
             UpgradesSystem.init(); // Re-apply passives
             UIUpdater.updateScore(PlayerState.getTotalCreds());
             UIUpdater.updateTime(GameState.getInitialTime());
             Conveyor.init();
             GameState.startGame();
             Renderer.startGameLoop();
             OrderSystem.generateNewOrder();
        };
    }

    if (resumeGameButton) {
        resumeGameButton.onclick = () => {
            closeModalAndHandleState(); // Use helper
        };
    }

    if (openUpgradesShopButton) {
        openUpgradesShopButton.onclick = () => {
            showModal('upgradesShop'); // Switch to shop modal
        };
    }

    if (closeModalButton) { // Generic close button for unknown types
        closeModalButton.onclick = () => closeModal();
    }
}

function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('hidden');
    currentlyOpenModalType = null;
    // --- RE-ENABLE INERT ---
    Array.from(document.body.children).forEach(child => {
        if (child !== modalOverlay && !child.contains(modalOverlay)) child.inert = false;
    });
}

// Listener for external requests (e.g., game over)
document.addEventListener('showmodal', (event) => {
    const { type, ...data } = event.detail;
    showModal(type, data);
});


console.log("ModalSystem: Module Loaded.");