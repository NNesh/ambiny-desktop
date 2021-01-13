export default class Size {
    private _width = 0;
    private _height = 0;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    get width(): number {
        return this._width;
    }

    set width(value: number) {
        if (value < 0) {
            throw new Error('Width cannot be negative');
        }

        this._width = value;
    }

    get height(): number {
        return this._height;
    }

    set height(value: number) {
        if (value < 0) {
            throw new Error('Height cannot be negative');
        }

        this._height = value;
    }
}
