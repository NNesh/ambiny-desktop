import React, { useEffect, useMemo, useCallback, useState, useRef, ReactNode } from 'react';
import Bounds from '../../modules/Bounds';
import RegionsBuilder, { Corner } from '../../modules/RegionsBuilder';

import './VideoPreview.less';

export interface Props {
    videoStream?: MediaStream,
    verticalNumber: number,
    horizontalNumber: number,
    verticalPadding: number,
    horizontalPadding: number,
    children?: (videoElement: HTMLVideoElement, regions?: Bounds[]) => ReactNode,
};

export default function VideoPreview(props: Props) {
    const {
        videoStream,
        verticalNumber = 0,
        horizontalNumber = 0,
        horizontalPadding = 0,
        verticalPadding = 0,
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

                const regionsBuilder = new RegionsBuilder(verticalNumber, horizontalNumber, bounds, bounds.width / 4 * horizontalPadding / 100, bounds.height / 4 * verticalPadding / 100, Corner.BOTTOM_RIGHT);
                setRegions(regionsBuilder.build());
            } else {
                elem.srcObject = undefined;
                setRegions(null);
            }
        }
    }, [videoStream, horizontalPadding, verticalPadding, horizontalNumber, verticalNumber]);

    const renderRegion = useCallback((region: Bounds) => {
        const videoSettings = videoStream.getVideoTracks()[0].getSettings();
        const width = videoSettings.width;
        const height = videoSettings.height;

        return (
            <div
                key={`region-${region.x}-${region.y}`}
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
            {children && videoRef?.current && children(videoRef.current, regions)}
        </div>
    );
}
