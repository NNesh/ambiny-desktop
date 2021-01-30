import Source from './Source';
import TypedEventEmitter from './TypedEventEmitter';

export interface CaptureProvider<S> {
    requestCaptureSource(source: Source): Promise<S>;
    getAvailableSources(): Promise<Source[]>;
}

export default abstract class EmitableCaptureProvider<S, E extends string> extends TypedEventEmitter<E> implements CaptureProvider<S> {
    abstract requestCaptureSource(source: Source): Promise<S>;
    abstract getAvailableSources(): Promise<Source[]>;
}
