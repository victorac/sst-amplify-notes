import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import Button from "react-bootstrap/Button"
import { useSessionStorage } from "../lib/hooksLib";
import { Container, Form, FormControl, FormGroup, FormLabel, Image as RBImage } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { s3Upload } from "../lib/awsLib";
import config from "../config";
import { onError } from "../lib/errorLib";
import LoaderButton from "../components/LoaderButton";
import { API } from "aws-amplify";
import Tag from "../components/Tag";
import 'react-image-crop/dist/ReactCrop.css';
import { debugResult } from "../test/defaultDetectionResult";


function urltoFile(url, filename, mimeType) {
    mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
    return (fetch(url)
        .then(function (res) { return res.arrayBuffer(); })
        .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
}

function getViewportSize() {
    var e = window;
    var a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return { width: e[a + 'Width'], height: e[a + 'Height'] }
}

export default function WebCamera(props) {
    const [isLoading, setIsLoading] = useState(false);
    const nav = useNavigate();
    const { width, height } = props;
    const videoConstraints = {
        facingMode: "environment"
    }
    const [picture, setPicture] = useSessionStorage("picture", null)
    const webcamRef = useRef(null);
    const capture = useCallback(
        () => {
            const imageSrc = webcamRef.current.getScreenshot();
            setPicture(imageSrc);
        },
        [webcamRef]
    );
    const retry = () => {
        setPicture(null);
    }
    const done = (usePicture) => {
        nav(`/notes/new?usePicture=${usePicture}`);
    }

    const file = useRef(null);

    function getBase64(file) {
        const reader = new FileReader()
        reader.addEventListener('load', () =>
            setPicture(reader.result?.toString() || ''),
        )
        reader.readAsDataURL(file)
    }

    function handleFileChange(event) {
        file.current = event.target.files[0];
        getBase64(file.current);
        file.current.internalName = "picture_TBA.jpg";
    }

    const [isPolling, setIsPolling] = useState(false);
    const [pictureId, setPictureId] = useState(null);
    const [detectionResult, setDetectionResult] = useState(debugResult);

    useEffect(() => {
        if (!isPolling) {
            return;
        }

        const id = setInterval(async () => {
            const imageDetectionResponse = await API.get("notes", `/detect-text/${pictureId}`);
            if (!imageDetectionResponse.notFound) {
                clearInterval(id);
                console.log(imageDetectionResponse);
                setDetectionResult(imageDetectionResponse);
                setIsPolling(false);
            }
        }, isPolling ? 2500 : null);

        return () => clearInterval(id);

    }, [isPolling]);

    async function handleSubmit(useAttachment) {
        let imageFile = null;
        if (!useAttachment) {
            imageFile = await urltoFile(picture, "picture_TBA.jpg", "image/jpeg");
        } else {
            imageFile = file.current;
        }

        if (imageFile && imageFile.size > config.MAX_ATTACHMENT_SIZE) {
            alert(
                `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 10 ** 6
                } MB.`
            );
            return;
        }

        setIsLoading(true);

        try {
            const attachment = imageFile ? await s3Upload(imageFile) : null;
            setPictureId(attachment);
            setIsPolling(true);
            setIsLoading(false);
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    const [rects, setRects] = useState({});


    const detectionBox = () => {
        if (detectionResult) {
            const tags = detectionResult.lineDetections.sort((a, b) => a.Id - b.Id).map((line, index) => {
                return <Tag key={`tag_${index}`} id={index} name={line.DetectedText} confidence={line.Confidence} boundingBox={line.Geometry.BoundingBox} rects={rects} setRects={setRects} />
            });
            return <div className="">{tags}</div>
        }
        return null;
    }

    const canvasRef = useRef(null);
    const imgRef = useRef(null);

    function redraw() {
        if (!imgRef.current) {
            return;
        }
        setImageDimensions({
            width: imgRef.current.width,
            height: imgRef.current.height
        })
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, imgRef.current.width, imgRef.current.height);
        console.log(imgRef.current.complete);
        console.log(imgRef.current.src)
        ctx.drawImage(imgRef.current, 0, 0,);
        Object.values(rects).forEach((rect) => {
            ctx.strokeRect(
                rect.x * imgRef.current.width - 2,
                rect.y * imgRef.current.height - 2,
                rect.width * imgRef.current.width + 3.5,
                rect.height * imgRef.current.height + 3.5);
        });
    }
    const [imageDimensions, setImageDimensions] = useState({
        width: null,
        height: null
    });
    useEffect(redraw, [rects]);
    useEffect(() => {
        setTimeout(redraw, 100)
    }, [picture])

    return (
        <>
            {
                picture
                && <div>
                    <canvas id="canvas" ref={canvasRef} width={imageDimensions.width} height={imageDimensions.height} ></canvas>
                    <img ref={imgRef} src={picture} style={{ "display": "none" }} onLoad={redraw} />
                </div>
            }
            <div className="d-flex flex-column gap-2">

                {!picture &&
                    <>
                        <Webcam
                            marginHeight={0}
                            marginWidth={0}
                            audio={false}
                            height={height}
                            width={width}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                        />
                        <Button onClick={capture}> Capture photo </Button>
                    </>}
                {picture && detectionBox()}
                {picture && <Button onClick={retry}> Take a different picture </Button>}
                <FormGroup controlId="file">
                    <FormLabel>Or upload a local picture:</FormLabel>
                    <FormControl onChange={handleFileChange} type="file" accept=".jpg,.jpeg" />
                </FormGroup>

                <LoaderButton
                    isLoading={isLoading}
                    variant="success"
                    onClick={() => handleSubmit(false)}
                    style={{ "marginTop": 0 }}
                >
                    Upload picture
                </LoaderButton>
            </div>
        </>
    );
}
