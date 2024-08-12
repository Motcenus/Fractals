const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');
const iterationsSlider = document.getElementById('iterationsSlider');
const iterationsValue = document.getElementById('iterationsValue');
const progressBar = document.getElementById('progressBar');
const worker = new Worker('fractalWorker.js');

const canvasWidth = 300; // Fixed width of the canvas
const canvasHeight = 300; // Fixed height of the canvas
const aspectRatio = canvasWidth / canvasHeight; // Aspect ratio for the fractal calculation

let maxIterations = 10; // Default iterations set to 10
let zoom = 200; // Default zoom level
let panX = 0; // Centered panning
let panY = 0; // Centered panning
let fractalFormula = "zx * zx - zy * zy + cx"; // Default formula

let isPanning = false;
let startX, startY;
let needsRendering = false;

iterationsSlider.min = 10; // Minimum value for iterations
iterationsSlider.max = 1000; // Maximum value for iterations
iterationsSlider.value = maxIterations; // Set default value
iterationsValue.textContent = maxIterations; // Display default value

function updateProgressBar(percentage) {
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${Math.round(percentage)}%`;
}

function drawFractal() {
    if (!needsRendering) return;
    needsRendering = false;

    // Calculate adjusted zoom and pan
    const adjustedZoom = zoom;
    const adjustedPanX = panX;
    const adjustedPanY = panY;

    worker.postMessage({
        zoom: adjustedZoom,
        panX: adjustedPanX,
        panY: adjustedPanY,
        maxIterations: maxIterations,
        width: canvas.width,
        height: canvas.height,
        formula: fractalFormula
    });
}

worker.onmessage = function (e) {
    if (e.data.error) {
        console.error(e.data.error);
        alert("Invalid formula.");
        return;
    }

    if (e.data.progress !== undefined) {
        updateProgressBar(e.data.progress);
    }

    if (e.data.imageData) {
        const imgData = new ImageData(new Uint8ClampedArray(e.data.imageData), canvas.width, canvas.height);
        ctx.putImageData(imgData, 0, 0);
        updateProgressBar(100); // Ensure progress bar reaches 100% when done
    }
};

function applyFormula() {
    const formulaInput = document.getElementById('formulaInput').value;
    if (formulaInput) {
        try {
            new Function('zx', 'zy', 'cx', 'cy', `return ${formulaInput};`);
            fractalFormula = formulaInput;
            needsRendering = true;
            requestAnimationFrame(drawFractal);
        } catch (e) {
            console.error("Invalid formula:", e);
            alert("Invalid formula. Please check the syntax.");
        }
    }
}

function updateFractalZoom(e) {
    e.preventDefault();
    const zoomFactor = 1.1;
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Zoom in or out
    if (e.deltaY < 0) {
        zoom *= zoomFactor;
    } else {
        zoom /= zoomFactor;
    }

    // Adjust panning to keep the point under the cursor stable
    const mouseX = (x / canvas.width) * 2 - 1;
    const mouseY = (y / canvas.height) * 2 - 1;

    // Calculate the new pan values
    const newPanX = panX - (mouseX - panX) * (1 - 1 / zoom);
    const newPanY = panY - (mouseY - panY) * (1 - 1 / zoom);

    // Apply the new pan values
    panX = newPanX;
    panY = newPanY;

    needsRendering = true;
    requestAnimationFrame(drawFractal);
}

function startPan(e) {
    isPanning = true;
    startX = e.clientX - canvas.getBoundingClientRect().left;
    startY = e.clientY - canvas.getBoundingClientRect().top;
}

function panFractal(e) {
    if (!isPanning) return;

    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;

    const dx = (x - startX) / zoom;
    const dy = (y - startY) / zoom;

    panX -= dx; // Inverted panning direction
    panY -= dy; // Inverted panning direction

    startX = x;
    startY = y;

    needsRendering = true;
    requestAnimationFrame(drawFractal);
}

function stopPan() {
    isPanning = false;
}

function updateIterations(e) {
    maxIterations = parseInt(e.target.value, 10);
    iterationsValue.textContent = maxIterations;
    needsRendering = true;
    requestAnimationFrame(drawFractal);
}

// Initialize the canvas and settings
function initialize() {
    // Set the canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Set initial zoom and pan values to ensure the fractal fits within the canvas
    zoom = 200; // Adjust this value if necessary
    panX = 0;
    panY = 0;

    // Draw the fractal for the first time
    needsRendering = true;
    requestAnimationFrame(drawFractal);
}

iterationsSlider.addEventListener('input', updateIterations);
canvas.addEventListener('wheel', updateFractalZoom);
canvas.addEventListener('mousedown', startPan);
canvas.addEventListener('mousemove', panFractal);
canvas.addEventListener('mouseup', stopPan);
canvas.addEventListener('mouseout', stopPan);
document.getElementById('applyFormula').addEventListener('click', applyFormula);

// Initialize the canvas and fractal display
initialize();
