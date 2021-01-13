import React, { ReactNode } from 'react';
import ScreencastHolder, { EVENTS } from '../../modules/ScreencastHolder';


export interface ScreencastProps {
    screen?: string;
    autoRequest?: boolean;
    children: (stream: MediaStream) => ReactNode;
}

export interface State {
    currentStream?: MediaStream;
}

export default class Screencast extends React.Component<ScreencastProps, State> {
    private screencastHolder = new ScreencastHolder();

    constructor(props) {
        super(props);

        this.screencastHolder.on(EVENTS.STREAM_UPDATED, this.handleStreamUpdate);
        this.screencastHolder.on(EVENTS.STREAM_ERROR, this.handleStreamError);
    }

    componentDidMount() {
        const { autoRequest } = this.props;

        if (autoRequest) {
            this.screencastHolder.getMediaStream();
        }
    }

    componentWillUnmount() {
        this.screencastHolder.off(EVENTS.STREAM_UPDATED, this.handleStreamUpdate);
        this.screencastHolder.off(EVENTS.STREAM_ERROR, this.handleStreamError);
        this.screencastHolder.dispose();
    }

    handleStreamUpdate = () => {
        this.forceUpdate();
    };

    handleStreamError = (error: Error) => {
        console.error(error);
        this.forceUpdate();
    }

    render() {
        return this.props.children(this.screencastHolder.currentStream);
    }
}
