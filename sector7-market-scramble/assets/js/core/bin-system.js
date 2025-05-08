// assets/js/core/bin-system.js

import * as InputHandler from './input-handler.js'; // For attaching drop listeners

const BINS_CONFIG = [
    { id: 'bin-alpha', label: 'ALPHA (Tech)', accepts: ['datachip'], icon: '⚙️' },
    { id: 'bin-beta', label: 'BETA (Bio)', accepts: ['biomod'], icon: '🧬' },
    { id: 'bin-recycle', label: 'RECYCLE (Scrap)', accepts: ['scrap', 'corrupted'], icon: '♻️' } // Example: also accepts 'corrupted' type
];

const interactionArea = document.getElementById('interaction-area');

export function initBins() {
    if (!interactionArea) {
        console.error("BinSystem: Interaction area not found!");
        return;
    }
    interactionArea.innerHTML = ''; // Clear placeholders

    BINS_CONFIG.forEach(binConfig => {
        const binEl = document.createElement('div');
        binEl.id = binConfig.id;
        binEl.classList.add('sorting-bin'); // General class for styling
        binEl.dataset.accepts = binConfig.accepts.join(','); // Store what it accepts

        // You can use CSS to style these further or create more complex procedural graphics
        const iconEl = document.createElement('span');
        iconEl.classList.add('bin-icon');
        iconEl.textContent = binConfig.icon;

        const labelEl = document.createElement('span');
        labelEl.classList.add('bin-label');
        labelEl.textContent = binConfig.label;

        binEl.appendChild(iconEl);
        binEl.appendChild(labelEl);
        interactionArea.appendChild(binEl);

        // Add drag event listeners (could be managed by InputHandler as well)
        InputHandler.addBinEventListeners(binEl);
    });
    console.log('Bins initialized.');
}

export function getBinConfigById(binId) {
    return BINS_CONFIG.find(bin => bin.id === binId);
}

export function getAllBinConfigs() {
    return BINS_CONFIG;
}