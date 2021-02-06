export interface Serializable<S> {
    serialize(): S;
}

export interface Deserializable<S> {
    deserialize(data: S): this;
}
