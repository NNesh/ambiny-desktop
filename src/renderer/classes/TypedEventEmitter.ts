import EventEmitter from 'events';

export default class TypedEventEmitter<T extends string> extends EventEmitter {
    addListener(event: T, listener: (...args: any[]) => void): this {
        return super.addListener(event, listener);
    }

    on(event: T, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    once(event: T, listener: (...args: any[]) => void): this {
        return super.once(event, listener);
    }

    prependListener(event: T, listener: (...args: any[]) => void): this {
        return super.prependListener(event, listener);
    }

    prependOnceListener(event: T, listener: (...args: any[]) => void): this {
        return super.prependOnceListener(event, listener);
    }

    removeListener(event: T, listener: (...args: any[]) => void): this {
        return super.removeListener(event, listener);
    }

    off(event: T, listener: (...args: any[]) => void): this {
        return super.off(event, listener);
    }

    removeAllListeners(event?: T): this {
        return super.removeAllListeners(event);
    }

    setMaxListeners(n: number): this {
        return super.setMaxListeners(n);
    }

    getMaxListeners(): number {
        return super.getMaxListeners();
    }

    listeners(event: T): Function[] {
        return super.listeners(event);
    }

    rawListeners(event: T): Function[] {
        return super.rawListeners(event);
    }

    emit(event: T, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }

    eventNames(): Array<T> {
        return super.eventNames() as Array<T>;
    }

    listenerCount(type: T): number {
        return super.listenerCount(type);
    }
}
