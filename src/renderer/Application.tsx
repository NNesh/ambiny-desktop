import React, { Fragment } from 'react';
import Screencast from './components/Screencast';
import VideoPreview from './components/VideoPreview';
import ControlPanel, { FormOptions } from './components/ControlPanel';
import Bounds from './modules/Bounds';
import 'bootstrap/dist/css/bootstrap.min.css';

import './Application.less';
import RegionsBuilder from './modules/RegionsBuilder';

export interface State {
    currentScreen: string;
    verticalNumber: number;
    horizontalNumber: number;
};

export default class Application extends React.Component<{}, State> {
    constructor(props) {
        super(props);

        this.state = {
            currentScreen: '',
            verticalNumber: 12,
            horizontalNumber: 12,
        };
    }

    handleChangeScreen = (values: FormOptions) => {
        const { screen, ledHorNumber, ledVertNumber } = values;
        this.setState({
            currentScreen: values.screen,
            verticalNumber: ledVertNumber,
            horizontalNumber: ledHorNumber,
        });
    };

    render() {
        const {
            currentScreen,
            horizontalNumber,
            verticalNumber,
        } = this.state;
        return (
            <div className="Application">
                <Screencast screen={currentScreen} autoRequest>
                    {
                        (videoStream, screens) => (
                            <Fragment>
                                <div className="Application_VideoContainer">
                                    <VideoPreview videoStream={videoStream} horizontalNumber={horizontalNumber} verticalNumber={verticalNumber} />
                                </div>
                                <div className="Application_Panel">
                                    <ControlPanel
                                        onUpdateOptions={this.handleChangeScreen}
                                        screens={screens}
                                        selectedScreenId={currentScreen}
                                        initialLedVertNumber={horizontalNumber}
                                        initialLedHorNumber={verticalNumber}
                                    />
                                </div>
                            </Fragment>
                        )
                    }
                </Screencast>
            </div>
        );
    }
}
