import React, { Fragment } from 'react';
import { PortInfo } from 'serialport';
import memoizeOne from 'memoize-one';
import { convertBaudRate } from './helpers/convert';
import Screencast, { ChildrenParams as ScerencastContentParams } from './components/Screencast';
import VideoPreview from './components/VideoPreview';
import ControlPanel, { FormOptions } from './components/ControlPanel';
import RegionColorCalculator from './components/RegionColorCalculator';
import SerialDataChannel from './modules/SerialDataChannel';
import 'bootstrap/dist/css/bootstrap.min.css';

import './Application.less';

export interface State {
    optionValues?: FormOptions;
    availablePorts?: PortInfo[];
    error?: Error;
    // screens ?
};

interface MemoizedFormOption {
    (option?: FormOptions, screenId?: string): FormOptions;
};

export default class Application extends React.Component<{}, State> {
    private serialDataChannel = new SerialDataChannel();
    private memoizedInitialValues: MemoizedFormOption;

    constructor(props) {
        super(props);

        this.state = {
            optionValues: null,
            availablePorts: null,
            error: null,
        };

        this.serialDataChannel.on('close', this.handleClosedConnection);
        this.serialDataChannel.on('devicechanged', this.handleDeviceChanged);

        this.memoizedInitialValues = memoizeOne<MemoizedFormOption>((options?: FormOptions, screenId?: string): FormOptions => {
            return {
                ...(options || {}),
                screenId: screenId || '',
            } as FormOptions;
        });
    }

    componentDidMount() {
        this.updateApplicationOptions();
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
            return ports[0].path?.includes('/') ? ports.filter(port => !!port.productId) : ports;
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

    updateApplicationOptions = async () => {
        try {
            const ports = await this.updateAvailablePortsList();

            let savedOptions: FormOptions;
            try {
                savedOptions = JSON.parse(localStorage.get("options")) as FormOptions;
            } catch (error) {
                console.error('No saved options. Default values will be used');
            }

            this.setState({
                optionValues: {
                    port: savedOptions?.port || ports[0]?.path || '',
                    baudRate: savedOptions?.baudRate || 115200,
                    horizontalNumber: savedOptions?.horizontalNumber || 12,
                    verticalNumber: savedOptions?.verticalNumber || 12,
                    horizontalPadding: savedOptions?.horizontalNumber || 5,
                    verticalPadding: savedOptions?.verticalPadding || 5,
                    frameRate: savedOptions?.frameRate || 15,
                    resolution: savedOptions?.resolution || { width: 640, height: 320 },
                    screenId: savedOptions?.screenId || '',
                },
                error: null,
            });
        } catch (error) {
            this.setState({ error });
        }
    };

    handleChangeScreen = (values: FormOptions) => {
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
            availablePorts: newDevices,
        });
    };

    renderScreencastContent = ({
        stream: videoStream,
        screen,
        availableScreens: screens,
        error,
        requesting,
    }: ScerencastContentParams) => {
        const {
            availablePorts,
            optionValues,
        } = this.state;

        if (screens?.length === 0 || !optionValues || !availablePorts) {
            return (
                <div className="Application_Placeholder">
                    Application initializing...
                </div>
            );
        }

        if (optionValues?.screenId && !screen && error) {
            // TODO: move to a handler
            this.setState({
                optionValues: {
                    ...optionValues,
                    screenId: '',
                },
            });

            return (
                <div className="Application_Placeholder">
                    Unable to get screen. Trying to get another screen...
                </div>
            );
        }

        const {
            horizontalNumber,
            horizontalPadding,
            verticalNumber,
            verticalPadding,
        } = optionValues;

        const initialValues = requesting ? optionValues : this.memoizedInitialValues(optionValues, screen);

        return (
            <Fragment>
                <div className="Application_VideoContainer">
                    <VideoPreview
                        videoStream={videoStream}
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
                <div className="Application_Panel">
                    <ControlPanel
                        onUpdateOptions={this.handleChangeScreen}
                        screens={screens}
                        initialValues={initialValues}
                        availablePorts={availablePorts}
                        onConnect={this.handleConnect}
                        connected={this.serialDataChannel.isOpen()}
                    />
                </div>
            </Fragment>
        );
    };

    render() {
        const { optionValues } = this.state;

        return (
            <div className="Application">
                <Screencast screen={optionValues?.screenId} frameRate={optionValues?.frameRate || 15} autoRequest>
                    {this.renderScreencastContent}
                </Screencast>
            </div>
        );
    }
}
