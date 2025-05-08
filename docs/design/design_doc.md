# Sector 7 Market Scramble: Design Document

... (any existing design notes you had before) ...

## I. Project Vision & Core Pillars

*   **Title:** Sector 7 Market Scramble: Glitch Runner
*   **Logline:** In the neon-drenched underbelly of Sector 7, you're a Glitch Runner, a high-speed sorter of illicit data-packages and volatile black-market goods. Fulfill cryptic orders from shadowy Fixers, navigate system glitches and market chaos, upgrade your rig, and try to survive another cycle on the relentless conveyor of the cyberpunk sprawl.
*   **Core Gameplay:** Fast-paced, procedurally generated sorting game with drag-and-drop mechanics. Players sort items from a moving conveyor into designated bins based on current orders.
*   **Aesthetic:** Cyberpunk, neon-noir, glitch art. Visually driven by "pure code" (HTML, CSS, JS Canvas/SVG/WebGL) without traditional sprite assets.
*   **Key Features (Target):**
    *   Dynamic item generation with unique properties.
    *   Procedural order system with Fixer personalities.
    *   Market events and system glitches.
    *   Rival runner interference (simulated).
    *   Player upgrades and progression.
    *   Strong narrative elements woven through gameplay.
    *   High replayability through deep procedural generation.
*   **Target Platform:** Web (GitHub Pages compatible).

## II. Development Style & Collaboration Notes

This section outlines the working style observed during the initial development phase, primarily driven by a collaboration between a human visionary/director and an AI coding assistant (like GitHub Copilot or a Large Language Model).

**Working Style Overview:**

*   **Vision-Led, Iterative Development:** The human partner provides the high-level vision, game design ideas, desired aesthetics, and specific feature requests. The AI assistant translates these into functional code scripts.
*   **Modular Design Focus:** Emphasis is placed on breaking the game into distinct, manageable JavaScript modules (e.g., `game-state.js`, `ui-updater.js`, `conveyor.js`). This aids in organization, debugging, and scalability.
*   **Beginner-Friendly Code with AI Assistance:** The human partner is a beginner coder. Scripts provided by the AI should be complete, with clear explanations for complex parts. The expectation is that the human can copy-paste full script definitions and understand the high-level purpose of functions and modules. GitHub Copilot is used by the human for minor adjustments, autocompletions, and understanding snippets.
*   **Rapid Prototyping & "Plow Forward" Mentality:** The primary goal is to quickly get functional systems in place. Visual polish and minor bug fixes (especially UI rendering glitches not breaking core functionality) are often deferred in favor of building out the next mechanic. Errors identified by the human are addressed by the AI providing corrected or alternative scripts.
*   **Emphasis on Procedural Generation for Replayability:** This is a core tenet. Many systems are designed from the outset to be driven by procedural logic.
*   **Design Documentation as a Living Document:** This document is updated periodically to reflect implemented features, refined ideas, and track progress.
*   **Full Script Iteration:** When a module needs significant changes or a new module is introduced, the AI provides the *entire* script for that module, rather than just diffs or snippets, to ensure clarity for the beginner coder.
*   **Problem Solving:**
    *   Human identifies issues (e.g., "timer isn't visible," "X system isn't working," "error in console Y").
    *   AI proposes solutions, often in the form of updated code for one or more modules.
    *   Human implements the changes and reports back.
*   **Communication:** Clear, direct requests for features and bug fixes. Visual aids (like screenshots of the current game state or mockups) are used to clarify design intent.

**Implications for Future Development/Collaboration:**

*   Continue prioritizing modularity.
*   Ensure code comments explain the "why" as much as the "what."
*   When introducing new complex logic, provide high-level explanations of how it fits into the existing system.
*   Be prepared for the human partner to request full revised scripts for modules if significant changes are made.
*   Testing is primarily done by the human partner running the game in the browser and observing behavior/console logs.

## III. Feature Implementation Changelog

This log tracks the major features and systems implemented, providing a history of the project's development.

**Initial Setup & Foundation (Phases 1-3 Approx.)**

*   **Date:** (YYYY-MM-DD of initial file generation)
    *   **Feature:** Project structure generation (HTML, CSS, JS folder scaffolding, basic `README.md`, `LICENSE`).
    *   **Modules Affected:** Initial `index.html`, `assets/css/main.css`, placeholder JS files.
    *   **Notes:** Established basic cyberpunk theme in CSS. `main.js` set up for module imports.
*   **Date:** (YYYY-MM-DD of your first actual coding session - yesterday/today)
    *   **Feature:** Core Game State Management.
    *   **Modules Affected:** `core/game-state.js` (created/fleshed out), `main.js`.
    *   **Details:** Implemented score, timer (timeLeft, initialTime), gameActive, gamePaused states. Functions to initialize, start, pause, resume, game over, manage score, and time.
*   **Date:** (YYYY-MM-DD - same session)
    *   **Feature:** Basic UI Updater.
    *   **Modules Affected:** `ui/ui-updater.js` (created/fleshed out), `main.js`, `index.html` (structure confirmed).
    *   **Details:** Linked JS to UI display elements (`current-order-display`, `time-left-display`, `current-score-display`, `feedback-message-container`). Functions to update score, time, order text, and show feedback messages. Initialized default UI values.
*   **Date:** (YYYY-MM-DD - same session)
    *   **Feature:** Main Game Loop Implementation.
    *   **Modules Affected:** `graphics/renderer.js` (created), `main.js`, `core/game-state.js`, `ui/ui-updater.js`.
    *   **Details:** Introduced `requestAnimationFrame` based game loop. Timer countdown logic implemented within the loop, updating `GameState` and `UIUpdater`. Basic pause/resume support in loop. Game over condition triggered by timer.
*   **Date:** (YYYY-MM-DD - current session)
    *   **Feature:** Modal System for Game Flow Control.
    *   **Modules Affected:** `ui/modal-system.js` (created), `main.js`, `core/game-state.js`, `graphics/renderer.js`, `assets/css/main.css`.
    *   **Details:** Implemented modal overlay and content area. `showModal` function for different types (startMenu, gameOver, pauseMenu). Game start now triggered by "Start Shift" button in modal. Game over modal appears when timer expires, with a "Retry Shift" option. Basic CSS for modal visibility and content.
*   **Date:** (YYYY-MM-DD - current session)
    *   **Feature:** Dynamic Bin System.
    *   **Modules Affected:** `core/bin-system.js` (created/fleshed out), `main.js`, `assets/css/main.css`.
    *   **Details:** Replaced placeholder bins with dynamically generated bins based on `BINS_CONFIG`. Bins now display icons and labels (TECH, BIO, DISCARD). Basic CSS styling for bins, including hover effects and a `--bin-glow-color` custom property. Basic drag/drop event listeners added to bins (functionality pending draggable items).
*   **Date:** (YYYY-MM-DD - current session)
    *   **Feature:** Basic Item Factory.
    *   **Modules Affected:** `core/item-factory.js` (created).
    *   **Details:** Defined `ITEM_TYPES` and basic `ITEM_VISUAL_PROFILES`. `createItem` function generates item data objects with unique IDs, type, placeholder names, values, and visual profiles. Basic logic for corruption/volatility affecting visual profile.
*   **Date:** (YYYY-MM-DD - current session)
    *   **Feature:** Conveyor System & Basic Item Spawning/Movement.
    *   **Modules Affected:** `core/conveyor.js` (created), `graphics/item-renderer.js` (created), `assets/css/items.css` (created), `graphics/renderer.js`, `main.js`.
    *   **Details:** `Conveyor.js` manages an array of active items, spawns new items periodically (random types for now), and updates their X-position. Items are removed if they go off-screen. `ItemRenderer.js` creates DOM elements for items, applies basic styling based on `itemData.visualProfile`, and handles updating their position and removal. Items are made draggable. Basic CSS for `.game-item` and some example type/shape/texture styles.
*   **Date:** (YYYY-MM-DD - current session)
    *   **Feature:** Basic Order System.
    *   **Modules Affected:** `core/order-system.js` (created), `main.js`, `ui/modal-system.js`, `core/game-state.js`, `ui/ui-updater.js`.
    *   **Details:** `generateNewOrder` creates simple orders (e.g., "Collect X of Y item for Z bin"). Updates `GameState` and `UIUpdater` with order details. Basic logic for `fulfillOrderItem` and `orderComplete` (grants score, shows feedback, generates next order). First order is now generated when the game starts via the modal.
*   **Date:** (YYYY-MM-DD - current session)
    *   **Bugfix:** Corrected syntax error in `ui/modal-system.js` (`() = closeModal()` to `() => closeModal()`).
    *   **Modules Affected:** `ui/modal-system.js`.

**Next Steps / Planned Features:**

*   **Item Sorting Logic:** Connect item drag-drop to bin logic, check against current order, provide success/failure feedback, update score.
*   **Advanced Item Rendering:** Utilize Canvas or SVG for more dynamic and procedural item visuals instead of basic CSS styled divs.
*   **Advanced Procedural Generation:**
    *   Complex item names and properties.
    *   More varied order types and Fixer-driven parameters.
    *   Market Events / Glitches.
*   **Player Interaction:**
    *   "Grabbing" items from conveyor (click or drag).
*   **Saving/Loading Game State.**
*   **Full UI Polish.**
*   ... (refer back to broader brainstormed features) ...

## IV. Asset Pipeline (Pure Code)

*   **Visuals:** Primarily generated via:
    *   HTML structure + advanced CSS (gradients, shadows, filters, animations, custom properties).
    *   JavaScript manipulating CSS custom properties for dynamic effects.
    *   JavaScript drawing directly to HTML5 Canvas for items, particles, and complex background elements.
    *   SVG generated or manipulated by JavaScript for crisp icons or specific item components.
    *   Potentially simple WebGL shaders for post-processing effects (glitch, bloom, scanlines) or complex item rendering.
*   **Audio:**
    *   Web Audio API for all sound effects and music.
    *   Procedural sound generation (e.g., using ZzFX-like principles or direct oscillator/noise manipulation) for unique SFX for item interactions, UI feedback, and ambiances.
    *   Generative music sequencer for dynamic cyberpunk soundtrack.
*   **Fonts:** Web fonts (e.g., Orbitron, Roboto Mono) loaded via CSS.

---