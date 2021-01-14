export default class RGBA {
    private _r = 0;
    private _g = 0;
    private _b = 0;
    private _a = 0;

    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    private clampValue(value: number) {
        if (value < 0) {
            return 0;
        }

        if (value > 255) {
            return 255;
        }

        return value;
    }

    set r(value: number) {
        this._r = this.clampValue(value);
    }

    get r(): number {
        return this._r;
    }

    set g(value: number) {
        this._g = this.clampValue(value);
    }

    get g(): number {
        return this._g;
    }

    set b(value: number) {
        this._b = this.clampValue(value);
    }

    get b(): number {
        return this._b;
    }

    set a(value: number) {
        this._a = this.clampValue(value);
    }

    get a(): number {
        return this._a;
    }
}