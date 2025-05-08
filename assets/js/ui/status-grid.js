// assets/js/ui/status-grid.js - Manages the visual status grid display

const GRID_ROWS = 5;
const GRID_COLS = 10;
let gridCells = [];
let gridContainer = null;

const CELL_STATE_CLASSES = {
    off: 'cell-off',
    normal: 'cell-normal',
    warning: 'cell-warning',
    error: 'cell-error',
    surge: 'cell-surge',
    lag: 'cell-lag',
    corruption: 'cell-corruption'
};

let currentPatternInterval = null;

export function init() {
    gridContainer = document.getElementById('status-grid-display');
    if (!gridContainer) {
        console.error("StatusGrid: Container #status-grid-display not found!");
        return;
    }
    gridContainer.innerHTML = '';
    gridContainer.style.setProperty('--grid-rows', GRID_ROWS);
    gridContainer.style.setProperty('--grid-cols', GRID_COLS);
    gridCells = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        gridCells[r] = [];
        for (let c = 0; c < GRID_COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('status-grid-cell', CELL_STATE_CLASSES.off);
            gridContainer.appendChild(cell);
            gridCells[r][c] = cell;
        }
    }
    console.log("StatusGrid: Initialized with", GRID_ROWS * GRID_COLS, "cells.");
    setOverallStatus('normal');
}

function clearAllPatterns() {
    if (currentPatternInterval) {
        clearInterval(currentPatternInterval);
        currentPatternInterval = null;
    }
    gridCells.flat().forEach(cell => {
        Object.values(CELL_STATE_CLASSES).forEach(cls => cell.classList.remove(cls));
        cell.classList.add(CELL_STATE_CLASSES.off);
        cell.style.animation = 'none';
    });
}

export function setOverallStatus(statusType) {
    if (!gridContainer) return;
    clearAllPatterns();
    console.log("StatusGrid: Setting overall status to", statusType);
    switch (statusType) {
        case 'normal':
            currentPatternInterval = setInterval(() => {
                const r = Math.floor(Math.random() * GRID_ROWS);
                const c = Math.floor(Math.random() * GRID_COLS);
                flashCell(gridCells[r][c], CELL_STATE_CLASSES.normal, 300);
                if (Math.random() < 0.3) {
                     gridCells[r][c].classList.add(CELL_STATE_CLASSES.normal);
                     setTimeout(()=> gridCells[r][c].classList.remove(CELL_STATE_CLASSES.normal), 1000 + Math.random()*2000);
                }
            }, 200);
            break;
        case 'warning':
            gridCells.flat().forEach((cell, i) => {
                cell.classList.remove(CELL_STATE_CLASSES.off);
                cell.classList.add(CELL_STATE_CLASSES.warning);
                cell.style.animation = `pulseWarning ${1 + Math.random()*0.5}s infinite alternate ${i*0.05}s`;
            });
            break;
        case 'error':
            gridCells.flat().forEach(cell => {
                cell.classList.remove(CELL_STATE_CLASSES.off);
                cell.classList.add(CELL_STATE_CLASSES.error);
            });
            gridContainer.style.animation = 'flashBorderError 0.5s infinite alternate';
            break;
        case 'surge':
            let surgeIndex = 0;
            const flatCells = gridCells.flat();
            currentPatternInterval = setInterval(() => {
                if (surgeIndex < flatCells.length) {
                    flashCell(flatCells[surgeIndex], CELL_STATE_CLASSES.surge, 100);
                    surgeIndex++;
                } else {
                    surgeIndex = 0;
                    flatCells.forEach(c => c.classList.add(CELL_STATE_CLASSES.surge));
                    setTimeout(()=> flatCells.forEach(c => c.classList.remove(CELL_STATE_CLASSES.surge)), 50);
                }
            }, 25);
            break;
        case 'lag':
             gridCells.flat().forEach((cell, i) => {
                cell.classList.remove(CELL_STATE_CLASSES.off);
                cell.classList.add(CELL_STATE_CLASSES.lag);
                cell.style.animation = `pulseLag ${2 + Math.random()}s infinite alternate ${i*0.1}s`;
            });
            break;
        case 'corruption':
            currentPatternInterval = setInterval(() => {
                for (let i = 0; i < 3; i++) {
                    const r = Math.floor(Math.random() * GRID_ROWS);
                    const c = Math.floor(Math.random() * GRID_COLS);
                    const originalClasses = Array.from(gridCells[r][c].classList);
                    gridCells[r][c].className = 'status-grid-cell';
                    gridCells[r][c].classList.add(CELL_STATE_CLASSES.corruption);
                    setTimeout(() => {
                        gridCells[r][c].className = 'status-grid-cell';
                        originalClasses.forEach(cls => { if(cls !== CELL_STATE_CLASSES.corruption) gridCells[r][c].classList.add(cls) });
                        if(!gridCells[r][c].classList.contains(CELL_STATE_CLASSES.normal) && !gridCells[r][c].classList.contains(CELL_STATE_CLASSES.warning)){
                           gridCells[r][c].classList.add(CELL_STATE_CLASSES.off);
                        }
                    }, 100 + Math.random() * 100);
                }
            }, 150);
            break;
        default:
            console.warn("StatusGrid: Unknown statusType", statusType);
    }
}

function flashCell(cellElement, stateClass, durationMs) {
    if (!cellElement) return;
    const originalClasses = Array.from(cellElement.classList);
    Object.values(CELL_STATE_CLASSES).forEach(cls => cellElement.classList.remove(cls));
    cellElement.classList.add(stateClass);
    setTimeout(() => {
        cellElement.classList.remove(stateClass);
        let hasBaseState = false;
        originalClasses.forEach(cls => {
            if (cls !== 'status-grid-cell' && !Object.values(CELL_STATE_CLASSES).includes(cls)) {
            }
        });
        if (!cellElement.classList.contains(CELL_STATE_CLASSES.normal)) {
             if(![CELL_STATE_CLASSES.warning, CELL_STATE_CLASSES.lag, CELL_STATE_CLASSES.error].some(cls => cellElement.classList.contains(cls))){
                cellElement.classList.add(CELL_STATE_CLASSES.off);
             }
        }
    }, durationMs);
}

console.log("StatusGrid: Module Loaded.");
