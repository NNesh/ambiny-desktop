export interface DataChannel<D, R> {
    send: (data: D) => Promise<R | void>;
    write: (count?: number) => Promise<R>
    open: (...args: any) => Promise<any>;
    close: (...args: any) => Promise<any>;
    isOpen: () => boolean;
};
