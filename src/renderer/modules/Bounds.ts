export default class Bounds {
    x = 0;
    y = 0;
    private _width = 0;
    private _height = 0;

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
