export default class ItemStorage<T> {
    private _item: T;
    
    set item(value: T) {
        this._item = value;
    }

    get item(): T {
        return this._item;
    }
}
