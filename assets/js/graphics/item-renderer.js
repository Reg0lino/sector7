// assets/js/graphics/item-renderer.js - Handles DOM creation and styling for items

export function createItemElement(itemData, parentElement) {
    const existingEl = document.getElementById(itemData.id);
    if (existingEl) {
        // This case should ideally not happen if items are always freshly created for the conveyor.
        // If an item can be "returned" to the conveyor, this logic would need to be more robust.
        console.warn(`ItemRenderer: Element for ${itemData.id} already exists. Avoiding re-creation.`);
        return; // Or update existingEl's properties/styles if applicable
    }

    const itemEl = document.createElement('div');
    itemEl.id = itemData.id;
    itemEl.classList.add('game-item');
    // Use hyphens for CSS classes from camelCase or snake_case types/properties
    itemEl.classList.add(`item-type-${itemData.type.replace(/_/g, '-')}`);

    itemEl.draggable = true;
    itemEl.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', itemData.id);
        event.dataTransfer.effectAllowed = 'move';
        itemEl.classList.add('dragging');
        itemEl.style.opacity = '0.3'; // Make original faint
    });

    itemEl.addEventListener('dragend', (event) => {
        itemEl.classList.remove('dragging');
        // Use setTimeout to allow drop event handler to potentially remove the element first
        setTimeout(() => {
            const stillExistsInDOM = document.getElementById(itemData.id);

            if (event.dataTransfer.dropEffect === 'none') { // Fumbled
                if (stillExistsInDOM) {
                    itemEl.style.opacity = '1'; // Restore visibility
                }
            } else { // Dropped on a valid target (e.g., dropEffect === 'move')
                // If it was dropped successfully, the element SHOULD have been removed by the
                // Conveyor.removeItemFromConveyor -> ItemRenderer.removeItemElement call
                // triggered by the bin's 'drop' handler.
                // If it still exists here, something went wrong in that chain.
                if (stillExistsInDOM) {
                    console.warn(`ItemRenderer (dragend): Item ${itemData.id} still exists after successful drop effect ('${event.dataTransfer.dropEffect}'). Forcing removal as fallback.`);
                    // Force removal if the primary removal failed.
                    removeItemElement(itemData.id);
                } else {
                    // This is the expected path for a successful drop.
                    // console.log(`ItemRenderer (dragend): Item ${itemData.id} successfully processed and removed before dragend check.`);
                }
            }
        }, 0); // Timeout 0 helps ensure drop handler runs first
    });

    // --- Apply Visuals based on itemData.visualProfile ---
    const vp = itemData.visualProfile || {}; // shorthand

    // Size from visual profile or default
    const width = vp.width || '50px';
    const height = vp.height || '50px';
    itemEl.style.width = width;
    itemEl.style.height = height;

    // Main color (can be overridden by textures/specific styles)
    itemEl.style.backgroundColor = vp.color || 'grey';

    // --- Apply shape class ---
    if (vp.shape) {
        const shapeClass = `item-shape-${vp.shape.replace(/_/g, '-')}`;
        itemEl.classList.add(shapeClass);
        if (vp.shape.startsWith('distorted_')) {
            itemEl.classList.add('item-distorted'); // General class for distortion effects
        }
    }

    // --- Apply texture class ---
    if (vp.texture) {
        itemEl.classList.add(`item-texture-${vp.texture.replace(/_/g, '-')}`);
    }

    // --- Apply animation class ---
    if (vp.animation) {
        itemEl.classList.add(`item-animation-${vp.animation.replace(/_/g, '-')}`);
    }

    // --- Apply border style class (for fragile) ---
    if (vp.borderStyle) {
        itemEl.classList.add(`item-border-${vp.borderStyle.replace(/_/g, '-')}`);
    }

    // --- Apply outer glow (for volatile) ---
    // Using animation class is often better for glows, but direct boxShadow is an option
    if (vp.outerGlow && !vp.animation?.includes('pulse')) { // Don't apply if pulse animation handles glow
        itemEl.style.boxShadow = `0 0 8px ${vp.outerGlow}, 0 0 12px ${vp.outerGlow}`;
    }

    // --- Specific handling for complex shapes from item-factory ---
    // Clear previous innerHTML if reusing elements (though we try not to)
    itemEl.innerHTML = '';

    if (vp.shape && (vp.shape.includes('rectangle_stacked'))) {
        for(let i = 0; i < (vp.segments || 3); i++) {
            const segment = document.createElement('div');
            segment.classList.add('item-segment');
            // Use the item's main computed background color for segments unless profile specifies otherwise
            segment.style.backgroundColor = window.getComputedStyle(itemEl).backgroundColor;
            if (itemData.corruptionLevel > 0.3) { // Example: Darker for corrupted
                segment.style.filter = 'brightness(0.6)';
            }
            itemEl.appendChild(segment);
        }
        // Make container transparent if segments provide the visuals
        itemEl.style.backgroundColor = 'transparent';
        itemEl.style.border = 'none';

    } else if (vp.shape && vp.shape.includes('amorphous_blob')) {
        // Set a random-ish border-radius for variety on creation
        itemEl.style.borderRadius = `${Math.random()*30+30}% ${Math.random()*30+30}% ${Math.random()*30+30}% ${Math.random()*30+30}% / ${Math.random()*30+30}% ${Math.random()*30+30}% ${Math.random()*30+30}% ${Math.random()*30+30}%`;

        if (vp.texture === 'pulsing_core') { // Create core element only if needed
            const core = document.createElement('div');
            core.classList.add('item-core');
            itemEl.appendChild(core);
        }
    } else if (vp.shape && vp.shape.includes('composite_geometric')) {
        // Example: add a simple inner shape structure
        const innerShape = document.createElement('div');
        innerShape.classList.add('inner-shape');
        innerShape.style.width = '60%';
        innerShape.style.height = '60%';
        innerShape.style.backgroundColor = 'rgba(255,255,255,0.1)';
        innerShape.style.border = '1px solid rgba(0,0,0,0.3)';
        innerShape.style.transform = 'rotate(10deg)';
        itemEl.appendChild(innerShape);
    }

    // Initial Position & Append
    itemEl.style.position = 'absolute';
    itemEl.style.left = `${itemData.position.x}px`;
    const itemHeightNum = parseInt(height); // Use calculated height
    itemEl.style.top = `calc(50% - ${itemHeightNum / 2}px)`;

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
    if (itemEl) {
        console.log(`ItemRenderer: Found element ${itemId}. Removing now.`); // Add log
        itemEl.remove(); // Use the simpler .remove() method directly on the element
        console.log(`ItemRenderer: Element ${itemId} removed.`);
    } else {
         console.warn(`ItemRenderer: removeItemElement called for ${itemId}, but element not found in DOM.`);
    }
}

console.log("ItemRenderer: Module Loaded.");