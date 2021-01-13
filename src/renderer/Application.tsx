import React, { Fragment } from 'react';
import Screencast from './components/Screencast';
import VideoPreview from './components/VideoPreview';
import 'bootstrap/dist/css/bootstrap.min.css';

import './Application.less';

export default class Application extends React.Component {
    render() {
        return (
            <div className="Application">
                <div className="Application_VideoContainer">
                    <Screencast autoRequest>
                        {
                            (videoStream) => (
                                <Fragment>
                                    <VideoPreview videoStream={videoStream} />
                                </Fragment>
                            )
                        }
                    </Screencast>
                </div>
                <div className="Application_Panel">
                    Test
                </div>
            </div>
        );
    }
}
