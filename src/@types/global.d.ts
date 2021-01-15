import { DesktopCapturerSource } from 'electron';
import { OpenOptions, PortInfo } from 'serialport';
import RGBA from "../renderer/classes/RGBA";

declare global {
    interface SerialPortProvider {
        open: (portPath: string, options?: OpenOptions) => Promise<any>;
        close: () => Promise<any>;
        send: (data: string| number[] | Buffer) => Promise<any>;
        isOpen: () => boolean;
        list: () => Promise<PortInfo[]>;
    }

    interface ElectronAPI {
        getPrimaryDisplayId: () => string;
        sendUpdateColorsRequest: (colors: RGBA[]) => void;
        getScreenSources: () => Promise<DesktopCapturerSource[]>;
        SerialPortProvider: new () => SerialPortProvider;
    }
    interface Window {
        electronApi?: ElectronAPI;
    }
}
