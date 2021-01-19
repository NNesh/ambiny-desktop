import { DesktopCapturerSource } from 'electron';
import React, { ReactNode } from 'react';
import ScreencastHolder, { EVENTS } from '../../modules/ScreencastHolder';


export interface ChildrenParams {
    stream?: MediaStream;
    screen?: string;
    availableScreens: DesktopCapturerSource[];
    error?: Error;
    requesting?: boolean;
};

export interface ScreencastProps {
    screen?: string;
    autoRequest?: boolean;
    children: (params: ChildrenParams) => ReactNode;
    frameRate: number;
}

export interface State {
    error?: Error;
    requesting?: boolean;
}

export default class Screencast extends React.Component<ScreencastProps, State> {
    private mounted = false;
    private screencastHolder = new ScreencastHolder();

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            requesting: false,
        };

        this.screencastHolder.on(EVENTS.STREAM_UPDATED, this.handleStreamUpdate);
        this.screencastHolder.on(EVENTS.STREAM_ERROR, this.handleStreamError);
    }

    componentDidMount() {
        const { autoRequest, screen } = this.props;

        this.mounted = true;

        if (autoRequest) {
            this.requestMediaStream(screen);
        }
    }

    shouldComponentUpdate(nextProps: ScreencastProps): boolean {
        const { screen, frameRate } = this.props;
        if (screen && !nextProps.screen) {
            this.screencastHolder.dispose();
        } else if ((screen !== nextProps.screen) || (frameRate !== nextProps.frameRate)) {
            this.screencastHolder.frameRate = nextProps.frameRate;
            this.requestMediaStream(nextProps.screen);
            return false;
        }

        return true;
    }

    requestMediaStream = (screen?: string) => {
        this.setState({
            error: null,
            requesting: true,
        }, () => {
            this.screencastHolder.getMediaStream(screen);
        });
    };

    componentWillUnmount() {
        this.mounted = false;

        this.screencastHolder.off(EVENTS.STREAM_UPDATED, this.handleStreamUpdate);
        this.screencastHolder.off(EVENTS.STREAM_ERROR, this.handleStreamError);
        this.screencastHolder.dispose();
    }

    handleStreamUpdate = () => {
        if (this.mounted) {
            this.setState({
                error: null,
                requesting: false,
            });
        }
    };

    handleStreamError = (error: Error) => {
        if (this.mounted) {
            console.error(error);
            this.setState({ error: error, requesting: false });
        }
    };

    render() {
        const { error, requesting } = this.state;
        return this.props.children({
            error,
            requesting,
            stream: this.screencastHolder.currentStream,
            screen: this.screencastHolder.currentScreen?.id,
            availableScreens: this.screencastHolder.screens || [],
        });
    }
}
