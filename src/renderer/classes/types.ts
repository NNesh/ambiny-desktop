import SerialPort from "serialport";

export interface DataChannel<D, R> {
    send: (data: D) => Promise<R | void>;
    write: (count?: number) => Promise<R>;
    open: (...args: any) => Promise<any>;
    close: (...args: any) => Promise<any>;
    isOpen: () => boolean;
};

export interface ScreenResolution {
    width: number;
    height: number;
};

export interface ScreenOptions {
    screenId: string;
    resolution: ScreenResolution;
    frameRate: number;
};

export interface PortOptions {
    port: string;
    baudRate: 115200|57600|38400|19200|9600;
};

export interface LEDOptions {
    horizontalNumber: number;
    verticalNumber: number;
    horizontalPadding: number;
    verticalPadding: number;
};
