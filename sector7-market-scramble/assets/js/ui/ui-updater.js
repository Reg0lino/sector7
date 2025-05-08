// assets/js/ui/ui-updater.js - Updates score, timer, etc.

let scoreDisplay, timeDisplay, orderDisplay, feedbackContainer;

export function init() {
    scoreDisplay = document.getElementById('current-score-display');
    timeDisplay = document.getElementById('time-left-display');
    orderDisplay = document.getElementById('current-order-display');
    feedbackContainer = document.getElementById('feedback-message-container');

    if (!scoreDisplay || !timeDisplay || !orderDisplay || !feedbackContainer) {
        console.error("UI Updater: One or more critical UI elements not found!");
    }
    console.log('UI Updater initialized.');
}

export function updateScore(newScore) {
    if (scoreDisplay) {
        scoreDisplay.textContent = newScore;
        scoreDisplay.dataset.text = newScore; // For glitch effect
    }
}

export function updateTime(secondsLeft) {
    if (timeDisplay) {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeDisplay.textContent = formattedTime;
        timeDisplay.dataset.text = formattedTime;
    }
}

export function updateOrders(orderText) { // Can be simple text or complex HTML
    if (orderDisplay) {
        if (typeof orderText === 'string') {
            orderDisplay.textContent = orderText;
        } else { // Assuming orderText is an object with details
            // Example: orderText = { item: "Data Chip", quantity: 3, target: "Bin Alpha" }
            // You'll build more complex HTML here based on the actual order object structure
            orderDisplay.innerHTML = `Sort <span class="order-quantity">${orderText.quantity}x</span> 
                                      <span class="order-item-name">${orderText.item}</span> &rarr; 
                                      <span class="order-target-bin">${orderText.target}</span>`;
        }
    }
}

export function showFeedbackMessage(message, type = 'info', duration = 2000) {
    if (!feedbackContainer) return;

    const messageEl = document.createElement('div');
    messageEl.classList.add('feedback-message', type); // type can be 'success', 'error', 'info'
    messageEl.textContent = message;

    feedbackContainer.appendChild(messageEl);
    // Trigger animation
    requestAnimationFrame(() => { // Ensures element is in DOM before class change
        messageEl.classList.add('show');
    });

    setTimeout(() => {
        messageEl.classList.remove('show');
        // Remove element after fade out animation completes
        messageEl.addEventListener('transitionend', () => messageEl.remove(), { once: true });
    }, duration);
}