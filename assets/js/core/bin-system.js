// assets/js/core/bin-system.js - Manages the sorting bins

// import * as InputHandler from './input-handler.js'; // For attaching drop listeners (Future)

const BINS_CONFIG = [
    { id: 'bin-tech', label: 'TECH', accepts: ['datachip', 'hardware_common'], icon: '⚙️', color: 'var(--neon-cyan)' },
    { id: 'bin-bio', label: 'BIO', accepts: ['biomod', 'organic_sample'], icon: '🧬', color: 'var(--neon-green)' },
    { id: 'bin-discard', label: 'DISCARD', accepts: ['scrap', 'corrupted_data', 'waste'], icon: '♻️', color: 'var(--neon-magenta)' }
    // Example: also accepts 'corrupted' type
];

const interactionArea = document.getElementById('interaction-area');

export function initBins() {
    if (!interactionArea) {
        console.error("BinSystem: Interaction area (#interaction-area) not found!");
        return;
    }
    interactionArea.innerHTML = ''; // Clear any placeholders

    BINS_CONFIG.forEach(binConfig => {
        const binEl = document.createElement('div');
        binEl.id = binConfig.id;
        binEl.classList.add('sorting-bin'); // General class for styling (ensure this exists in CSS)
        binEl.dataset.accepts = binConfig.accepts.join(','); // Store what it accepts for game logic

        // Style the bin dynamically or use more CSS classes
        binEl.style.setProperty('--bin-glow-color', binConfig.color); // For dynamic glow

        const iconEl = document.createElement('span');
        iconEl.classList.add('bin-icon');
        iconEl.textContent = binConfig.icon;

        const labelEl = document.createElement('span');
        labelEl.classList.add('bin-label');
        labelEl.textContent = binConfig.label;

        binEl.appendChild(iconEl);
        binEl.appendChild(labelEl);
        interactionArea.appendChild(binEl);

        // Future: Add drag event listeners (could be managed by InputHandler or here)
        // InputHandler.addBinEventListeners(binEl);

        // Basic Drag and Drop listeners (will need actual draggable items later)
        binEl.addEventListener('dragover', (event) => {
            event.preventDefault(); // Allow dropping
            binEl.classList.add('drag-over'); // Add visual feedback
        });
        binEl.addEventListener('dragleave', () => {
            binEl.classList.remove('drag-over'); // Remove visual feedback
        });
        binEl.addEventListener('drop', (event) => {
            event.preventDefault();
            binEl.classList.remove('drag-over');
            const itemId = event.dataTransfer.getData('text/plain'); // Assuming item ID is passed
            console.log(`BinSystem: Item ${itemId} dropped on ${binConfig.id}`);
            // Here you would call a game logic function to check if the sort is correct
            // e.g., GameLogic.handleSort(itemId, binConfig.id);
            // UIUpdater.showFeedbackMessage(`Item ${itemId} to ${binConfig.label}`, 'info');
        });
    });
    console.log('BinSystem: Bins initialized dynamically.');
}

export function getBinConfigById(binId) {
    return BINS_CONFIG.find(bin => bin.id === binId);
}

export function getAllBinConfigs() {
    return BINS_CONFIG;
}

console.log("BinSystem: Module Loaded.");