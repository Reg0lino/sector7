// assets/js/main.js - Game initialization, main loop orchestration

import * as GameState from './core/game-state.js';
import * as UIUpdater from './ui/ui-updater.js';
import * as Renderer from './graphics/renderer.js';
import * as ModalSystem from './ui/modal-system.js';
import * as BinSystem from './core/bin-system.js';
import * as ItemFactory from './core/item-factory.js'; // Used by OrderSystem & Conveyor
import * as Conveyor from './core/conveyor.js';
import * as OrderSystem from './core/order-system.js';

// --- Main Game Initialization Function ---
function initGame() {
    console.log('Sector 7 Market Scramble: Initializing Game...');

    // 1. Initialize Game State (score, time, etc.)
    GameState.init();
    console.log('Main: GameState initialized.');

    // 2. Initialize UI Updater (link to DOM elements and set initial values)
    UIUpdater.init();
    console.log('Main: UIUpdater initialized.');

    // 3. Setup Bins
    BinSystem.initBins();
    console.log('Main: BinSystem initialized.');

    // 4. Initialize Item Factory
    // ItemFactory itself doesn't have an init(), but it's loaded.
    console.log('Main: ItemFactory loaded.');

    // 5. Initialize Conveyor
    Conveyor.init();
    console.log('Main: Conveyor initialized.');

    // 6. Initialize Order System
    OrderSystem.init();
    console.log('Main: OrderSystem initialized.');

    // 7. Initialize Modal System
    ModalSystem.init();
    console.log('Main: ModalSystem initialized. Initial modal should be visible.');

    // GameState.startGame() and Renderer.startGameLoop() are called from ModalSystem
    // AFTER the player clicks "Start Shift".
    // OrderSystem.generateNewOrder() will be called when the game actually starts.
    // Let's modify ModalSystem slightly to trigger the first order.

    console.log('Sector 7 Market Scramble: Initialization Complete. Awaiting player action via modal.');
}

// --- Event Listener for DOMContentLoaded ---
// Ensures the DOM is fully loaded and parsed before running any game initialization code.
document.addEventListener('DOMContentLoaded', () => {
    console.log('Main: DOM fully loaded and parsed.');
    initGame(); // Call our main initialization function
});

console.log('Main.js: Module Loaded.');