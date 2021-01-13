import Bounds from "./Bounds";
import Point from "./Point";
import Size from "./Size";

export enum Corner {
    TOP_RIGHT = 0,
    TOP_LEFT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT,
};

export enum Direction {
    TOP_BOTTOM = 0,
    LEFT_RIGHT,
};

export enum VerticalSide {
    LEFT = 0,
    RIGHT,
};

export enum HorizontalSide {
    TOP = 0,
    BOTTOM,
};

export default class RegionsBuilder {
    private corner: Corner;
    private verticalRegions: number;
    private horizontalRegions: number;
    private bounds: Bounds;

    constructor(verticalRegions: number, horizontalRegions: number, bounds: Bounds, corner: Corner = Corner.BOTTOM_RIGHT) {
        this.verticalRegions = verticalRegions;
        this.horizontalRegions = horizontalRegions;
        this.corner = corner;
        this.bounds = bounds;
    }

    setRegions = (verticalRegions: number, horizontalRegions: number): RegionsBuilder => {
        if (verticalRegions < 0 || horizontalRegions < 0) {
            throw new Error('Regions should be positive');
        }

        this.verticalRegions = verticalRegions;
        this.horizontalRegions = horizontalRegions;

        return this;
    };

    setCorner = (corner: Corner): RegionsBuilder => {
        this.corner = corner;
        return this;
    };

    setBounds = (bounds: Bounds): RegionsBuilder => {
        this.bounds = bounds;
        return this;
    };

    private generateSideRegions = (startPoint: Point, size: Size, count: number, direction: Direction, inverted = false): Bounds[] => {
        let bounds: Bounds[] = [];

        for (let idx = 0; idx < count; idx++) {
            const x = direction === Direction.LEFT_RIGHT ? startPoint.x + size.width * idx : startPoint.x;
            const y = direction === Direction.TOP_BOTTOM ? startPoint.y + size.height * idx : startPoint.y;
            const newBounds = new Bounds();
            newBounds.x = x;
            newBounds.y = y;
            newBounds.width = size.width;
            newBounds.height = size.height;

            bounds.push(newBounds);
        }

        if (inverted) {
            bounds = bounds.reverse();
        }

        return bounds;
    };

    build = (): Bounds[] => {
        const verticalRegionWidth = this.bounds.width * 0.1;
        const verticalRegionHeight = this.bounds.height / this.verticalRegions;
        const verticalOffset = (this.bounds.height - this.verticalRegions * verticalRegionHeight) / 2;
        const horizontalRegionHeight = this.bounds.height * 0.1;
        const horizontalRegionWidth = this.bounds.width / this.verticalRegions;
        const horizontalOffset = (this.bounds.width - this.horizontalRegions * horizontalRegionWidth) / 2;
        const bounds: Bounds[] = [];

        const generateVerticalSide = (side: VerticalSide, inverted = false) => {
            const verticalSize = new Size(verticalRegionWidth, verticalRegionHeight);

            return this.generateSideRegions(
                { x: side === VerticalSide.LEFT ? 0: this.bounds.width - verticalRegionWidth, y: verticalOffset },
                verticalSize,
                this.verticalRegions,
                Direction.TOP_BOTTOM,
                inverted
            );
        };

        const generateHorizontalSide = (side: HorizontalSide, inverted = false) => {
            const horizontalSize = new Size(horizontalRegionWidth, horizontalRegionHeight);

            return this.generateSideRegions(
                { x: horizontalOffset, y: side === HorizontalSide.TOP ? 0: this.bounds.height - horizontalRegionHeight },
                horizontalSize,
                this.horizontalRegions,
                Direction.LEFT_RIGHT,
                inverted
            );
        };

        switch(this.corner) {
        case Corner.BOTTOM_LEFT:
            bounds.push(...generateVerticalSide(VerticalSide.LEFT, true));
            bounds.push(...generateHorizontalSide(HorizontalSide.TOP, false));
            bounds.push(...generateVerticalSide(VerticalSide.RIGHT, false));
            bounds.push(...generateHorizontalSide(HorizontalSide.BOTTOM, true));
            break;
        case Corner.TOP_LEFT:
            bounds.push(...generateHorizontalSide(HorizontalSide.TOP, false));
            bounds.push(...generateVerticalSide(VerticalSide.RIGHT, false));
            bounds.push(...generateHorizontalSide(HorizontalSide.BOTTOM, true));
            bounds.push(...generateVerticalSide(VerticalSide.LEFT, true));
            break;
        case Corner.BOTTOM_RIGHT:
            bounds.push(...generateVerticalSide(VerticalSide.RIGHT, true));
            bounds.push(...generateHorizontalSide(HorizontalSide.TOP, true));
            bounds.push(...generateVerticalSide(VerticalSide.LEFT, false));
            bounds.push(...generateHorizontalSide(HorizontalSide.BOTTOM, false));
            break;
        case Corner.TOP_RIGHT:
            bounds.push(...generateHorizontalSide(HorizontalSide.TOP, true));
            bounds.push(...generateVerticalSide(VerticalSide.LEFT, false));
            bounds.push(...generateHorizontalSide(HorizontalSide.BOTTOM, false));
            bounds.push(...generateVerticalSide(VerticalSide.RIGHT, true));
            break;
        default:;
        }

        return bounds;
    };
}