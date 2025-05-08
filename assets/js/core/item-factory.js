// assets/js/core/item-factory.js - Generates item data structures

let itemIdCounter = 0; // Simple unique ID generator for now

const ITEM_TYPES = {
    DATACHIP: 'datachip',
    BIOMOD: 'biomod',
    HARDWARE: 'hardware_common',
    SCRAP: 'scrap',
    CORRUPTED: 'corrupted_data'
};

const ITEM_VISUAL_PROFILES = {
    [ITEM_TYPES.DATACHIP]: {
        color: 'var(--neon-cyan)', shape: 'rectangle_stacked', texture: 'scanlines',
        width: '45px', height: '55px'
    },
    [ITEM_TYPES.BIOMOD]: {
        color: '#ff3366', shape: 'amorphous_blob', texture: 'pulsing_core',
        width: '55px', height: '55px'
    },
    [ITEM_TYPES.HARDWARE]: {
        color: '#a0a0a0', shape: 'composite_geometric', texture: 'metallic_grid',
        width: '55px', height: '45px'
    },
    [ITEM_TYPES.SCRAP]: {
        color: '#795548', shape: 'irregular_cluster', texture: 'rust_patches',
        width: '50px', height: '50px'
    },
    [ITEM_TYPES.CORRUPTED]: {
        color: '#6a0dad', shape: 'rectangle_stacked',
        texture: 'heavy_static_glitch',
        animation: 'glitch-flicker-strong',
        width: '50px', height: '50px'
    }
};

/**
 * Creates a new item object.
 * @param {string} type - The type of item (e.g., ITEM_TYPES.DATACHIP).
 * @param {object} overrides - Optional properties to override defaults.
 * @returns {object | null} The item object or null if type is invalid.
 */
export function createItem(type, overrides = {}) {
    if (!Object.values(ITEM_TYPES).includes(type)) {
        console.error(`ItemFactory: Invalid item type "${type}" requested.`);
        return null;
    }

    itemIdCounter++;
    const baseItem = {
        id: `item-${itemIdCounter}-${Date.now().toString(36)}`, // More unique ID
        type: type,
        name: generateItemName(type), // Placeholder for procedural name generation
        value: calculateItemValue(type), // Placeholder
        isFragile: false,
        isVolatile: false,
        corruptionLevel: 0, // 0 to 1
        visualProfile: { ...ITEM_VISUAL_PROFILES[type] }, // Copy base profile
        position: { x: 0, y: 0 }, // Position on conveyor, will be updated
        // Add more properties: weight, specific sub-type, required bin, etc.
    };

    // Apply any overrides for special items
    const item = { ...baseItem, ...overrides };

    // Post-process visual profile based on properties like corruption
    if (item.corruptionLevel > 0.5) {
        item.visualProfile.color = 'darkmagenta';
        item.visualProfile.texture = 'heavy_static';
    }
    if (item.isVolatile) {
        item.visualProfile.animation = 'fast-pulse-red'; // Class name uses hyphens
    }
    if (item.isFragile) {
        item.visualProfile.borderStyle = 'thin-dashed-warning'; // Class name uses hyphens
    }

    console.log(`ItemFactory: Created item - ID: ${item.id}, Type: ${item.type}`);
    return item;
}

// Placeholder functions - these will become much more complex
function generateItemName(type) {
    const names = {
        [ITEM_TYPES.DATACHIP]: ["K-Corp Datastick", "Ronin InfoShingle", "ZetaArch Logchip"],
        [ITEM_TYPES.BIOMOD]: ["Adreno-Boost V2", "Cyto-Regen Patch", "Neural Lace Shard"],
        [ITEM_TYPES.HARDWARE]: ["Positronic Relay", "Scavenged Gyro", "Mk3 Servo"],
        [ITEM_TYPES.SCRAP]: ["Bent Plasteel", "Frayed Wiring", "Cracked Casing"],
        [ITEM_TYPES.CORRUPTED]: ["Glitched Memory Unit", "Fragmented AI Core", "Null-Sector Data"]
    };
    const typeNames = names[type] || ["Unknown Item"];
    return typeNames[Math.floor(Math.random() * typeNames.length)];
}

function calculateItemValue(type) {
    const baseValues = {
        [ITEM_TYPES.DATACHIP]: 50,
        [ITEM_TYPES.BIOMOD]: 75,
        [ITEM_TYPES.HARDWARE]: 40,
        [ITEM_TYPES.SCRAP]: 5,
        [ITEM_TYPES.CORRUPTED]: 10 // Low value, but might be part of specific orders
    };
    return baseValues[type] || 0;
}

// Expose ITEM_TYPES for other modules to use
export { ITEM_TYPES };

console.log("ItemFactory: Module Loaded.");