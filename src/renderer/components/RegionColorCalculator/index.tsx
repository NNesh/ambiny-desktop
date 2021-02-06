// import { ipcRenderer } from 'electron';
import React, { createRef } from 'react';
import { calculateAvgColorsOfRegions } from '../../helpers/regions';
import Bounds from '../../classes/Bounds';
import { DataChannel } from '../../classes/types';
import { Serializable } from '../../classes/Serializable';
import DataMessage from '../../classes/DataMessage';
import RGBA from '../../classes/RGBA';

const DEFAULT_STYLE = {
    display: 'none',
};

export interface Props {
    videoElement: HTMLVideoElement;
    regions?: Bounds[];
    MessageCls: new () => DataMessage<RGBA[], Uint8Array>
    provider: DataChannel<Serializable<Uint8Array>, any>;
    onError?: (error: Error) => void;
};

export default class RegionColorCalculator extends React.Component<Props> {
    private canvasRef = createRef<HTMLCanvasElement>();
    private canvasContext: CanvasRenderingContext2D;
    private handleFrameTimeoutId: ReturnType<typeof setTimeout>;
    private dataMessage: DataMessage<RGBA[], Uint8Array>;
    private mounted = false;

    constructor(props) {
        super(props);

        const { MessageCls } = this.props;
        this.dataMessage = new MessageCls();
    }

    componentDidMount() {
        this.mounted = true;

        this.canvasContext = this.canvasRef.current.getContext('2d');

        const { provider } = this.props;
        if (provider.isOpen()) {
            this.handleFrame();
        }
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

                this.dataMessage.item = colors;
                provider.send(this.dataMessage)
                    .then(() => {
                        this.handleFrameTimeoutId = setTimeout(this.handleFrame, 50);
                    })
                    .catch((error) => {
                        console.log('Provider send:', error);
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