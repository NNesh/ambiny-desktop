import React from 'react';
import { PortInfo } from 'serialport';
import memoizeOne from 'memoize-one';
import { convertBaudRate } from './helpers/convert';
import { ScreencastChildrenParams } from './components/Screencast';
import VideoPreview from './components/VideoPreview';
import ControlPanel, { FormOptions } from './components/ControlPanel';
import RegionColorCalculator from './components/RegionColorCalculator';
import SerialDataChannel from './modules/SerialDataChannel';
import { BaudRate, ScreenResolution } from './classes/types';
import Source from './classes/Source';
import './Content.less';

export interface State {
    optionValues?: FormOptions;
    availablePorts?: PortInfo[];
    error?: Error;
    sources: Source[];
};

interface MemoizedFormOption {
    (option?: FormOptions, source?: Source): FormOptions;
};

interface UpdateFormOptions {
    sourceId?: string;
    resolution?: ScreenResolution;
    frameRate?: number;
    port?: string;
    baudRate?: BaudRate;
    horizontalNumber?: number;
    verticalNumber?: number;
    horizontalPadding?: number;
    verticalPadding?: number;
}

export default class Content extends React.Component<ScreencastChildrenParams, State> {
    private serialDataChannel = new SerialDataChannel();
    private memoizedInitialValues: MemoizedFormOption;

    constructor(props) {
        super(props);

        this.state = {
            optionValues: null,
            availablePorts: null,
            error: null,
            sources: this.props.availableSources || [],
        };

        this.serialDataChannel.on('close', this.handleClosedConnection);
        this.serialDataChannel.on('devicechanged', this.handleDeviceChanged);

        this.memoizedInitialValues = memoizeOne<MemoizedFormOption>((options?: FormOptions, source?: Source): FormOptions => {
            return {
                ...(options || {}),
                sourceId: source?.getId() || '',
            } as FormOptions;
        });
    }

    componentDidMount() {
        this.prepareApplicationOptions();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.availableSources && this.props.availableSources !== nextProps.availableSources) {
            this.updateOptions({}, nextProps);
        }
    }

    shouldComponentUpdate(nextProps, nextState: State) {
        const { port: nextPort, baudRate: nextBaudRate } = nextState.optionValues || {};
        const { port, baudRate } = this.state.optionValues || {};

        if (port != nextPort || baudRate !== nextBaudRate) {
            this.updateDataChannel(
                nextState.optionValues.port,
                {
                    baudRate: convertBaudRate(nextBaudRate),
                }
            );
        }

        return true;
    }

    componentWillUnmount() {
        this.serialDataChannel.close().catch(console.error);
        this.serialDataChannel.off('close', this.handleClosedConnection);
        this.serialDataChannel.off('devicechanged', this.handleDeviceChanged);
    }

    filterPorts = (ports: PortInfo[]) => {
        if (ports?.length > 0) {
            return ports[0].path?.includes('/dev') ? ports.filter(port => !!port.productId) : ports;
        }

        return ports;
    };

    updateAvailablePortsList = () => {
        return this.serialDataChannel.getAvailableSerialPorts()
            .then((ports) => {
                this.setState({
                    availablePorts: this.filterPorts(ports || []),
                });

                return ports;
            })
            .catch((error) => {
                console.error(error);
                this.setState({
                    availablePorts: null,
                });

                return [] as PortInfo[];
            });
    };

    updateDataChannel = async (port: string, options?: any) => {
        try {
            if (this.serialDataChannel.isOpen()) {
                await this.serialDataChannel.close();
            }

            await this.serialDataChannel.open(port, options);
        } catch (error) {
            console.error(error);
        } finally {
            this.forceUpdate();
        }
    };

    async prepareApplicationOptions() {
        try {
            const ports = await this.updateAvailablePortsList();

            let savedOptions: FormOptions;
            try {
                savedOptions = JSON.parse(localStorage.get("options")) as FormOptions;
            } catch (error) {
                console.error('No saved options. Default values will be used');
            }

            const options = {
                port: savedOptions?.port || ports[0]?.path || '',
                baudRate: savedOptions?.baudRate || 115200,
                horizontalNumber: savedOptions?.horizontalNumber || 12,
                verticalNumber: savedOptions?.verticalNumber || 12,
                horizontalPadding: savedOptions?.horizontalNumber || 5,
                verticalPadding: savedOptions?.verticalPadding || 5,
                frameRate: savedOptions?.frameRate || 15,
                resolution: savedOptions?.resolution || { width: 360, height: 260 },
                sourceId: savedOptions?.sourceId || '',
            };

            this.submitOptionValues(options);
        } catch (error) {
            this.setState({ error });
        }
    };

    private updateOptions(options: UpdateFormOptions, props?: ScreencastChildrenParams) {
        const { optionValues } = this.state;

        if (!optionValues) {
            throw new Error('Unable to update uninitialized options');
        }

        const newOptionsValues: FormOptions = {
            ...optionValues,
            ...options,
        };

        this.submitOptionValues(newOptionsValues, props);
    }

    private submitOptionValues(optionValues: FormOptions, props: ScreencastChildrenParams = this.props) {
        const { onChangeSource, availableSources } = props;
        const currentSource = availableSources.find(source => optionValues.sourceId === source.getId()) || availableSources[0];

        this.setState({
            optionValues: {
                ...optionValues,
                sourceId: currentSource?.getId() || '',
            },
            error: null,
        });

        if (currentSource) {
            onChangeSource(currentSource, {
                maxWidth: optionValues.resolution.width,
                maxHeight: optionValues.resolution.height,
                maxFrameRate: optionValues.frameRate,
            });
        }
    }

    handleUpdateControlOptions = (values: FormOptions) => {
        const { source, availableSources, onChangeSource } = this.props;
        const { optionValues } = this.state;

        if (
            values.sourceId &&
            (
                source?.getId() !== values.sourceId ||
                values.frameRate !== optionValues.frameRate
            )
        ) {
            onChangeSource(
                availableSources.find(availableSource => values.sourceId === availableSource.getId()),
                {
                    maxWidth: 360,
                    maxHeight: 220,
                    maxFrameRate: values.frameRate,
                }
            );
        }

        this.setState({
            optionValues: values,
        });
    };

    handleConnect = () => {
        const { port, baudRate } = this.state.optionValues || {};
        this.updateDataChannel(
            port,
            {
                baudRate: convertBaudRate(baudRate),
            }
        );
    };

    handleSendError = (error) => {
        console.error(error);
        this.handleConnect();
    };

    handleClosedConnection = (error) => {
        if (error?.disconnected) {
            this.forceUpdate();
        }
    };

    handleDeviceChanged = (newDevices: PortInfo[]) => {
        const { optionValues } = this.state;

        if (!optionValues) {
            return;
        }

        const { port } = optionValues;

        if (port) {
            const currentDevice = newDevices.find(device => port === device.path);
            if (!currentDevice) {
                this.setState({
                    optionValues: {
                        ...optionValues,
                        port: newDevices[0]?.path || '',
                    }
                });
            }
        } else {
            this.setState({
                optionValues: {
                    ...optionValues,
                    port: newDevices[0]?.path || '',
                }
            });
        }

        this.setState({
            availablePorts: this.filterPorts(newDevices),
        });
    };

    render() {
        const {
            availableSources,
            stream,
            source,
            error,
            requesting
        } = this.props;
        const { optionValues, availablePorts } = this.state;

        if (availableSources?.length === 0 || !optionValues || !availablePorts) {
            return (
                <div className="Content_Placeholder">
                    Application initializing...
                </div>
            );
        }

        if (optionValues?.sourceId && !screen && error) {
            return (
                <div className="Content_Placeholder">
                    Unable to get screen. Trying to get another screen...
                </div>
            );
        }

        const initialValues = requesting ? optionValues : this.memoizedInitialValues(optionValues, source);

        const {
            horizontalPadding,
            horizontalNumber,
            verticalPadding,
            verticalNumber,
        } = initialValues;

        return (
            <div className="Content">
                <div className="Content_VideoContainer">
                    <VideoPreview
                        videoStream={stream}
                        horizontalNumber={horizontalNumber}
                        verticalNumber={verticalNumber}
                        horizontalPadding={horizontalPadding}
                        verticalPadding={verticalPadding}
                    >
                        {(videoElement, regions) => (
                            <RegionColorCalculator
                                videoElement={videoElement}
                                regions={regions}
                                provider={this.serialDataChannel}
                                onError={this.handleConnect}
                            />
                        )}
                    </VideoPreview>
                </div>
                <div className="Content_Panel">
                    <ControlPanel
                        onUpdateOptions={this.handleUpdateControlOptions}
                        sources={availableSources}
                        initialValues={initialValues}
                        availablePorts={availablePorts}
                        onConnect={this.handleConnect}
                        connected={this.serialDataChannel.isOpen()}
                    />
                </div>
            </div>
        );
    }
}