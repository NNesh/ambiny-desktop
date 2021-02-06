import { Deserializable, Serializable } from './Serializable';
import ItemStorage from './Storable';

export default abstract class DataMessage<S, T> extends ItemStorage<S> implements Serializable<T>, Deserializable<T> {
    abstract serialize(): T;
    abstract deserialize(data: T): this;
}