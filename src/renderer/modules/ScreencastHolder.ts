import EventEmitter from 'events';
import { DesktopCapturerSource } from 'electron';

export enum EVENTS {
    STREAM_UPDATED = 'stream-updated',
    STREAM_ERROR = 'stream-error',
};

export interface Options {
    maxWidth?: number,
    minWidth?: number,
    maxHeight?: number,
    minHeight?: number,
};

export default class ScreencastHolder extends EventEmitter {
    private _currentStream: MediaStream = null;
    private _currentScreen: DesktopCapturerSource;
    private _screens: DesktopCapturerSource[] = [];
    private maxWidth = 640;
    private minWidth = 320;
    private maxHeight = 360;
    private minHeight = 200;

    constructor(options: Options = {}) {
        super();

        const {
            maxHeight = 0,
            minHeight = 0,
            maxWidth = 0,
            minWidth = 0,
        } = options;

        if (maxWidth > minWidth && maxHeight > minHeight) {
            this.maxHeight = maxHeight;
            this.minHeight = minHeight;
            this.maxWidth = maxWidth;
            this.minWidth = minWidth;
        }
    }

    set currentStream(value: MediaStream) {
        if (this._currentStream !== value) {
            this._currentStream = value;
            this.emit(EVENTS.STREAM_UPDATED, value);        
        }
    }

    get currentStream(): MediaStream {
        return this._currentStream;
    }

    get screens(): DesktopCapturerSource[] {
        return this._screens;
    }

    get currentScreen(): DesktopCapturerSource {
        return this._currentScreen;
    }

    static getScreens = () => {
        return window.electronApi.getScreenSources();
    };

    getScreen = async (id?: string) => {
        const sources = await ScreencastHolder.getScreens();

        this._screens = sources;

        if (id) {
            const pickedScreen = sources.find(source => source.id === id);
            if (!pickedScreen) {
                throw new Error('No such screen');
            }

            return pickedScreen;
        }

        if (sources.length === 0) {
            throw new Error('No screens');
        }

        return sources[0];
    };

    requestMedia = async (sourceId: string) => {
        const videoConstraints = {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sourceId,
                minWidth: this.minWidth,
                maxWidth: this.maxWidth,
                minHeight: this.minHeight,
                maxHeight: this.maxHeight,
                minFrameRate: 8,
                maxFrameRate: 12,
            },
        };

        const stream = await navigator.mediaDevices.getUserMedia({
            // @ts-ignore
            video: videoConstraints, 
            audio: false,
        });

        return stream;
    };

    getMediaStream = async (id?: string) => {
        this.dispose();

        try {
            const screen = await this.getScreen(id);
            const stream = await this.requestMedia(screen.id);

            this.currentStream = stream;
            this._currentScreen = screen;
        } catch (error) {
            this.currentStream = null;
            this._currentScreen = null;
            this.emit(EVENTS.STREAM_ERROR, error);
            throw error;
        }
    };

    dispose = () => {
        if (this.currentStream?.active) {
            this.currentStream.getTracks().forEach((track) => {
                track.stop();
            });
        }

        this.currentStream = null;
        this._currentScreen = null;
    };
}
