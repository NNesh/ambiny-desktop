import { DataChannel } from "../classes/types";

export default class SerialDataChannel implements DataChannel<string | number[] | Buffer, any> {
    private provider: SerialPortProvider;

    constructor() {
        this.provider = new window.electronApi.SerialPortProvider();
    }

    getAvailableSerialPorts = () => {
        return this.provider.list();
    }

    send = (data: string | number[] | Buffer): Promise<any> => {
        return this.provider.send(data);
    };

    write = (count?: number): Promise<any> => {
        throw new Error('This object doesn\'t implement a write method');
    };

    open = (path: string, options?: any): Promise<any> => {
        return this.provider.open(path, options);
    };

    close = (...args: any): Promise<any> => {
        return this.provider.close();
    };

    isOpen = (): boolean => {
        return this.provider.isOpen();
    };
}