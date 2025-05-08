document.addEventListener('DOMContentLoaded', () => {
    // Game Elements
    const gameContainer = document.getElementById('game-container');
    const ordersDisplay = document.getElementById('current-order');
    const timeLeftDisplay = document.getElementById('time-left');
    const currentScoreDisplay = document.getElementById('current-score');
    const conveyorBelt = document.getElementById('conveyor-belt');
    const interactionArea = document.getElementById('interaction-area');
    const feedbackMessage = document.getElementById('feedback-message');
    const particlesContainer = document.getElementById('particles-container');

    // Game State
    let score = 0;
    let timeLeft = 90; // seconds
    let currentOrder = null;
    let gameTickInterval = null; // For per-second logic
    let renderInterval = null; // For smooth animation
    let itemSpawnInterval = null;
    let itemsOnConveyor = [];

    const ITEM_SPEED = 1.5; // Pixels per frame for conveyor movement (adjust for desired speed)

    // Define ITEM_TYPES with all necessary info, including color for particles/text
    const ITEM_TYPES = {
        DATA_CHIP: { id: 'datachip', label: 'Data Chip', cssClass: 'item-type-datachip', targetBin: 'bin-tech', color: 'var(--item-datachip-color)' },
        BIO_MOD: { id: 'biomod', label: 'Bio-Mod', cssClass: 'item-type-biomod', targetBin: 'bin-bio', color: 'var(--item-biomod-color)' },
        SCRAP: { id: 'scrap', label: 'Scrap', cssClass: 'item-type-scrap', targetBin: 'bin-discard', color: 'var(--item-scrap-color)' }
    };
    // For direct lookup by ID, which is often useful
    const ITEM_TYPES_BY_ID = {
        'datachip': ITEM_TYPES.DATA_CHIP,
        'biomod': ITEM_TYPES.BIO_MOD,
        'scrap': ITEM_TYPES.SCRAP
    };

    // For direct access to colors in JS if CSS variables aren't easily readable by JS for particles
    const ITEM_PARTICLE_COLORS = {
        datachip: '#00ffff', // neon-cyan
        biomod: '#ff00ff',   // neon-magenta
        scrap: '#999999'
    };


    const BINS_CONFIG = [
        { id: 'bin-tech', label: 'TECH', icon: '⚙️', accepts: ['datachip'] },
        { id: 'bin-bio', label: 'BIO', icon: '🧬', accepts: ['biomod'] },
        { id: 'bin-discard', label: 'DISCARD', icon: '🗑️', accepts: ['scrap'] }
    ];

    function initGame() {
        score = 0;
        timeLeft = 90;
        itemsOnConveyor = [];
        conveyorBelt.innerHTML = '';
        updateScoreDisplay();
        updateTimeDisplay();
        createBins();
        generateNewOrder();
        startGameLoops(); // Changed from startGameLoop
        startItemSpawning();
        document.querySelectorAll('.glitch-text').forEach(el => el.dataset.text = el.textContent);
    }

    function createBins() {
        interactionArea.innerHTML = '';
        BINS_CONFIG.forEach(binConfig => {
            const binEl = document.createElement('div');
            binEl.classList.add('sorting-bin');
            binEl.id = binConfig.id;
            binEl.dataset.accepts = binConfig.accepts.join(',');

            const iconEl = document.createElement('div');
            iconEl.classList.add('bin-icon');
            iconEl.textContent = binConfig.icon;

            const labelEl = document.createElement('div');
            labelEl.classList.add('bin-label');
            labelEl.textContent = binConfig.label;
            
            binEl.appendChild(iconEl);
            binEl.appendChild(labelEl);
            interactionArea.appendChild(binEl);

            binEl.addEventListener('dragover', handleDragOver);
            binEl.addEventListener('dragenter', handleDragEnter);
            binEl.addEventListener('dragleave', handleDragLeave);
            binEl.addEventListener('drop', handleDrop);
        });
    }

    function generateNewOrder() {
        // Explicitly filter for orderable items
        const orderableItemTypes = Object.values(ITEM_TYPES).filter(type => type.id !== 'scrap');
        if (orderableItemTypes.length === 0) {
            console.error("No orderable item types defined!");
            ordersDisplay.textContent = "Error: No items to order.";
            return;
        }
        const targetItemType = orderableItemTypes[Math.floor(Math.random() * orderableItemTypes.length)];
        const quantity = Math.floor(Math.random() * 3) + 2;
        
        currentOrder = {
            itemTypeId: targetItemType.id,
            itemLabel: targetItemType.label,
            itemCssClass: targetItemType.cssClass, // Store cssClass directly
            quantityRequired: quantity,
            quantityCollected: 0,
            targetBinId: targetItemType.targetBin
        };
        updateOrderDisplay();
    }

    function updateOrderDisplay() {
        if (currentOrder) {
            // Use currentOrder.itemCssClass directly
            ordersDisplay.innerHTML = `Collect ${currentOrder.quantityRequired - currentOrder.quantityCollected}x 
                                       <span class="order-item ${currentOrder.itemCssClass}-text">
                                       ${currentOrder.itemLabel}</span> &rarr; 
                                       <span class="order-bin">${BINS_CONFIG.find(b=>b.id === currentOrder.targetBinId).label}</span>`;
        } else {
            ordersDisplay.textContent = "No active order.";
        }
    }
    
    function startGameLoops() {
        // Per-second game logic (timer, etc.)
        if (gameTickInterval) clearInterval(gameTickInterval);
        gameTickInterval = setInterval(() => {
            timeLeft--;
            updateTimeDisplay();
            if (timeLeft <= 0) {
                endGame("Time's Up!");
            }
        }, 1000);

        // Animation/render loop (for smooth movement)
        if (renderInterval) clearInterval(renderInterval);
        renderInterval = setInterval(() => {
            moveItemsOnConveyor();
        }, 1000 / 30); // Aim for ~30 FPS
    }

    function startItemSpawning() {
        if (itemSpawnInterval) clearInterval(itemSpawnInterval);
        itemSpawnInterval = setInterval(() => {
            if (itemsOnConveyor.length < 6) { // Max items on belt
                spawnItem();
            }
        }, 1800 + Math.random() * 1500); // Spawn every 1.8-3.3 seconds
    }

    function spawnItem() {
        const itemTypesArray = Object.values(ITEM_TYPES);
        const randomType = itemTypesArray[Math.floor(Math.random() * itemTypesArray.length)];
        
        const itemEl = document.createElement('div');
        itemEl.classList.add('item', randomType.cssClass);
        itemEl.id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        itemEl.dataset.itemType = randomType.id;
        itemEl.dataset.targetBin = randomType.targetBin; // Store the correct target bin ID
        itemEl.draggable = true;
        
        itemEl.style.left = '-60px'; // Start off screen
        // itemEl.style.setProperty('--item-glow', ITEM_PARTICLE_COLORS[randomType.id] || '#ffff00'); // If CSS uses this var

        conveyorBelt.appendChild(itemEl);
        itemsOnConveyor.push({ element: itemEl, type: randomType, position: -60 });

        itemEl.addEventListener('dragstart', handleDragStart);
        itemEl.addEventListener('dragend', handleDragEnd);
    }
    
    function moveItemsOnConveyor() {
        itemsOnConveyor = itemsOnConveyor.filter(itemObj => {
            if (itemObj.element.classList.contains('dragging')) {
                return true; // Don't move if being dragged, but keep it in array
            }
            
            itemObj.position += ITEM_SPEED; 
            
            if (itemObj.position > conveyorBelt.offsetWidth + 60) {
                itemObj.element.remove(); 
                // Optional: penalty for missed item
                // showFeedback("Item Missed!", false, 1000);
                return false; 
            }
            itemObj.element.style.left = `${itemObj.position}px`;
            return true;
        });
    }

    let draggedItem = null;
    let originalParent = null; // To return item if drop is invalid outside a bin

    function handleDragStart(e) {
        draggedItem = e.target;
        originalParent = draggedItem.parentNode; // Store original parent
        e.dataTransfer.setData('text/plain', e.target.id);
        e.dataTransfer.effectAllowed = 'move';
        // Add dragging class after a tiny delay to allow the browser to pick up the drag image
        setTimeout(() => {
            draggedItem.classList.add('dragging');
            // Optional: move to a temporary high-z-index container if needed for visual layering
            // document.body.appendChild(draggedItem); // This changes coordinates, be careful
        }, 0);
    }

    function handleDragEnd(e) {
        if (draggedItem) { // Check if draggedItem still exists
            // If item was not dropped successfully on a bin, it might still be 'dragging'
            // Or if it was appended to body, put it back or remove it
            if (!draggedItem.parentElement || draggedItem.parentElement === document.body) {
                 // If it was moved to body and not dropped, or parent is gone, remove it
                 // This logic might need refinement based on how you handle invalid drops
            }
            draggedItem.classList.remove('dragging');
        }
        draggedItem = null;
        originalParent = null;
        document.querySelectorAll('.sorting-bin.target-hover').forEach(b => b.classList.remove('target-hover'));
    }

    function handleDragOver(e) {
        e.preventDefault(); 
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
        const binEl = e.target.closest('.sorting-bin');
        if (binEl) {
            binEl.classList.add('target-hover');
        }
    }

    function handleDragLeave(e) {
        const binEl = e.target.closest('.sorting-bin');
        if (binEl) {
           binEl.classList.remove('target-hover');
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const binEl = e.target.closest('.sorting-bin');
        if (!binEl || !draggedItem) return;

        binEl.classList.remove('target-hover');
        const itemType = draggedItem.dataset.itemType; // e.g., 'datachip'
        // const itemTargetBin = draggedItem.dataset.targetBin; // This is the *correct* bin for this item type
        const binId = binEl.id; // The bin it was actually dropped on
        const binAcceptedTypes = binEl.dataset.accepts.split(',');

        let correctSort = false;
        // Check if the dropped bin is the designated targetBin for this item type
        if (ITEM_TYPES_BY_ID[itemType] && ITEM_TYPES_BY_ID[itemType].targetBin === binId) {
            correctSort = true;
        } else if (binId === 'bin-discard' && itemType === 'scrap') { // Correctly discarding scrap
             correctSort = true; // This is a "correct" discard action
        }
        // Optionally, allow any item to be discarded, perhaps with neutral/minor penalty if not scrap
        // else if (binId === 'bin-discard') { 
        //     showFeedback("Item Discarded.", false, 1200);
        //     score -= 5; updateScoreDisplay();
        //     createParticles(e.clientX, e.clientY, ITEM_PARTICLE_COLORS.scrap, 8);
        //     // No "correctSort" true, but item is handled
        // }


        if (correctSort) {
            score += (itemType === 'scrap' && binId === 'bin-discard') ? 25 : 100; // Less points for just discarding scrap
            showFeedback("Correct Sort!", true);
            createParticles(e.clientX, e.clientY, ITEM_PARTICLE_COLORS[itemType] || '#ffffff');

            if (currentOrder && currentOrder.itemTypeId === itemType && binId === currentOrder.targetBinId) {
                currentOrder.quantityCollected++;
                if (currentOrder.quantityCollected >= currentOrder.quantityRequired) {
                    score += 250; // Bonus for completing order
                    showFeedback("Order Complete! +250", true, 2000);
                    generateNewOrder(); // Generate next order immediately
                }
            }
            updateOrderDisplay();
        } else if (binId === 'bin-discard' && itemType !== 'scrap') { // Explicitly penalize discarding non-scrap
            score -= 25;
            showFeedback("Valuable item discarded!", false);
            createParticles(e.clientX, e.clientY, ITEM_PARTICLE_COLORS.scrap, 10);
        }
        else { // Incorrect sort into a non-discard bin
            score -= 50;
            showFeedback("Incorrect Sort! -50", false);
            createParticles(e.clientX, e.clientY, '#ff0000', 15); // Error particles
        }
        
        draggedItem.remove(); 
        itemsOnConveyor = itemsOnConveyor.filter(i => i.element.id !== draggedItem.id);
        draggedItem = null; // Clear reference
        updateScoreDisplay();
    }

    function updateScoreDisplay() {
        currentScoreDisplay.textContent = score;
        currentScoreDisplay.dataset.text = score;
    }
    function updateTimeDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeLeftDisplay.textContent = formattedTime;
        timeLeftDisplay.dataset.text = formattedTime;
    }

    function showFeedback(message, isSuccess, duration = 1500) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = 'feedback-message'; // Reset classes
        feedbackMessage.classList.add('show');
        if (!isSuccess) feedbackMessage.classList.add('error');
        
        setTimeout(() => {
            feedbackMessage.classList.remove('show');
        }, duration);
    }

    function createParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.backgroundColor = color;
            const size = Math.random() * 5 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            const rect = gameContainer.getBoundingClientRect();
            particle.style.left = `${x - rect.left}px`; 
            particle.style.top = `${y - rect.top}px`;

            // Update particle animation in CSS to use random translate values
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40 + 10; // Travel distance
            particle.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
            
            particlesContainer.appendChild(particle);
            setTimeout(() => particle.remove(), 500); 
        }
    }
    // Ensure CSS for .particle animation uses these variables:
    // @keyframes fade-out-particle {
    //   to { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.5); }
    // }


    function endGame(message) {
        clearInterval(gameTickInterval);
        clearInterval(renderInterval);
        clearInterval(itemSpawnInterval);
        showFeedback(`Game Over: ${message} - Final Score: ${score}`, false, 5000);
        console.log(`Game Over: ${message} - Final Score: ${score}`);
        // Consider adding a restart button or similar functionality here
    }
    
    initGame();
});