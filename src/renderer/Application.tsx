import React, { Fragment } from 'react';
import { PortInfo } from 'serialport';
import Screencast from './components/Screencast';
import VideoPreview from './components/VideoPreview';
import ControlPanel, { FormOptions } from './components/ControlPanel';
import RegionColorCalculator from './components/RegionColorCalculator';
import SerialDataChannel from './modules/SerialDataChannel';
import 'bootstrap/dist/css/bootstrap.min.css';

import './Application.less';

export interface State {
    currentScreen: string;
    verticalNumber: number;
    horizontalNumber: number;
    verticalPadding: number;
    horizontalPadding: number;
    portPath: string;
    availablePorts?: PortInfo[],
};

export default class Application extends React.Component<{}, State> {
    private serialDataChannel = new SerialDataChannel();

    constructor(props) {
        super(props);

        this.state = {
            currentScreen: '',
            verticalNumber: 12,
            horizontalNumber: 12,
            verticalPadding: 5,
            horizontalPadding: 5,
            portPath: '',
            availablePorts: null,
        };
    }

    componentDidMount() {
        const { portPath } = this.state;

        this.updateAvailablePortsList();
        portPath && this.serialDataChannel.open(portPath);
    }

    shouldComponentUpdate(nextProps, nextState: State) {
        const { portPath } = this.state;

        if (nextState.portPath && portPath != nextState.portPath) {
            this.updateDataChannel(nextState.portPath);
        }

        return true;
    }

    componentWillUnmount() {
        this.serialDataChannel.close();
    }

    updateAvailablePortsList = () => {
        return this.serialDataChannel.getAvailableSerialPorts()
            .then((ports) => {
                this.setState({
                    availablePorts: ports//.filter(port => !!port.productId),
                });
            })
            .catch((error) => {
                console.error(error);
                this.setState({
                    availablePorts: null,
                });
            });
    };

    updateDataChannel = async (portPath: string, options?: any) => {
        try {
            if (this.serialDataChannel.isOpen()) {
                await this.serialDataChannel.close();
            }
    
            await this.serialDataChannel.open(portPath, options);
        } finally {
            this.forceUpdate();
        }        
    };

    handleChangeScreen = (values: FormOptions) => {
        const {
            screen,
            ledHorNumber,
            ledVertNumber,
            vertPadding,
            horPadding,
            port,
        } = values;

        this.setState({
            currentScreen: screen,
            verticalNumber: ledVertNumber,
            horizontalNumber: ledHorNumber,
            verticalPadding: vertPadding,
            horizontalPadding: horPadding,
            portPath: port,
        });
    };

    render() {
        const {
            currentScreen,
            horizontalNumber,
            verticalNumber,
            horizontalPadding,
            verticalPadding,
            availablePorts,
        } = this.state;

        return (
            <div className="Application">
                <Screencast screen={currentScreen} autoRequest>
                    {
                        (videoStream, screens) => (
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
                                            <RegionColorCalculator videoElement={videoElement} regions={regions} provider={this.serialDataChannel} />
                                        )}
                                    </VideoPreview>
                                </div>
                                <div className="Application_Panel">
                                    {
                                        screens?.length && availablePorts?.length && (
                                            <ControlPanel
                                                onUpdateOptions={this.handleChangeScreen}
                                                screens={screens}
                                                selectedScreenId={currentScreen || screens[0]?.id}
                                                initialLedVertNumber={horizontalNumber}
                                                initialLedHorNumber={verticalNumber}
                                                initialHorPadding={horizontalPadding}
                                                initialVertPadding={verticalPadding}
                                                availablePorts={availablePorts}
                                            />
                                        )
                                    }
                                </div>
                            </Fragment>
                        )
                    }
                </Screencast>
            </div>
        );
    }
}
