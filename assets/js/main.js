// assets/js/main.js - Game initialization, main loop orchestration

import * as GameState from './core/game-state.js';
import * as UIUpdater from './ui/ui-updater.js';
import * as Renderer from './graphics/renderer.js';
import * as ModalSystem from './ui/modal-system.js';
import * as BinSystem from './core/bin-system.js';
import * as ItemFactory from './core/item-factory.js'; // Used by OrderSystem & Conveyor
import * as Conveyor from './core/conveyor.js';
import * as OrderSystem from './core/order-system.js';
import * as AIDirector from './core/ai-director.js';
import * as EventManager from './gameplay/event-manager.js';
import * as UpgradesSystem from './core/upgrades-system.js';
import * as PlayerState from './core/player-state.js'; // Ensure PlayerState is imported
import * as ItemRenderer from './graphics/item-renderer.js';
import * as BackgroundEffects from './graphics/background-effects.js';

// --- Main Game Initialization Function ---
function initGame() {
    console.log('Sector 7 Market Scramble: Initializing Game...');

    // 1. Initialize Game State (score, time, etc.)
    GameState.init();
    console.log('Main: GameState initialized.');

    // 2. Initialize UI Updater (link to DOM elements and set initial values)
    UIUpdater.init();
    console.log('Main: UIUpdater initialized.');

    // --- Ensure ItemRenderer is defined and initTooltip is callable ---
    if (typeof ItemRenderer !== 'undefined' && typeof ItemRenderer.initTooltip === 'function') {
        ItemRenderer.initTooltip();
        console.log('Main: ItemTooltip initialized.');
    } else {
        console.error('Main: ItemRenderer or ItemRenderer.initTooltip is not defined! Check import.');
    }

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

    // --- ADD THIS ---
    EventManager.init();
    console.log('Main: EventManager initialized.');

    // --- INITIALIZE AI DIRECTOR ---
    AIDirector.init();
    console.log('Main: AIDirector initialized.');

    // --- INITIALIZE UPGRADES SYSTEM ---
    UpgradesSystem.init();
    console.log('Main: UpgradesSystem initialized.');

    // --- INITIALIZE BACKGROUND EFFECTS ---
    BackgroundEffects.init(); // Needs game-container
    console.log('Main: BackgroundEffects initialized.');

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
    PlayerState.init(); // Initialize PlayerState ONCE when DOM is ready
    initGame(); // Call our main initialization function
});

console.log('Main.js: Module Loaded.');

// Filename: main.js
// Directory: assets/js/