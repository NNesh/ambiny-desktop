// import { ipcRenderer } from 'electron';
import React, { createRef } from 'react';
import { calculateAvgColorsOfRegions } from '../../helpers/regions';
import Bounds from '../../modules/Bounds';

const DEFAULT_STYLE = {
    display: 'none',
};

export interface Props {
    videoElement: HTMLVideoElement,
    regions?: Bounds[],
};

export default class RegionColorCalculator extends React.Component<Props> {
    private canvasRef = createRef<HTMLCanvasElement>();
    private canvasContext: CanvasRenderingContext2D;
    private mounted = false;

    componentDidMount() {
        this.mounted = true;

        this.canvasContext = this.canvasRef.current.getContext('2d');

        this.handleFrame();
    }

    componentWillUnmount() {
        this.mounted = false;
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
                window.electronApi.sendUpdateColorsRequest(colors);
                // ipcRenderer.send('request-update-colors', colors);
            }

            setTimeout(this.handleFrame, 120);
        }
    };

    render() {
        return (
            <canvas ref={this.canvasRef} style={DEFAULT_STYLE}></canvas>
        );
    }
}