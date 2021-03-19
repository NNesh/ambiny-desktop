import React from 'react';
import Source from '../../classes/Source';
import ScreenCaptureProvider, { ScreenCaptureOptions } from '../../modules/ScreenCaptureProvider';


export interface ScreencastChildrenParams {
    stream?: MediaStream;
    source?: Source;
    availableSources: Source[];
    error?: Error;
    requesting?: boolean;
    onChangeSource: (sourse: Source, options?: ScreenCaptureOptions) => void;
};

export interface ScreencastProps {
    autoRequest?: boolean;
    component?: React.ComponentClass<ScreencastChildrenParams>;
    render?: React.FunctionComponent<ScreencastChildrenParams>;
    initialCaptureOptions: ScreenCaptureOptions;
}

export interface State {
    error?: Error;
    requesting?: boolean;
    source?: Source;
    sources: Source[];
    stream?: MediaStream;
}

export default class Screencast extends React.Component<ScreencastProps, State> {
    private screenCaptureProvider: ScreenCaptureProvider;

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            requesting: true,
            sources: [],
            stream: null,
        };

        this.screenCaptureProvider = new ScreenCaptureProvider(this.props.initialCaptureOptions);

        this.handleGotSources = this.handleGotSources.bind(this);
        this.handleError = this.handleError.bind(this);
        this.requestStream = this.requestStream.bind(this);
    }

    componentDidMount() {
        this.prepare();
    }

    componentWillUnmount() {
        this.screenCaptureProvider.removeAllListeners();
        this.screenCaptureProvider.stopCheckingSources();
    }

    prepare() {
        const sourcePromise = this.screenCaptureProvider.getAvailableSources()
            .then(this.handleGotSources);

        const { autoRequest } = this.props;
        if (autoRequest) {
            sourcePromise.then(sources => this.requestStream(sources[0]));
        }

        sourcePromise.catch(this.handleError);
    }

    requestStream(source: Source, options?: ScreenCaptureOptions) {
        if (!source) {
            throw new Error('No source to request a stream');
        }

        this.removeStream();

        if (options) {
            this.screenCaptureProvider.captureOptions = options;
        }

        this.screenCaptureProvider.requestCaptureSource(source)
            .then((stream) => this.handleGotStream(stream, source))
            .catch(this.handleError);
    }

    handleGotStream(stream: MediaStream, source: Source) {
        this.setState({
            stream,
            source,
            error: null,
        });
    }

    handleGotSources(sources: Source[] = []) {
        this.setState({
            sources,
            requesting: false,
        });

        return sources;
    }

    handleError(error) {
        this.setState({
            error,
            requesting: false,
        });
    }

    removeStream() {
        const { stream } = this.state;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        this.setState({
            stream: null,
            source: null,
        });
    }

    render() {
        const { component: Component, render } = this.props;
        const { error, requesting, stream, sources, source } = this.state;

        if (Component) {
            return (
                <Component
                    error={error}
                    requesting={requesting}
                    stream={stream}
                    source={source}
                    availableSources={sources}
                    onChangeSource={this.requestStream}
                />
            );
        }

        return render({
            error,
            requesting,
            stream,
            source,
            availableSources: sources,
            onChangeSource: this.requestStream,
        });
    }
}
