self.onmessage = function (e) {
    const { zoom, panX, panY, maxIterations, width, height, formula } = e.data;

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    function fractal(x, y, maxIterations, zoom, panX, panY) {
        // Convert pixel coordinates to complex plane coordinates
        let zx = 1.5 * (x - width / 2) / (0.5 * zoom * width) + panX;
        let zy = (y - height / 2) / (0.5 * zoom * height) + panY;
        let cx = zx;
        let cy = zy;
        let i = 0;

        while (zx * zx + zy * zy < 4 && i < maxIterations) {
            let tmp = zx * zx - zy * zy + cx;
            zy = 2.0 * zx * zy + cy;
            zx = tmp;
            i++;
        }

        return i;
    }

    function render() {
        let progress = 0;
        for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const iter = fractal(x, y, maxIterations, zoom, panX, panY);
                    const color = iter === maxIterations ? 0 : 255 * iter / maxIterations;
                    const index = (y * width + x) * 4;
                    data[index] = color;     // Red
                    data[index + 1] = color; // Green
                    data[index + 2] = color; // Blue
                    data[index + 3] = 255;   // Alpha
                }
    
                progress = Math.round((y / height) * 100);
                self.postMessage({ progress });
    
                if (y % 10 === 0 || y === height - 1) {
                    self.postMessage({ progress });
                }
            }
    
            self.postMessage({ imageData: data.buffer });
        }
    
        render();
    };
    