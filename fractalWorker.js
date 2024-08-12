// fractalWorker.js

onmessage = function (e) {
    const { zoom, panX, panY, maxIterations, width, height, formula } = e.data;
    const imageData = new Uint8ClampedArray(width * height * 4); // RGBA data

    function fractalFormula(zx, zy, cx, cy) {
        try {
            return eval(formula);
        } catch (error) {
            console.error("Error evaluating formula:", error);
            return 0;
        }
    }

    function computeFractal() {
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                let cx = (x - width / 2) / zoom + panX;
                let cy = (y - height / 2) / zoom + panY;
                let zx = cx;
                let zy = cy;
                let n = fractalFormula(zx, zy, cx, cy);

                let color = Math.min(255, Math.floor(255 * n / maxIterations));
                let index = (y * width + x) * 4;
                imageData[index] = color;
                imageData[index + 1] = color;
                imageData[index + 2] = color;
                imageData[index + 3] = 255;
            }
            if (y % 10 === 0) {
                postMessage({ progress: (y / height) * 100 });
            }
        }

        postMessage({ imageData: Array.from(imageData) });
    }

    computeFractal();
};
