import React, { useEffect, useRef } from 'react';

import './VideoPreview.less';

export default function VideoPreview(props) {
    const {
        videoStream,
    } = props;
    const videoRef = useRef<HTMLVideoElement>();

    useEffect(() => {
        if (videoRef?.current) {
            if (videoStream) {
                videoRef.current.srcObject = videoStream;
            } else {
                videoRef.current.srcObject = undefined;
            }
        }
    }, [videoStream]);

    return (
        <div className="VideoPreview">
            <video ref={videoRef} autoPlay></video>
        </div>
    );
}
