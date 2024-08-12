const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

let maxIterations = 10;
let zoom = 200;
let panX = 2;
let panY = 1.5;

let isPanning = false;
let startX, startY;
let fractalFormula = 'zx * zx + zy * zy < 4'; // Default formula

let targetZoom = zoom;
let targetPanX = panX;
let targetPanY = panY;
let zoomSpeed = 0.1; // Speed of zooming
let panningSpeed = 0.05; // Speed of panning

// Minimum detail threshold
const detailThreshold = 1; // Minimum detail size in pixels

// Function to create a color based on iterations
function getColor(iteration) {
    const normalizedIteration = iteration / maxIterations;
    const r = Math.floor(9 * (1 - normalizedIteration) * normalizedIteration * normalizedIteration * normalizedIteration * 255);
    const g = Math.floor(15 * (1 - normalizedIteration) * (1 - normalizedIteration) * normalizedIteration * normalizedIteration * 255);
    const b = Math.floor(8.5 * (1 - normalizedIteration) * (1 - normalizedIteration) * (1 - normalizedIteration) * normalizedIteration * 255);

    return `rgb(${r}, ${g}, ${b})`;
}

// Function to draw the fractal
function drawFractal() {
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let zx = (x / zoom) - panX;
            let zy = (y / zoom) - panY;
            let cx = zx;
            let cy = zy;

            let iteration = 0;

            // Evaluate the formula for fractal generation
            while (eval(fractalFormula) && iteration < maxIterations) {
                let xtemp = zx * zx - zy * zy + cx;
                zy = 2 * zx * zy + cy;
                zx = xtemp;
                iteration++;
            }

            // Only render pixels if they exceed the detail threshold
            if (iteration > 1) { // Use a minimum threshold for iteration
                ctx.fillStyle = iteration === maxIterations ? '#000' : getColor(iteration);
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}

// Smooth zoom animation
function smoothZoom() {
    if (Math.abs(zoom - targetZoom) > 1) {
        zoom += (targetZoom - zoom) * zoomSpeed;
        panX += (targetPanX - panX) * zoomSpeed;
        panY += (targetPanY - panY) * zoomSpeed;

        drawFractal();
        requestAnimationFrame(smoothZoom);
    }
}

// Handle zooming
function updateFractalZoom(e) {
    const zoomFactor = 1.1;
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPanX = (x / zoom) - panX;
    const newPanY = (y / zoom) - panY;

    if (e.deltaY < 0) {
        targetZoom = zoom * zoomFactor;
    } else {
        targetZoom = zoom / zoomFactor;
    }

    targetPanX = (x / targetZoom) - newPanX;
    targetPanY = (y / targetZoom) - newPanY;

    smoothZoom();
}

function startPan(e) {
    isPanning = true;
    startX = e.clientX - canvas.offsetLeft;
    startY = e.clientY - canvas.offsetTop;
}

function panFractal(e) {
    if (!isPanning) return;

    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;

    const dx = (x - startX) / zoom;
    const dy = (y - startY) / zoom;

    panX -= dx;
    panY -= dy;

    startX = x;
    startY = y;

    drawFractal();
}

function stopPan() {
    isPanning = false;
}

// Event listeners for zoom and pan
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    updateFractalZoom(e);
});

canvas.addEventListener('mousedown', startPan);
canvas.addEventListener('mousemove', panFractal);
canvas.addEventListener('mouseup', stopPan);
canvas.addEventListener('mouseout', stopPan);

// Handle control interactions
document.getElementById('iterationsSlider').addEventListener('input', (e) => {
    maxIterations = parseInt(e.target.value, 10);
    document.getElementById('iterationsValue').textContent = maxIterations;
    drawFractal();
});

document.getElementById('applyFormula').addEventListener('click', () => {
    fractalFormula = document.getElementById('formulaInput').value;
    drawFractal();
});

document.getElementById('resetView').addEventListener('click', () => {
    zoom = 200;
    panX = 2;
    panY = 1.5;
    targetZoom = zoom;
    targetPanX = panX;
    targetPanY = panY;
    document.getElementById('iterationsSlider').value = 10;
    document.getElementById('iterationsValue').textContent = 10;
    document.getElementById('formulaInput').value = 'zx * zx + zy * zy < 4'; // Reset to default formula
    maxIterations = 10; // Reset maxIterations to default
    drawFractal();
});

// Initial draw
drawFractal();
