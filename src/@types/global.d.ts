import RGBA from "../renderer/classes/rgba";

declare global {
    interface ElectronAPI {
        getPrimaryDisplayId: () => string;
        sendUpdateColorsRequest: (colors: RGBA[]) => void;
        getScreenSources: () => Promise<any>;
    }

    interface Window {
        electronApi?: ElectronAPI;
    }
}
