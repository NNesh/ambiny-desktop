import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import Bounds from '../../modules/Bounds';
import RegionsBuilder, { Corner } from '../../modules/RegionsBuilder';

import './VideoPreview.less';

export interface Props {
    videoStream?: MediaStream,
    verticalNumber: number,
    horizontalNumber: number,
    children?: (videoElement: HTMLVideoElement) => undefined,
};

export default function VideoPreview(props: Props) {
    const {
        videoStream,
        verticalNumber = 0,
        horizontalNumber = 0,
        children,
    } = props;
    const videoRef = useRef<HTMLVideoElement>();
    const [regions, setRegions] = useState<Bounds[]>(null);

    useEffect(() => {
        if (videoRef?.current) {
            const elem = videoRef.current;
            if (videoStream) {
                elem.srcObject = videoStream;

                const videoSettings = videoStream.getVideoTracks()[0].getSettings();
                const bounds = new Bounds();
                bounds.width = videoSettings.width;
                bounds.height = videoSettings.height;

                const regionsBuilder = new RegionsBuilder(verticalNumber, horizontalNumber, bounds, Corner.BOTTOM_RIGHT);
                setRegions(regionsBuilder.build());
            } else {
                elem.srcObject = undefined;
                setRegions(null);
            }
        }
    }, [videoStream]);

    const renderRegion = useCallback((region: Bounds) => {
        const videoSettings = videoStream.getVideoTracks()[0].getSettings();
        const width = videoSettings.width;
        const height = videoSettings.height;

        return (
            <div
                className="VideoPreview_Region"
                style={{
                    left: `${region.x / width  * 100}%`,
                    top: `${region.y / height * 100}%`,
                    width: `${region.width / width * 100}%`,
                    height: `${region.height / height * 100}%`,
                    background: 'white',
                    opacity: 0.75
                }}>
            </div>
        );
    }, [regions, videoStream]);

    const renderRegions = useMemo(() => {
        return regions?.map(renderRegion);
    }, [regions]);

    return (
        <div className="VideoPreview">
            <video ref={videoRef} autoPlay></video>
            {renderRegions}
            {children && videoRef?.current && children(videoRef.current)}
        </div>
    );
}
