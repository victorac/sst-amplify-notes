import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import Button from "react-bootstrap/Button"
import { useSessionStorage } from "../lib/hooksLib";
import { Container, Form, FormControl, FormGroup, FormLabel, Image as RBImage } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { s3Upload } from "../lib/awsLib";
import config from "../config";
import { onError } from "../lib/errorLib";
import LoaderButton from "../components/LoaderButton";

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
    const [imageDimesions, setImageDimensions] = useState({width: null, height: null});
    function getBase64(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            const base64Image = new Image();
            base64Image.src = reader.result;
            setImageDimensions({
                width: base64Image.width,
                height: base64Image.height,
            });
            setPicture(base64Image.src);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    function handleFileChange(event) {
        file.current = event.target.files[0];
        getBase64(file.current);
    }

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
            setIsLoading(false);
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    return (
        <div className="d-flex flex-column gap-2">
            {picture && <RBImage src={picture} fluid rounded width={imageDimesions.width} height={imageDimesions.height}/>}
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
            {picture && <Button onClick={retry}> Take a different picture </Button>}
            <FormGroup controlId="file">
                <FormLabel>Or upload a local picture:</FormLabel>
                <FormControl onChange={handleFileChange} type="file" accept=".jpg,.jpeg" />
            </FormGroup>

            <LoaderButton
                isLoading={isLoading}
                variant="success"
                onClick={() => handleSubmit(false)}
                style={{ "margin-top": 0 }}
            >
                Upload picture
            </LoaderButton>
        </div>
    );
}
