@echo off
echo Creating project structure for Sector 7 Market Scramble...

REM Main project folder
mkdir sector7-market-scramble
cd sector7-market-scramble

REM Root files
echo # Sector 7 Market Scramble > README.md
echo. >> README.md
echo A pure code cyberpunk market sorting game. >> README.md
echo. >> README.md
echo ## Tech Stack >> README.md
echo * HTML5 >> README.md
echo * CSS3 (with advanced techniques like Flexbox, Grid, Animations, Custom Properties, potentially Houdini) >> README.md
echo * JavaScript (ES6+, Vanilla JS, Web APIs like Canvas, SVG, Web Audio) >> README.md
echo * (Optional) Tiny WebGL helper or direct WebGL >> README.md

echo MIT License > LICENSE
echo. >> LICENSE
echo Copyright (c) %date% [Your Name/Handle Here] >> LICENSE
echo. >> LICENSE
echo Permission is hereby granted, free of charge, to any person obtaining a copy >> LICENSE
echo of this software and associated documentation files (the "Software"), to deal >> LICENSE
echo in the Software without restriction, including without limitation the rights >> LICENSE
echo to use, copy, modify, merge, publish, distribute, sublicense, and/or sell >> LICENSE
echo copies of the Software, and to permit persons to whom the Software is >> LICENSE
echo furnished to do so, subject to the following conditions: >> LICENSE
echo. >> LICENSE
echo The above copyright notice and this permission notice shall be included in all >> LICENSE
echo copies or substantial portions of the Software. >> LICENSE
echo. >> LICENSE
echo THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR >> LICENSE
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, >> LICENSE
echo FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE >> LICENSE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER >> LICENSE
echo LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, >> LICENSE
echo OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE >> LICENSE
echo SOFTWARE. >> LICENSE


echo ^<!DOCTYPE html^> > index.html
echo ^<html lang="en"^> >> index.html
echo ^<head^> >> index.html
echo     ^<meta charset="UTF-8"^> >> index.html
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> index.html
echo     ^<title^>Sector 7 Market Scramble^</title^> >> index.html
echo     ^<link rel="stylesheet" href="assets/css/main.css"^> >> index.html
echo     ^<link rel="stylesheet" href="assets/css/items.css"^> >> index.html
echo     ^<link rel="stylesheet" href="assets/css/effects.css"^> >> index.html
echo     ^<link rel="stylesheet" href="assets/css/themes.css"^> >> index.html
echo ^</head^> >> index.html
echo ^<body^> >> index.html
echo     ^<div id="game-container"^> >> index.html
echo         ^<h1^>Loading Sector 7 Market Scramble...^</h1^> >> index.html
echo         ^!-- Game UI and elements will be injected here by JS --^> >> index.html
echo     ^</div^> >> index.html
echo     ^<script src="assets/js/main.js" type="module"^>^</script^> >> index.html
echo ^</body^> >> index.html
echo ^</html^> >> index.html

REM Assets folder and subfolders
mkdir assets
mkdir assets\css
mkdir assets\css\houdini
mkdir assets\js
mkdir assets\js\core
mkdir assets\js\graphics
mkdir assets\js\audio
mkdir assets\js\ui
mkdir assets\js\gameplay
mkdir assets\js\utils
mkdir assets\shaders
mkdir docs
mkdir docs\design

REM CSS files
echo /* assets/css/main.css - Core layout, UI, game container */ > assets\css\main.css
echo body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #0d0d1a; color: #00ff00; font-family: monospace; } >> assets\css\main.css
echo #game-container { border: 2px solid #00ff00; padding: 20px; text-align: center; } >> assets\css\main.css

echo /* assets/css/themes.css - Different stall themes, cyberpunk palettes */ > assets\css\themes.css
echo :root { --neon-cyan: #00ffff; --neon-magenta: #ff00ff; } >> assets\css\themes.css

echo /* assets/css/items.css - Procedural item styles */ > assets\css\items.css
echo .item { width: 50px; height: 50px; background-color: grey; margin: 5px; display: inline-block; } >> assets\css\items.css

echo /* assets/css/effects.css - CSS-driven animations, transitions */ > assets\css\effects.css
echo .flicker { animation: flicker-anim 1.5s infinite alternate; } @keyframes flicker-anim { 0%% { opacity: 1; } 20%% { opacity: 0.8; } 100%% { opacity: 1; } } >> assets\css\effects.css

echo /* assets/css/houdini/border-painter.js - Example Houdini Paint Worklet */ > assets\css\houdini\border-painter.js
echo // if (typeof registerPaint !== 'undefined') { registerPaint('my-border', class { paint(ctx, size) { /* ... */ } }); } >> assets\css\houdini\border-painter.js

REM JavaScript files
echo // assets/js/main.js - Game initialization, main loop orchestration > assets\js\main.js
echo import * as GameState from './core/game-state.js'; >> assets\js\main.js
echo import * as ItemFactory from './core/item-factory.js'; >> assets\js\main.js
echo console.log('Sector 7 Main Initialized. GameState:', GameState); >> assets\js\main.js
echo console.log('ItemFactory:', ItemFactory); >> assets\js\main.js
echo document.addEventListener('DOMContentLoaded', () => { console.log('DOM fully loaded and parsed for Sector 7.'); GameState.init(); }); >> assets\js\main.js

REM JS Core
echo // assets/js/core/game-state.js - Score, time, orders, player progress > assets\js\core\game-state.js
echo export let score = 0; >> assets\js\core\game-state.js
echo export function init() { console.log('GameState initialized.'); } >> assets\js\core\game-state.js

echo // assets/js/core/item-factory.js - Generates item data > assets\js\core\item-factory.js
echo export function createItem(type) { return { type: type, id: Date.now() }; } >> assets\js\core\item-factory.js

echo // assets/js/core/order-system.js - Generates and tracks orders > assets\js\core\order-system.js
echo export function generateOrder() { console.log('New order generated.'); } >> assets\js\core\order-system.js

echo // assets/js/core/conveyor.js - Manages item movement > assets\js\core\conveyor.js
echo export function moveItems() { /* console.log('Moving items...'); */ } >> assets\js\core\conveyor.js

echo // assets/js/core/input-handler.js - Drag & drop, keyboard > assets\js\core\input-handler.js
echo export function setupInput() { console.log('Input handlers set up.'); } >> assets\js\core\input-handler.js

REM JS Graphics
echo // assets/js/graphics/renderer.js - Main rendering loop > assets\js\graphics\renderer.js
echo export function renderGame() { /* console.log('Rendering game frame...'); */ } >> assets\js\graphics\renderer.js

echo // assets/js/graphics/particle-system.js - Canvas particles > assets\js\graphics\particle-system.js
echo export function createBurst(x, y) { console.log(`Particle burst at ${'$'}{x},${'$'}{y}`); } >> assets\js\graphics\particle-system.js

echo // assets/js/graphics/svg-graphics.js - SVG manipulation > assets\js\graphics\svg-graphics.js
echo export function createSVGElement(type) { return document.createElementNS('http://www.w3.org/2000/svg', type); } >> assets\js\graphics\svg-graphics.js

echo // assets/js/graphics/css-animator.js - JS control for CSS animations > assets\js\graphics\css-animator.js
echo export function triggerAnimation(element, animationName) { element.style.animation = 'none'; void element.offsetWidth; /* trigger reflow */ element.style.animation = null; element.classList.add(animationName); } >> assets\js\graphics\css-animator.js

echo // assets/js/graphics/webgl-shaders.js - Shader strings, GL setup > assets\js\graphics\webgl-shaders.js
echo export const simpleVertexShader = "attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }"; >> assets\js\graphics\webgl-shaders.js

REM JS Audio
echo // assets/js/audio/sfx-generator.js - Procedural sound effects > assets\js\audio\sfx-generator.js
echo const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); export function playSound(type) { console.log(`Playing SFX: ${'$'}{type}`); if (!audioCtx) return; const oscillator = audioCtx.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); oscillator.connect(audioCtx.destination); oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.1); } >> assets\js\audio\sfx-generator.js

echo // assets/js/audio/music-sequencer.js - Dynamic music generation > assets\js\audio\music-sequencer.js
echo export function startMusic() { console.log('Music sequencer started.'); } >> assets\js\audio\music-sequencer.js

REM JS UI
echo // assets/js/ui/ui-updater.js - Updates score, timer, etc. > assets\js\ui\ui-updater.js
echo export function updateScore(newScore) { console.log(`Score updated to: ${'$'}{newScore}`); } >> assets\js\ui\ui-updater.js

echo // assets/js/ui/feedback.js - Handles visual feedback > assets\js\ui\feedback.js
echo export function showMessage(message) { console.log(`Feedback: ${'$'}{message}`); } >> assets\js\ui\feedback.js

echo // assets/js/ui/modal-system.js - Popups, settings > assets\js\ui\modal-system.js
echo export function openModal(content) { console.log('Modal opened.'); } >> assets\js\ui\modal-system.js

REM JS Gameplay
echo // assets/js/gameplay/events.js - Market Shift events logic > assets\js\gameplay\events.js
echo export function triggerRandomEvent() { console.log('Market event triggered.'); } >> assets\js\gameplay\events.js

echo // assets/js/gameplay/reputation.js - Fixer reputation > assets\js\gameplay\reputation.js
echo export function updateReputation(fixer, amount) { console.log(`Reputation for ${'$'}{fixer} changed by ${'$'}{amount}.`); } >> assets\js\gameplay\reputation.js

echo // assets/js/gameplay/upgrades.js - Player augmentation system > assets\js\gameplay\upgrades.js
echo export function applyUpgrade(upgradeId) { console.log(`Upgrade ${'$'}{upgradeId} applied.`); } >> assets\js\gameplay\upgrades.js

echo // assets/js/gameplay/challenges.js - Daily challenges logic > assets\js\gameplay\challenges.js
echo export function startDailyChallenge() { console.log('Daily challenge started.'); } >> assets\js\gameplay\challenges.js

REM JS Utils
echo // assets/js/utils/helpers.js - Math, random generators, DOM > assets\js\utils\helpers.js
echo export function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; } >> assets\js\utils\helpers.js

echo // assets/js/utils/localstorage.js - Saving progress > assets\js\utils\localstorage.js
echo export function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); } >> assets\js\utils\localstorage.js
echo export function loadData(key) { const data = localStorage.getItem(key); return data ? JSON.parse(data) : null; } >> assets\js\utils\localstorage.js

REM Shader files (optional)
echo // assets/shaders/item-vertex.glsl - Vertex shader for items > assets\shaders\item-vertex.glsl
echo attribute vec4 a_position; void main() { gl_Position = a_position; } >> assets\shaders\item-vertex.glsl

echo // assets/shaders/item-fragment.glsl - Fragment shader for items > assets\shaders\item-fragment.glsl
echo precision mediump float; void main() { gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); } >> assets\shaders\item-fragment.glsl

echo // assets/shaders/postprocess-fragment.glsl - Fullscreen post-processing > assets\shaders\postprocess-fragment.glsl
echo precision mediump float; uniform vec2 u_resolution; void main() { vec2 st = gl_FragCoord.xy/u_resolution.xy; gl_FragColor = vec4(st.x, st.y, 0.0, 1.0); } >> assets\shaders\postprocess-fragment.glsl

REM Docs
echo # Design Document > docs\design\design_doc.md
echo This document will outline the core design principles, gameplay mechanics, and aesthetic goals for Sector 7 Market Scramble. >> docs\design\design_doc.md


echo.
echo Project structure for Sector 7 Market Scramble created successfully!
echo Navigate to the 'sector7-market-scramble' directory to begin.
cd ..
@echo on