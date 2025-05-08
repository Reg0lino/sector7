// assets/js/graphics/renderer.js - Main rendering and game loop

import * as GameState from '../core/game-state.js';
import * as UIUpdater from '../ui/ui-updater.js';
import * as Conveyor from '../core/conveyor.js';
import * as EventManager from '../core/event-manager.js';
// Future imports: Conveyor, ItemSystem, ParticleSystem, etc.

let lastTimestamp = 0;      // Timestamp of the last frame
let gameLoopId = null;      // To store the ID of the requestAnimationFrame, so we can cancel it
let secondsCounter = 0;     // Accumulates deltaTime to trigger once-per-second events

const FPS = 30; // Target FPS for game logic updates (rendering will be smoother via rAF)
const frameDuration = 1000 / FPS; // How many milliseconds one frame should last

function gameLoop(timestamp) { // timestamp is provided by requestAnimationFrame
    // If the game is over or hasn't started, we can simply stop the loop by not requesting another frame.
    // However, to be explicit and allow restarting, we'll check gameActive.
    // Pausing will be handled inside.
    if (!gameLoopId) return; // Loop has been explicitly stopped

    // Calculate delta time - the time elapsed since the last frame
    // This is crucial for frame-rate independent movement and animations.
    const deltaTime = timestamp - lastTimestamp;

    if (GameState.isGameActive() && !GameState.isGamePaused()) {
        // --- Logic that should run every frame (or close to target FPS) ---
        if (deltaTime >= frameDuration) { // Ensure we only update at our target FPS
            lastTimestamp = timestamp - (deltaTime % frameDuration); // Adjust for more consistent timing

            // 1. Update Game Logic (Physics, Item Movement, etc.)
            Conveyor.update(deltaTime); // Pass deltaTime in milliseconds
            EventManager.update(deltaTime); // Update event manager

            // 2. Handle Input
            // Example: InputHandler.processInput();

            // --- Logic that should run approximately once per second ---
            secondsCounter += deltaTime;
            if (secondsCounter >= 1000) { // 1000 milliseconds = 1 second
                GameState.decreaseTime(); // Decrease the game time
                UIUpdater.updateTime(GameState.getTimeLeft()); // Update the time display
                secondsCounter %= 1000; // Reset the counter, keeping the remainder

                // Check for game over condition (time up)
                if (GameState.getTimeLeft() <= 0 && GameState.isGameActive()) { // Check isGameActive again as decreaseTime might have set it to false
                    console.log("Renderer: Time's up! Game Over condition met in loop.");
                    // GameState.gameOver() is already called by decreaseTime if timeLeft hits 0.
                    // Here we could trigger a Game Over modal.
                    // For now, we will simply stop the game loop or let GameState handle it.
                    // To cleanly stop this specific loop instance:
                    // stopGameLoop();
                    // UIUpdater.showFeedbackMessage("TRANSMISSION LOST - TIME UP!", "error", 5000);
                    // document.dispatchEvent(new CustomEvent('showmodal', { detail: { type: 'gameOver', score: GameState.getScore() } }));
                }
            }
        }

        // --- Rendering that should happen every frame (as fast as possible) ---
        // Example: clearCanvas();
        // Example: renderConveyor();
        // Example: renderItems();
        // Example: ParticleSystem.render(deltaTime / 1000);
    } else if (GameState.isGamePaused()) {
        // If paused, still update lastTimestamp to prevent a large deltaTime jump when resuming.
        lastTimestamp = timestamp;
    }

    // Request the next frame
    if (GameState.isGameActive() || GameState.isGamePaused()) {
        gameLoopId = requestAnimationFrame(gameLoop);
    } else {
        console.log("Renderer: Game not active or paused. Loop ending gracefully.");
        if (gameLoopId) stopGameLoop(); // Explicitly stop, though gameLoopId becomes null in stopGameLoop
    }
}

export function startGameLoop() {
    console.log("Renderer.startGameLoop(): ENTERED"); // <-- ADD THIS
    if (gameLoopId) {
        console.warn("Renderer: startGameLoop called but loop is already running.");
        return;
    }
    console.log('Renderer: Starting main game loop...');
    lastTimestamp = performance.now(); // Get high-resolution timestamp
    secondsCounter = 0; // Reset second counter
    gameLoopId = requestAnimationFrame(gameLoop); // Start the loop
}

export function stopGameLoop() {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null; // Clear the ID so we know it's stopped
        console.log('Renderer: Main game loop stopped.');
    } else {
        console.warn("Renderer: stopGameLoop called but loop is not running.");
    }
}

console.log('Renderer: Module Loaded.');