export interface Openable {
    open: (...args: any) => Promise<any>;
    close: (...args: any) => Promise<any>;
    isOpen: () => boolean;
};

export interface Sendable<D, R> {
    send: (data: D) => Promise<R | void>;
}

export interface DataChannel<D, R> extends Sendable<D, R>, Openable {};

export interface ScreenResolution {
    width: number;
    height: number;
};

export type BaudRate = 115200|57600|38400|19200|9600;

export type AspectRatio = '16:9' | '16:10' | '4:3';

export interface ScreenOptions {
    sourceId: string;
    resolution: ScreenResolution;
    frameRate: number;
};

export interface PortOptions {
    port: string;
    baudRate: BaudRate;
};

export interface LEDOptions {
    horizontalNumber: number;
    verticalNumber: number;
    horizontalPadding: number;
    verticalPadding: number;
};
