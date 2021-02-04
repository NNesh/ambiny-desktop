import flatten from 'lodash/flatten';
import RGBA from "../classes/RGBA";
import Bounds from "../classes/Bounds";

export function calculateAvgColorsOfRegions(canvasContext: CanvasRenderingContext2D, regions: Bounds[]) {
    return regions.map((region) => {
        const frame = canvasContext.getImageData(region.x, region.y, region.width, region.height);
        const { data } = frame;
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let sumA = 0;

        for (let idx = 0; idx < data.length; idx += 4) {
            sumR += data[idx];
            sumG += data[idx + 1];
            sumB += data[idx + 2];
            sumA += data[idx + 3];
        }

        const pixelCount = data.length / 4;

        return new RGBA(
            sumR / pixelCount,
            sumG / pixelCount,
            sumB / pixelCount,
            sumA / pixelCount
        );
    });
}

export function colorsToArray(colors: RGBA[], alpha = false): Array<number> {
    return flatten<number>(colors.map((color => color.toArray(alpha))));
}

export function colorsToBuffer(colors: RGBA[], alpha = false): Buffer {
    return Buffer.from(colorsToArray(colors, alpha));
}
