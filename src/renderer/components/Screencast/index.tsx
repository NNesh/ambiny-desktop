import { DesktopCapturerSource } from 'electron';
import React, { ReactNode } from 'react';
import ScreencastHolder, { EVENTS } from '../../modules/ScreencastHolder';


export interface ScreencastProps {
    screen?: string;
    autoRequest?: boolean;
    children: (stream: MediaStream, screens: DesktopCapturerSource[]) => ReactNode;
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

    shouldComponentUpdate(nextProps: ScreencastProps): boolean {
        if (!nextProps.screen) {
            this.screencastHolder.dispose();
            return false;
        } else if (this.props.screen !== nextProps.screen) {
            this.screencastHolder.getMediaStream(nextProps.screen);
            return false;
        }

        return true;
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
        return this.props.children(this.screencastHolder.currentStream, this.screencastHolder.screens);
    }
}
