// assets/js/ui/fixer-comms.js - Manages the Fixer communication pop-up

import { FIXERS } from '../core/fixer-profiles.js'; // To get Fixer names

let commsWindowElement = null;
let fixerNameElement = null;
let fixerImageElement = null; // For when you add sprites
let fixerMessageElement = null; // For specific short messages

let currentHideTimeout = null;

export function init() {
    commsWindowElement = document.getElementById('fixer-comms-window');
    if (commsWindowElement) {
        fixerNameElement = commsWindowElement.querySelector('.fixer-comms-name');
        fixerImageElement = commsWindowElement.querySelector('.fixer-comms-portrait');
        fixerMessageElement = commsWindowElement.querySelector('.fixer-comms-message');
    } else {
        console.error("FixerComms: #fixer-comms-window element not found!");
        return; // Crucial to stop if main element is missing
    }

    if(!fixerNameElement || !fixerImageElement || !fixerMessageElement) {
        console.warn("FixerComms: One or more child elements of comms window not found. Check IDs/classes.");
    }

    // Hide it initially
    if (commsWindowElement) commsWindowElement.classList.add('hidden');
    console.log("FixerComms: Initialized.");
}

export function showComms(fixerId, messageType = 'newOrder', duration = 5000) {
    if (!commsWindowElement || !fixerNameElement) {
        console.warn("FixerComms: Cannot show, elements not initialized or found.");
        return;
    }

    const fixerData = FIXERS[fixerId.toUpperCase()] || Object.values(FIXERS).find(f => f.id === fixerId); // Handle potential case difference

    if (!fixerData) {
        console.error(`FixerComms: Fixer data not found for ID: ${fixerId}`);
        fixerNameElement.textContent = "UNKNOWN FIXER";
        if (fixerImageElement) fixerImageElement.style.backgroundImage = '';
        if (fixerMessageElement) fixerMessageElement.textContent = "Signal lost...";
    } else {
        fixerNameElement.textContent = fixerData.name;
        if (fixerImageElement) {
            // Placeholder for when you have sprites
            // fixerImageElement.style.backgroundImage = `url('assets/images/fixers/${fixerData.id}_portrait.png')`;
            fixerImageElement.style.backgroundColor = `var(--fixer-color-${fixerData.id}, #333)`;
            fixerImageElement.innerHTML = `<span class="fixer-initials">${fixerData.name.substring(0,1).toUpperCase()}</span>`;
        }

        let displayMessage = "New transmission...";
        if (messageType === 'newOrder' && fixerData.dialogueStyle && fixerData.dialogueStyle.orderPrefixes) {
            const prefixes = fixerData.dialogueStyle.orderPrefixes;
            displayMessage = prefixes[Math.floor(Math.random() * prefixes.length)].substring(0, 50) + "...";
        } else if (messageType === 'orderSuccess' && fixerData.dialogueStyle && fixerData.dialogueStyle.success) {
            const successes = fixerData.dialogueStyle.success;
            displayMessage = successes[Math.floor(Math.random() * successes.length)];
        } else if (messageType === 'orderFail' && fixerData.dialogueStyle && fixerData.dialogueStyle.failure) {
             const failures = fixerData.dialogueStyle.failure;
            displayMessage = failures[Math.floor(Math.random() * failures.length)];
        }

        if (fixerMessageElement) fixerMessageElement.textContent = displayMessage;
    }

    commsWindowElement.classList.remove('hidden');
    commsWindowElement.classList.add('visible');

    if (currentHideTimeout) {
        clearTimeout(currentHideTimeout);
    }
    currentHideTimeout = setTimeout(() => {
        hideComms();
    }, duration);
}

export function hideComms() {
    if (commsWindowElement) {
        commsWindowElement.classList.remove('visible');
        setTimeout(() => {
            if (commsWindowElement) commsWindowElement.classList.add('hidden');
        }, 300);
    }
    currentHideTimeout = null;
}

console.log("FixerComms: Module Loaded.");