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
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { debugResult } from "../test/defaultDetectionResult";


// TODO
//     add a file input to analyze pictures from local storage
//     add button to analyze image -> should submit image to S3
//     the next page is the analyze page
//     AnalyzeImage
//     show picture and a box with found keywords
//     add a popover when selecting a keyword with the portion of the image where the keyword was found
//     add button to add fields
//     click one or more keywords to assign to a field as a tag
//     known tags should appear with a different badge


function urltoFile(url, filename, mimeType) {
    mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
    return (fetch(url)
        .then(function (res) { return res.arrayBuffer(); })
        .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
}

export default function WebCamera(props) {
    const [isLoading, setIsLoading] = useState(false);
    const nav = useNavigate();
    const { width, height } = props;
    const videoConstraints = {
        facingMode: "environment"
    }
    const [picture, setPicture] = useSessionStorage("picture", null)
    const imageDimensions = {
        width: null,
        height: null
    }
    if (picture) {
        const img = new Image();
        img.src = picture;
        imageDimensions.width = img.width;
        imageDimensions.height = img.height;
    }
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
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            setPicture(reader.result);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
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
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(imgRef.current, 0, 0);
        Object.values(rects).forEach((rect) => {
            ctx.strokeRect(
                rect.x * canvasRef.current.width - 2,
                rect.y * canvasRef.current.height - 2,
                rect.width * canvasRef.current.width + 3.5,
                rect.height * canvasRef.current.height + 3.5);
        });
    }

    useEffect(() => {
        if (canvasRef.current)
            redraw();
    }, [canvasRef, imgRef, picture, rects]);
    return (
        <>
            <div className="d-flex flex-column gap-2">
                {
                    picture
                    && <div style={imageDimensions}>
                        <canvas id="canvas" ref={canvasRef} width={imageDimensions.width} height={imageDimensions.height} onLoad={redraw}></canvas>
                        <img ref={imgRef} src={picture} style={{ "display": "none" }} width={imageDimensions.width} height={imageDimensions.height} />
                    </div>
                }
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
                <Button onClick={() => setIsPolling(false)}>Helper</Button>
            </div>
        </>
    );
}
