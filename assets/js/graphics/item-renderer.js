// assets/js/graphics/item-renderer.js - Handles DOM creation and styling for items

let tooltipElement = null;

export function initTooltip() {
    if (!document.getElementById('item-tooltip')) {
        tooltipElement = document.createElement('div');
        tooltipElement.id = 'item-tooltip';
        document.getElementById('game-container').appendChild(tooltipElement);
    } else {
        tooltipElement = document.getElementById('item-tooltip');
    }
}

function showItemTooltip(itemData, event) {
    if (!tooltipElement) initTooltip();
    if (!tooltipElement) return;
    let content = `<strong>${itemData.name}</strong>Type: ${itemData.type}`;
    if (itemData.isFragile) content += `\n<span class="property">[FRAGILE]</span>`;
    if (itemData.isVolatile) content += `\n<span class="property">[VOLATILE]</span>`;
    if (itemData.corruptionLevel > 0) content += `\n<span class="property">[Corrupted: ${Math.round(itemData.corruptionLevel * 100)}%]</span>`;
    tooltipElement.innerHTML = content;
    tooltipElement.classList.add('visible');
    const gameContainerRect = document.getElementById('game-container').getBoundingClientRect();
    let x = event.clientX - gameContainerRect.left + 15;
    let y = event.clientY - gameContainerRect.top + 15;
    tooltipElement.style.left = '0px';
    tooltipElement.style.top = '0px';
    const tooltipRect = tooltipElement.getBoundingClientRect();
    if (x + tooltipRect.width > gameContainerRect.width -10) {
        x = event.clientX - gameContainerRect.left - tooltipRect.width - 15;
    }
    if (y + tooltipRect.height > gameContainerRect.height -10) {
        y = event.clientY - gameContainerRect.top - tooltipRect.height - 15;
    }
    if (x < 10) x = 10;
    if (y < 10) y = 10;
    tooltipElement.style.left = `${x}px`;
    tooltipElement.style.top = `${y}px`;
}

function hideItemTooltip() {
    if (tooltipElement) {
        tooltipElement.classList.remove('visible');
    }
}

export function createItemElement(itemData, parentElement) {
    const itemEl = document.createElement('div');
    itemEl.id = itemData.id;
    itemEl.classList.add('game-item', `item-type-${itemData.type.replace('_', '-')}`);
    if (itemData.isFragile) itemEl.classList.add('is-fragile');
    if (itemData.isVolatile) itemEl.classList.add('is-volatile');
    itemEl.draggable = true;
    itemEl.addEventListener('dragstart', (event) => {
        // --- CRITICAL LINE FOR SETTING DRAG DATA ---
        if (event.dataTransfer && itemData && itemData.id) {
            event.dataTransfer.setData('text/plain', itemData.id); // Ensure itemData.id is a valid string
            event.dataTransfer.effectAllowed = 'move';
            itemEl.classList.add('dragging');
            // console.log(`DragStart: Set data for item ID: ${itemData.id}`); // Good for debugging
        } else {
            console.error("DragStart: Failed to set drag data. event.dataTransfer or itemData.id is missing.", event.dataTransfer, itemData);
            event.preventDefault(); // Prevent dragging if data can't be set
        }
        hideItemTooltip();
    });
    itemEl.addEventListener('dragend', () => {
        itemEl.classList.remove('dragging');
    });
    itemEl.addEventListener('mouseenter', (event) => {
        showItemTooltip(itemData, event);
    });
    itemEl.addEventListener('mouseleave', hideItemTooltip);
    itemEl.addEventListener('mousemove', (event) => {
        if (tooltipElement && tooltipElement.classList.contains('visible')) {
            showItemTooltip(itemData, event);
        }
    });
    itemEl.style.width = '50px';
    itemEl.style.height = '50px';
    const profile = itemData.visualProfile;
    itemEl.style.backgroundColor = profile.color || 'grey';
    if (profile.shape === 'rectangle_stacked') {
        itemEl.classList.add('item-shape-rect-stacked');
        itemEl.style.backgroundColor = 'transparent';
        for (let i = 0; i < 3; i++) {
            const segment = document.createElement('div');
            segment.classList.add('item-segment');
            segment.style.backgroundColor = profile.color || 'cyan';
            if (profile.texture === 'scanlines') segment.classList.add('item-texture-scanlines');
            if (itemData.type === 'corrupted_data') segment.classList.add('item-type-corrupted-data');
            itemEl.appendChild(segment);
        }
    } else if (profile.shape === 'amorphous_blob') {
        itemEl.classList.add('item-shape-blob');
        itemEl.style.borderRadius = `${Math.random()*30+30}% ${Math.random()*30+30}% ${Math.random()*30+30}% ${Math.random()*30+30}% / ${Math.random()*30+30}% ${Math.random()*30+30}% ${Math.random()*30+30}% ${Math.random()*30+30}%`;
        if (profile.texture === 'pulsing_core') {
            itemEl.classList.add('item-texture-pulsing');
            const core = document.createElement('div');
            core.classList.add('item-core');
            core.style.backgroundColor = profile.coreColor || 'white';
            core.style.boxShadow = `0 0 10px ${profile.coreColor || 'white'}, 0 0 5px ${profile.coreColor || 'white'} inset`;
            itemEl.appendChild(core);
        }
    } else if (profile.shape === 'composite_geometric') {
        itemEl.classList.add('item-shape-composite-geometric');
        if (profile.texture === 'scanlines') itemEl.classList.add('item-texture-scanlines');
    } else if (profile.shape === 'irregular_cluster') {
        itemEl.classList.add('item-shape-irregular-cluster');
    } else {
        itemEl.style.borderRadius = '5px';
    }
    itemEl.style.position = 'absolute';
    itemEl.style.left = `${itemData.position.x}px`;
    itemEl.style.top = `calc(50% - ${parseInt(itemEl.style.height) / 2}px)`;
    parentElement.appendChild(itemEl);
}

export function updateItemPosition(itemId, xPosition) {
    const itemEl = document.getElementById(itemId);
    if (itemEl) {
        itemEl.style.left = `${xPosition}px`;
    }
}

export function removeItemElement(itemId) {
    const itemEl = document.getElementById(itemId);
    if (itemEl && itemEl.parentElement) {
        itemEl.parentElement.removeChild(itemEl);
        // console.log(`ItemRenderer: Removed element for ${itemId}`);
    }
}

console.log("ItemRenderer: Module Loaded.");

// Filename: item-renderer.js
// Directory: assets/js/graphics/