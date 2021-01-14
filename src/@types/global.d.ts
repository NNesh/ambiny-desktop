import { DesktopCapturerSource } from 'electron';
import RGBA from "../renderer/classes/RGBA";

declare global {
    interface ElectronAPI {
        getPrimaryDisplayId: () => string;
        sendUpdateColorsRequest: (colors: RGBA[]) => void;
        getScreenSources: () => Promise<DesktopCapturerSource[]>;
    }
    interface Window {
        electronApi?: ElectronAPI;
    }
}
