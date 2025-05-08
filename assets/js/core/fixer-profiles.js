// assets/js/core/fixer-profiles.js - Defines the different Fixers in the game

import { ITEM_TYPES } from './item-factory.js'; // Import item types for preferences

export const FIXERS = {
    WHISPER: {
        id: "whisper",
        name: "Whisper",
        description: "Deals in quick, often illicit data transfers. Low pay, low risk, but very impatient.",
        preferredItemTypes: [ITEM_TYPES.DATACHIP, ITEM_TYPES.CORRUPTED],
        orderComplexity: { minQuantity: 1, maxQuantity: 3, propertyChance: 0.05 }, // Low chance of special properties
        reputation: 0, // Player's current rep with this fixer
        dialogueStyle: {
            orderPrefixes: [
                "Psst, Runner. Got a quick job:",
                "Urgent intercept: Need you to sort this data packet:",
                "Whisper here. Handle this on the quiet:",
                "Priority transmission for your eyes only:"
            ],
            success: ["Good work. Payment wired.", "Clean sort. As expected.", "You're useful. For now."],
            failure: ["Sloppy! That's on your tab.", "You trying to get me zeroed?", "Find another line of work."]
        }
    },
    DOC_NYX: {
        id: "docNyx",
        name: "Doc Nyx",
        description: "An enigmatic bio-hacker always in need of 'ethically sourced' biomods and samples. Pays well for pristine goods.",
        preferredItemTypes: [ITEM_TYPES.BIOMOD],
        orderComplexity: { minQuantity: 1, maxQuantity: 2, propertyChance: 0.25, prefersNonCorrupted: true, mightNeedFragile: true },
        reputation: 0,
        dialogueStyle: {
            orderPrefixes: [
                "Doc Nyx requisition: The following biologicals are required for project Chimera:",
                "Runner, my research demands fresh samples. Sort these:",
                "A delicate procedure needs specific components. Handle with care:",
                "Procure these biomods. Discretion is paramount, quality even more so."
            ],
            success: ["Acceptable. The organic matrix is stable.", "Excellent. These will advance my work significantly.", "Your efficiency is noted, Runner."],
            failure: ["Contaminated! This is useless!", "You call this careful handling? Incompetent!", "My 'patients' are disappointed."]
        }
    },
    SOCKET: {
        id: "socket",
        name: "Socket",
        description: "A gruff tech-scavenger and hardware broker. Always looking for specific parts, doesn't care much for condition.",
        preferredItemTypes: [ITEM_TYPES.HARDWARE, ITEM_TYPES.SCRAP],
        orderComplexity: { minQuantity: 2, maxQuantity: 5, propertyChance: 0.10, acceptsCorrupted: true },
        reputation: 0,
        dialogueStyle: {
            orderPrefixes: [
                "Socket needs parts, Runner. Get these to my drop:",
                "Got a buyer lined up for this hardware. Don't mess it up:",
                "This rig won't build itself. I need these components, stat:",
                "Found a schematic for a new toy. Requires these bits and pieces:"
            ],
            success: ["Solid work. Parts are good.", "Heh, not bad, Runner. This'll fetch a good price.", "Another successful transaction."],
            failure: ["Wrong parts! You blind or just stupid?", "This is junk! Not the junk I asked for!", "My client's gonna be pissed... and so am I."]
        }
    }
    // Add more fixers later
};

export function getFixerById(fixerId) {
    return Object.values(FIXERS).find(f => f.id === fixerId);
}

export function getAllFixerIds() {
    return Object.keys(FIXERS);
}

// Future: Functions to modify reputation, load/save reputation from player-state.js

console.log("FixerProfiles: Module Loaded.");
