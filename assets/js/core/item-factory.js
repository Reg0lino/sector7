// assets/js/core/item-factory.js - Generates item data structures

let itemIdCounter = 0; // Simple unique ID generator for now

export const ITEM_TYPES = {
    DATACHIP: 'datachip',
    BIOMOD: 'biomod',
    HARDWARE: 'hardware_common',
    SCRAP: 'scrap',
    CORRUPTED: 'corrupted_data'
};

const ITEM_VISUAL_PROFILES = {
    [ITEM_TYPES.DATACHIP]: {
        color: 'var(--neon-cyan)',
        shape: 'stacked_rect_css', // Keeping this as CSS-based for now for contrast
        texture: 'scanlines',
        segmentCount: 3 // For CSS renderer
    },
    [ITEM_TYPES.BIOMOD]: {
        color: 'var(--neon-magenta)',
        coreColor: '#ff80c0',
        shape: 'organic_svg', // NEW shape identifier for SVG rendering
        basePathId: 0, // We can have a few predefined SVG path styles
        texture: 'pulsing_core_svg' // For SVG core
    },
    [ITEM_TYPES.HARDWARE]: {
        color: '#aaaaaa',
        secondaryColor: '#777777', // For details
        shape: 'component_svg', // NEW shape identifier for SVG rendering
        componentLayoutId: 0, // For different arrangements of SVG rects/circles
        texture: 'metallic_sheen_svg' // Hint for potential SVG filters later
    },
    [ITEM_TYPES.SCRAP]: {
        color: '#8B4513',
        shape: 'irregular_cluster_css', // Keep as CSS for now
        texture: 'rust_patches'
    },
    [ITEM_TYPES.CORRUPTED]: {
        color: '#800080',
        shape: 'stacked_rect_css', // Can share CSS rendering but with different color/glitch
        texture: 'static_flicker',
        segmentCount: 3,
        isGlitchedEffect: true // Specific flag for CSS renderer
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

    const VOLATILE_LIFESPAN_MS = 8000; // 8 seconds

    itemIdCounter++;
    const baseItem = {
        id: `item-${itemIdCounter}-${Date.now().toString(36)}${Math.random().toString(36).substring(2,5)}`, // More unique ID
        type: type,
        name: generateItemName(type), // Placeholder for procedural name generation
        value: calculateItemValue(type), // Placeholder
        isFragile: (type !== ITEM_TYPES.SCRAP && type !== ITEM_TYPES.CORRUPTED && Math.random() < 0.15),
        isVolatile: (type !== ITEM_TYPES.SCRAP && type !== ITEM_TYPES.CORRUPTED && Math.random() < 0.10),
        corruptionLevel: (type === ITEM_TYPES.CORRUPTED) ? (Math.random() * 0.5 + 0.3) : (Math.random() < 0.05 ? Math.random() * 0.4 : 0),
        visualProfile: JSON.parse(JSON.stringify(ITEM_VISUAL_PROFILES[type])), // Deep copy base profile
        position: { x: 0, y: 0 }, // Position on conveyor, will be updated
        // Add more properties: weight, specific sub-type, required bin, etc.
    };

    // Apply any overrides for special items
    const item = { ...baseItem, ...overrides };

    // Post-process visual profile based on properties like corruption
    if (item.corruptionLevel > 0.3 && item.type !== ITEM_TYPES.CORRUPTED) {
        item.visualProfile.color = '#6a0dad';
        item.visualProfile.originalColor = ITEM_VISUAL_PROFILES[type].color;
    }
    if (item.type === ITEM_TYPES.CORRUPTED) {
        item.visualProfile.color = ITEM_VISUAL_PROFILES[ITEM_TYPES.CORRUPTED].color;
    }
    if (item.isVolatile) {
        item.visualProfile.animation = 'fast-pulse-red'; // Class name uses hyphens
        item.spawnTime = performance.now();
        item.lifespan = VOLATILE_LIFESPAN_MS;
    }
    if (item.isFragile) {
        item.visualProfile.borderStyle = 'thin-dashed-warning'; // Class name uses hyphens
    }

    // Example for BIOMOD basePathId selection in createItem if not overridden
    if (type === ITEM_TYPES.BIOMOD && overrides.basePathId === undefined) {
        item.visualProfile.basePathId = Math.floor(Math.random() * 2); // Assuming we'll define 2 base paths for biomods
    }
    // Example for HARDWARE componentLayoutId
    if (type === ITEM_TYPES.HARDWARE && overrides.componentLayoutId === undefined) {
        item.visualProfile.componentLayoutId = Math.floor(Math.random() * 2); // Assuming 2 layouts
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

console.log("ItemFactory: Module Loaded.");

// Filename: item-factory.js
// Directory: assets/js/core/