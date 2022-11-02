import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import Button from "react-bootstrap/Button"
import 'react-image-crop/dist/ReactCrop.css';
import "./Camera.css"
import screenfull from 'screenfull';

function urltoFile(url, filename, mimeType) {
    mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
    return (fetch(url)
        .then(function (res) { return res.arrayBuffer(); })
        .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
}


export default function Camera({setPicture}) {
    const videoConstraints = {
        facingMode: "environment"
    }
    const webcamRef = useRef(null);
    const capture = useCallback(
        () => {
            const imageSrc = webcamRef.current.getScreenshot();
            setPicture(imageSrc);
        },
        [webcamRef]
    );
    const videoRef = useRef(null);
    const [useCamera, setUseCamera] = useState(false);
    function requestFS() {
        if (videoRef.current) {
            if (screenfull.isEnabled) {
                setUseCamera(true);
                screenfull.request(videoRef.current, { navigationUI: 'hide' });
            }
        }
    }
    screenfull.on('change', () => {
        if (!screenfull.isFullscreen) setUseCamera(false);
    });

    return (
        <>
            <div ref={videoRef} className="d-flex flex-column justify-content-center">
                {
                    useCamera
                    &&
                    <>
                        <Webcam
                            audio={false}
                            height="100%"
                            width="100%"
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                        />
                        <Button size="lg" onClick={capture}>Capture</Button>
                    </>
                }
            </div>
            <Button onClick={requestFS}>Open Camera</Button>
        </>
    );
}
