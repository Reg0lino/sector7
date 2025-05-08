// assets/js/utils/localstorage.js - Saving progress 
export function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); } 
export function loadData(key) { const data = localStorage.getItem(key); return data ? JSON.parse(data) : null; }

// Filename: localstorage.js
// Directory: assets/js/utils/
