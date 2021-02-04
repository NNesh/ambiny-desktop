import { AspectRatio, ScreenResolution } from "../classes/types";

const PRECISION = 0.0001;

export function getAspectRatio(resolution: ScreenResolution): AspectRatio {
    const ratio = resolution.width / resolution.height;

    if (Math.abs(1.6 - ratio) < PRECISION) {
        return '16:10';
    }

    if (Math.abs(1.77777 - ratio) < PRECISION) {
        return '16:9';
    }

    if (Math.abs(1.333333 - ratio) < PRECISION) {
        return '4:3';
    }

    throw new Error('Unknown aspect ratio');
}