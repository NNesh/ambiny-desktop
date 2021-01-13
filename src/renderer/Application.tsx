import React, { Fragment } from 'react';
import Screencast from './components/Screencast';
import VideoPreview from './components/VideoPreview';
import ControlPanel, { FormOptions } from './components/ControlPanel';
import Bounds from './modules/Bounds';
import 'bootstrap/dist/css/bootstrap.min.css';

import './Application.less';
import RegionsBuilder from './modules/RegionsBuilder';
import RegionColorCalculator from './components/RegionColorCalculator';

export interface State {
    currentScreen: string;
    verticalNumber: number;
    horizontalNumber: number;
    verticalPadding: number;
    horizontalPadding: number;
};

export default class Application extends React.Component<{}, State> {
    constructor(props) {
        super(props);

        this.state = {
            currentScreen: '',
            verticalNumber: 12,
            horizontalNumber: 12,
            verticalPadding: 5,
            horizontalPadding: 5,
        };
    }

    handleChangeScreen = (values: FormOptions) => {
        const {
            screen,
            ledHorNumber,
            ledVertNumber,
            vertPadding,
            horPadding,
        } = values;

        this.setState({
            currentScreen: screen,
            verticalNumber: ledVertNumber,
            horizontalNumber: ledHorNumber,
            verticalPadding: vertPadding,
            horizontalPadding: horPadding,
        });
    };

    render() {
        const {
            currentScreen,
            horizontalNumber,
            verticalNumber,
            horizontalPadding,
            verticalPadding,
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
                                            <RegionColorCalculator videoElement={videoElement} regions={regions} />
                                        )}
                                    </VideoPreview>
                                </div>
                                <div className="Application_Panel">
                                    {
                                        screens?.length && (
                                            <ControlPanel
                                                onUpdateOptions={this.handleChangeScreen}
                                                screens={screens}
                                                selectedScreenId={currentScreen || screens[0]?.id}
                                                initialLedVertNumber={horizontalNumber}
                                                initialLedHorNumber={verticalNumber}
                                                initialHorPadding={horizontalPadding}
                                                initialVertPadding={verticalPadding}
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
