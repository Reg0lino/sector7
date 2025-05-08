// assets/js/graphics/item-renderer.js - Handles DOM creation and styling for items

export function createItemElement(itemData, parentElement) {
    const itemEl = document.createElement('div');
    itemEl.id = itemData.id;
    itemEl.classList.add('game-item'); // General class for all items
    itemEl.classList.add(`item-type-${itemData.type.replace('_', '-')}`); // e.g., item-type-datachip

    // Make item draggable
    itemEl.draggable = true;
    itemEl.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', itemData.id);
        event.dataTransfer.effectAllowed = 'move';
        itemEl.classList.add('dragging');
        // console.log(`DragStart: ${itemData.id}`);
    });
    itemEl.addEventListener('dragend', () => {
        itemEl.classList.remove('dragging');
        // console.log(`DragEnd: ${itemData.id}`);
    });


    // --- Basic Visual Representation based on itemData.visualProfile ---
    // This will become much more sophisticated with procedural graphics or SVG/Canvas later.

    // Size
    itemEl.style.width = '50px'; // Default size
    itemEl.style.height = '50px';

    // Background color (from visualProfile or fallback)
    const color = itemData.visualProfile?.color || 'grey';
    if (color.startsWith('var(')) { // If it's a CSS variable
        itemEl.style.backgroundColor = color; // Let CSS handle it
    } else {
        itemEl.style.backgroundColor = color;
    }


    // Shape (via classes or direct style manipulation)
    if (itemData.visualProfile?.shape === 'rectangle_stacked') {
        itemEl.classList.add('item-shape-rect-stacked');
        // Add inner elements for stacks if needed
        for(let i = 0; i < 3; i++) {
            const segment = document.createElement('div');
            segment.classList.add('item-segment');
            itemEl.appendChild(segment);
        }
    } else if (itemData.visualProfile?.shape === 'amorphous_blob') {
        itemEl.classList.add('item-shape-blob');
        itemEl.style.borderRadius = '50% 40% 30% 60% / 40% 50% 60% 30%'; // Basic amorphous
    } else {
        itemEl.style.borderRadius = '5px'; // Default slightly rounded square
    }

    // Texture/Pattern (via classes or background images/gradients)
    if (itemData.visualProfile?.texture === 'scanlines') {
        itemEl.classList.add('item-texture-scanlines');
    } else if (itemData.visualProfile?.texture === 'pulsing_core') {
        itemEl.classList.add('item-texture-pulsing');
        const core = document.createElement('div');
        core.classList.add('item-core');
        itemEl.appendChild(core);
    }


    // Initial position (set by conveyor.js before adding to DOM if needed)
    itemEl.style.position = 'absolute'; // Items on conveyor belt are absolutely positioned
    itemEl.style.left = `${itemData.position.x}px`;
    itemEl.style.top = `calc(50% - ${parseInt(itemEl.style.height) / 2}px)`; // Center vertically on conveyor
    // itemEl.style.transform = `translateY(-50%)`; // Alternative vertical centering

    parentElement.appendChild(itemEl);
    // console.log(`ItemRenderer: Created element for ${itemData.id}`);
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