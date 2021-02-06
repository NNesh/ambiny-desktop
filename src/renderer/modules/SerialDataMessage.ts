import DataMessage from '../classes/DataMessage';
import RGBA from '../classes/RGBA';
import { colorsToArray } from '../helpers/regions';

export default class SerialDataMessage extends DataMessage<RGBA[], Uint8Array> {
    private getSyncMessage(): number[] {
        return [115, 121, 110, 99, 32];
    }

    serialize(): Uint8Array {
        const colorArr = colorsToArray(this.item, false);
        return Uint8Array.from([...this.getSyncMessage(), ...colorArr]);
    }

    deserialize(data: Uint8Array): this {
        throw new Error('Method not implemented.');
    }
}