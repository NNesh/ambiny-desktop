import differenceBy from 'lodash/differenceBy';
import EmitableCaptureProvider from '../classes/CaptureProvider';
import Source from '../classes/Source';

export type ScreenEventType = 'screens-changed';

export interface ScreenCaptureOptions {
    minWidth?: number;
    maxWidth: number;
    minHeight?: number;
    maxHeight: number;
    minFrameRate?: number;
    maxFrameRate: number;
}

export default class SourceCaptureProvider extends EmitableCaptureProvider<MediaStream, ScreenEventType> {
    private checkSourcesIntervalId: ReturnType<typeof setInterval> = null;
    private lastSources: Source[] = [];

    constructor(private _captureOptions: ScreenCaptureOptions, enableChecking = true, checkPeriod = 3000) {
        super();

        if (enableChecking) {
            this.startCheckingSources(checkPeriod);
        }
    }

    async requestCaptureSource(source: Source, options?: ScreenCaptureOptions): Promise<MediaStream> {
        if (options) {
            this._captureOptions = options;
        }
        
        const videoConstraints = {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.getId(),
                minWidth: this._captureOptions.minWidth,
                maxWidth: this._captureOptions.maxWidth,
                minHeight: this._captureOptions.minHeight,
                maxHeight: this._captureOptions.maxHeight,
                minFrameRate: this._captureOptions.minFrameRate,
                maxFrameRate: this._captureOptions.maxFrameRate,
            },
        };

        const stream = await navigator.mediaDevices.getUserMedia({
            // @ts-ignore
            video: videoConstraints,
            audio: false,
        });

        return stream;
    }

    async getAvailableSources(): Promise<Source[]> {
        const screens = await window.electronApi.getScreenSources();
        const sources = screens.map(screen => new Source(screen.id, 'screen', screen.name));

        this.lastSources = sources;

        return sources;
    }

    startCheckingSources(checkPeriod) {
        this.stopCheckingSources();
        this.checkSourcesIntervalId = setInterval(this.checkSources.bind(this), checkPeriod);
    }

    stopCheckingSources() {
        if (this.checkSourcesIntervalId) {
            clearInterval(this.checkSourcesIntervalId);
            this.checkSourcesIntervalId = null;
        }
    }

    private async checkSources() {
        const availableSources = await this.getAvailableSources();
        const availableSourcesIds = availableSources.map(source => source.getId());
        const lastSourcesIds = this.lastSources.map(source => source.getId());

        const difference = differenceBy(availableSourcesIds, lastSourcesIds).length;

        if (difference > 0 || availableSourcesIds.length < lastSourcesIds.length) {
            this.emit('screens-changed', availableSources);
            this.lastSources = availableSources;
        }
    }
}
