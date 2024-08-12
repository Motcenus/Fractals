const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

let maxIterations = 100;
let zoom = 200;
let panX = 2;
let panY = 1.5;

// Function to draw the fractal
function drawFractal() {
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            let zx = (x / zoom) - panX;
            let zy = (y / zoom) - panY;
            let cx = zx;
            let cy = zy;

            let iteration = 0;

            while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
                let xtemp = zx * zx - zy * zy + cx;
                zy = 2 * zx * zy + cy;
                zx = xtemp;
                iteration++;
            }

            const color = iteration === maxIterations ? 0 : (iteration * 255 / maxIterations);

            ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

// Redraw the fractal when zooming in/out or panning
function updateFractal(e) {
    if (e.deltaY < 0) {
        zoom *= 1.2; // Zoom in
    } else {
        zoom /= 1.2; // Zoom out
    }

    // Update pan values based on mouse position
    panX += (e.offsetX - canvas.width / 2) / zoom;
    panY += (e.offsetY - canvas.height / 2) / zoom;

    drawFractal();
}

// Event listener for mouse scroll (zooming)
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    updateFractal(e);
});

// Initial draw
drawFractal();
