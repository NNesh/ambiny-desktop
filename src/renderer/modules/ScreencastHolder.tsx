import EventEmitter from 'events';
import { desktopCapturer, ipcRenderer, DesktopCapturerSource } from 'electron';

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
    private _screens: DesktopCapturerSource[] = [];
    private maxWidth = 640;
    private minWidth = 320;
    private maxHeight = 480
    private minHeight = 160;

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
        this._currentStream = value;
        this.emit(EVENTS.STREAM_UPDATED, value);        
    }

    get currentStream(): MediaStream {
        return this._currentStream;
    }

    get screens(): DesktopCapturerSource[] {
        return this._screens;
    }

    getPrimaryDisplayId = () => {
        return ipcRenderer.invoke('get-primary-screen-id');
    };

    getScreen = async (id?: string) => {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
        });

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

        const screen = await this.getScreen(id);
        try {
            const stream = await this.requestMedia(screen.id);

            this.currentStream = stream;
        } catch (error) {
            this.currentStream = null;
            this.emit(EVENTS.STREAM_ERROR, error);
        }
    };

    dispose = () => {
        if (this.currentStream?.active) {
            this.currentStream.getTracks().forEach((track) => {
                track.stop();
            });
        }
    };
}
