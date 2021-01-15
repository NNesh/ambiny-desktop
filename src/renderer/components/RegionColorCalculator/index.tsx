// import { ipcRenderer } from 'electron';
import React, { createRef } from 'react';
import { calculateAvgColorsOfRegions, colorsToBuffer } from '../../helpers/regions';
import Bounds from '../../classes/Bounds';
import { DataChannel } from '../../classes/types';

const DEFAULT_STYLE = {
    display: 'none',
};

export interface Props {
    videoElement: HTMLVideoElement;
    regions?: Bounds[];
    provider: DataChannel<Buffer, any>;
    onError?: (error: Error) => void;
};

export default class RegionColorCalculator extends React.Component<Props> {
    private canvasRef = createRef<HTMLCanvasElement>();
    private canvasContext: CanvasRenderingContext2D;
    private handleFrameTimeoutId: NodeJS.Timeout;
    private mounted = false;

    componentDidMount() {
        this.mounted = true;

        this.canvasContext = this.canvasRef.current.getContext('2d');

        this.handleFrame();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidUpdate() {
        const { provider } = this.props;
        if (provider.isOpen() && !this.handleFrameTimeoutId) {
            this.handleFrame();
        }
    }

    handleFrame = () => {
        if (this.mounted) {
            const { videoElement, regions } = this.props;
            if (videoElement && regions?.length > 0) {
                this.canvasContext.canvas.width = videoElement.videoWidth;
                this.canvasContext.canvas.height = videoElement.videoHeight;
                this.canvasContext.drawImage(
                    videoElement,
                    0,
                    0,
                    videoElement.videoWidth,
                    videoElement.videoHeight
                );

                const colors = calculateAvgColorsOfRegions(this.canvasContext, regions);

                const { provider, onError } = this.props;
                provider.send(colorsToBuffer(colors))
                    .then(() => {
                        this.handleFrameTimeoutId = setTimeout(this.handleFrame, 100);
                    })
                    .catch((error) => {
                        onError && onError(error);
                        this.handleFrameTimeoutId = null;
                    });

                return;
            }
        }

        this.handleFrameTimeoutId = null;
    };

    render() {
        return (
            <canvas ref={this.canvasRef} style={DEFAULT_STYLE}></canvas>
        );
    }
}