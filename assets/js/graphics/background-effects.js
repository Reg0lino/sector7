// assets/js/graphics/background-effects.js - SIMPLIFIED TEST VERSION

let canvas = null;
let ctx = null;
let testX = 10; // For moving test rect
let digitalRainParticles = [];
const NUM_RAIN_PARTICLES = 100; // Number of rain particles for density/performance
const RAIN_SPEED = 2; // Adjust as needed for visual effect

export function init() {
    console.log("[TEST] BackgroundEffects.init() ENTERED");

    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
        console.error("[TEST] BackgroundEffects: Game container not found!");
        return;
    }

    // Find existing or create canvas
    canvas = document.getElementById('digital-rain-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'digital-rain-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '1';
        canvas.style.pointerEvents = 'none';
        // canvas.style.border = "2px dotted lime"; // Optional: Make canvas border visible
        gameContainer.insertBefore(canvas, gameContainer.firstChild);
        console.log("[TEST] BackgroundEffects: Created canvas element.");
    } else {
         console.log("[TEST] BackgroundEffects: Found existing canvas element.");
    }


    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("[TEST] BackgroundEffects: Failed to get 2D context!");
        return;
    }

    // Set initial size based on container
    canvas.width = gameContainer.offsetWidth;
    canvas.height = gameContainer.offsetHeight;

    digitalRainParticles = [];
    if (canvas.width > 0 && canvas.height > 0) {
        const headerHeightEstimate = 80; // Estimate height of ui-bar in pixels
        for (let i = 0; i < NUM_RAIN_PARTICLES; i++) {
            digitalRainParticles.push(createRainParticle(headerHeightEstimate));
        }
        console.log(`BackgroundEffects: Created ${NUM_RAIN_PARTICLES} initial particles.`);
        console.log(`[TEST] BackgroundEffects: Canvas context obtained. Initial size: ${canvas.width}x${canvas.height}`);
    } else {
         console.warn(`[TEST] BackgroundEffects: Canvas context obtained, but initial size is 0x0. Resize needed.`);
         // Add resize listener just in case initial size is zero
         window.addEventListener('resize', () => {
            if(canvas && gameContainer){
                canvas.width = gameContainer.offsetWidth;
                canvas.height = gameContainer.offsetHeight;
                console.log(`[TEST] BackgroundEffects: Resized canvas to ${canvas.width}x${canvas.height}`);
            }
         });
    }

    console.log("[REAL] BackgroundEffects: Init Complete.");
}

function createRainParticle(minY = 0) {
    const width = (canvas && canvas.width > 0) ? canvas.width : 1;
    const height = (canvas && canvas.height > 0) ? canvas.height : 1;
    const startY = Math.random() * (height - minY) + minY;
    return {
        x: Math.random() * width,
        y: startY,
        length: Math.random() * 20 + 10,
        opacity: Math.random() * 0.3 + 0.1,
        speed: (Math.random() * 0.5 + 0.5) * RAIN_SPEED
    };
}

export function update(deltaTime) {
    if (!ctx || !canvas || canvas.width === 0 || canvas.height === 0) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < digitalRainParticles.length; i++) {
        let p = digitalRainParticles[i];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + p.length);
        ctx.strokeStyle = `rgba(0, 255, 255, ${p.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        p.y += p.speed;
        if (p.y > canvas.height) {
            const newP = createRainParticle(0);
            digitalRainParticles[i] = newP;
            digitalRainParticles[i].y = -newP.length;
        }
    }
}

console.log("BackgroundEffects: Module Loaded (Real Rain Logic).");
