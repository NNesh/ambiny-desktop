import { EventEmitter } from 'events';
import isEqual from 'lodash/isEqual';
import { PortInfo } from 'serialport';
import { DataChannel } from '../classes/types';


export default class SerialDataChannel extends EventEmitter implements DataChannel<string | number[] | Buffer, any> {
    private provider: SerialPortProvider;
    private devicesList: PortInfo[] = [];
    private checkDeviceInterval: ReturnType<typeof setInterval>;

    constructor() {
        super();
        this.provider = new window.electronApi.SerialPortProvider();

        this.checkDeviceInterval = null;
    }

    getAvailableSerialPorts = () => {
        return this.provider.list();
    };

    send = (data: string | number[] | Buffer): Promise<any> => {
        return this.provider.send(data);
    };

    open = async (path: string, options?: any): Promise<any> => {
        await this.provider.open(path, options);
        this.provider.on('close', this.handleProviderClosed);
        return await this.provider.flush();
    };

    close = (...args: any): Promise<any> => {
        return this.provider.close();
    };

    isOpen = (): boolean => {
        return this.provider.isOpen();
    };

    private handleProviderClosed = (error?: Error) => {
        this.emit('close', error);
    };

    private updateDevicesList = async () => {
        const newDevicesList = await this.getAvailableSerialPorts();
        if (!isEqual(this.devicesList, newDevicesList)) {
            this.emit('devicechanged', newDevicesList);
            this.devicesList = newDevicesList;
        }
    };

    on = (event: string | symbol, listener: (...args: any[]) => void): this => {
        if (event.toString() === 'devicechanged' && this.listenerCount(event) === 0) {
            this.checkDeviceInterval && clearInterval(this.checkDeviceInterval);
            this.checkDeviceInterval = setInterval(this.updateDevicesList, 5000);
        }

        return super.on(event, listener);
    };

    off = (event: string | symbol, listener: (...args: any[]) => void): this => {
        super.off(event, listener);

        if (event.toString() === 'devicechanged' && this.listenerCount(event) === 0) {
            clearInterval(this.checkDeviceInterval);
            this.checkDeviceInterval = null;
        }

        return this;
    };

    removeAllListeners = (event?: string | symbol): this => {
        super.removeAllListeners(event);

        if (!event || (event.toString() === 'devicechanged' && this.listenerCount(event) === 0)) {
            clearInterval(this.checkDeviceInterval);
            this.checkDeviceInterval = null;
        }

        return this;
    };
}
