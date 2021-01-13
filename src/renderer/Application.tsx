import React, { Fragment } from 'react';
import Screencast from './components/Screencast';
import VideoPreview from './components/VideoPreview';
import ControlPanel, { FormOptions } from './components/ControlPanel';
import 'bootstrap/dist/css/bootstrap.min.css';

import './Application.less';

export interface State {
    currentScreen: string;
};

export default class Application extends React.Component<{}, State> {
    constructor(props) {
        super(props);

        this.state = {
            currentScreen: '',
        };
    }

    handleChangeScreen = (values: FormOptions) => {
        this.setState({
            currentScreen: values.screen,
        });
    };

    render() {
        const { currentScreen } = this.state;
        return (
            <div className="Application">
                <Screencast screen={currentScreen} autoRequest>
                    {
                        (videoStream, screens) => (
                            <Fragment>
                                <div className="Application_VideoContainer">
                                    <VideoPreview videoStream={videoStream} />
                                </div>
                                <div className="Application_Panel">
                                    <ControlPanel onUpdateOptions={this.handleChangeScreen} screens={screens} selectedScreenId={currentScreen} />
                                </div>
                            </Fragment>
                        )
                    }
                </Screencast>
            </div>
        );
    }
}
