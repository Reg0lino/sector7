// assets/js/main.js - Game initialization, main loop orchestration
import * as GameState from './core/game-state.js';
import * as UIUpdater from './ui/ui-updater.js';
import * as Renderer from './graphics/renderer.js';
import * as Conveyor from './core/conveyor.js';
import * as InputHandler from './core/input-handler.js';
import * as BinSystem from './core/bin-system.js'; // New module for bins
import { ParticleSystem } from './graphics/particle-system.js'; // Assuming ParticleSystem is a class
import { showModal, hideModal } from './ui/modal-system.js';


// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sector 7 Main: DOM fully loaded and parsed.');

    // Initialize core game systems
    GameState.init();
    UIUpdater.init(); // Initialize UI elements if needed
    BinSystem.initBins(); // Create the sorting bins
    InputHandler.init(); // Setup drag and drop, etc.

    // Setup Particle Canvas
    const particleCanvas = document.getElementById('particle-canvas');
    const gameContainerRect = document.getElementById('game-container').getBoundingClientRect();
    particleCanvas.width = gameContainerRect.width;
    particleCanvas.height = gameContainerRect.height;
    ParticleSystem.init(particleCanvas);

    // Initialize Conveyor (might start spawning items)
    Conveyor.init();

    // Start the main game loop
    Renderer.startGameLoop();

    console.log('Sector 7 Market Scramble Initialized.');
    UIUpdater.updateScore(GameState.getScore());
    UIUpdater.updateTime(GameState.getTimeLeft());
    UIUpdater.updateOrders("Initializing secure connection...");


    // Example: Show a welcome modal
    showModal(`
        <h2>Welcome to Sector 7 Market Scramble!</h2>
        <p>Sort the goods, meet the demands, and don't get caught. The market waits for no one.</p>
        <button id="start-game-button">Enter the Market</button>
    `);

    document.getElementById('start-game-button').addEventListener('click', () => {
        hideModal();
        // Potentially start timers or other game actions here if not already started
        Conveyor.startSpawning(); // Start item spawning after modal close
    });
});