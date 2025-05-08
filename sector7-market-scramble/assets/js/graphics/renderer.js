// assets/js/graphics/renderer.js - Main rendering loop

import * as GameState from '../core/game-state.js';
import * as UIUpdater from '../ui/ui-updater.js';
import * as Conveyor from '../core/conveyor.js';
// Import other systems that need updates in the loop, e.g., particle system

let lastTimestamp = 0;
let gameLoopId = null;

const FPS = 30; // Target FPS
const frameDuration = 1000 / FPS;

let secondCounter = 0; // To update time once per second

function gameLoop(timestamp) {
    if (!GameState.isGameActive() || GameState.isGamePaused()) {
        lastTimestamp = timestamp; // Reset timestamp when paused/inactive
        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = timestamp - lastTimestamp;

    if (deltaTime >= frameDuration) {
        lastTimestamp = timestamp - (deltaTime % frameDuration); // Adjust for more consistent timing

        // --- Update game logic (fixed timestep or per frame) ---
        Conveyor.update(deltaTime / 1000); // Pass deltaTime in seconds for physics

        // --- Update things that happen once per second ---
        secondCounter += deltaTime;
        if (secondCounter >= 1000) {
            GameState.decreaseTime();
            UIUpdater.updateTime(GameState.getTimeLeft());
            secondCounter %= 1000; // Reset counter, keeping remainder

            if (GameState.getTimeLeft() <= 0) {
                // Handle game over
                console.log("GAME OVER - Time Ran Out!");
                // You'd call a proper game over function here from GameState or main.js
                GameState.pauseGame(); // Simple pause for now
                // Show game over modal
                document.dispatchEvent(new CustomEvent('showmodal', {
                    detail: {
                        title: "TRANSMISSION LOST",
                        content: `<p>Time's up, hustler. The market waits for no one.</p><p>Final Score: ${GameState.getScore()}</p><button id="restart-button">Retry Shift</button>`,
                        isGameOver: true
                    }
                }));

            }
        }


        // --- Render visual updates ---
        // (Currently, most visuals are CSS driven or updated by their own systems)
        // If you had a primary canvas for items/bins, you'd draw it here.
        // ParticleSystem.render(deltaTime); // Example
    }

    gameLoopId = requestAnimationFrame(gameLoop);
}

export function startGameLoop() {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
    lastTimestamp = performance.now(); // Use performance.now for higher precision
    gameLoopId = requestAnimationFrame(gameLoop);
    console.log('Main game loop started.');
}

export function stopGameLoop() {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    console.log('Main game loop stopped.');
}