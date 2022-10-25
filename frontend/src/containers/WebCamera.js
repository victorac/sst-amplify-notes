import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import Button from "react-bootstrap/Button"
import { useSessionStorage } from "../lib/hooksLib";
import { Container, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function WebCamera(props) {
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
    const done = () => {
        nav("/notes/new");
    }
    return (
        <div className="d-flex flex-column gap-2">
            {
                picture ?
                    <>

                        <Image src={picture} fluid rounded />
                        <Button onClick={retry}> Take a different picture </Button>
                        <Button variant="success" onClick={done}> Done </Button>
                    </>
                    :
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
                    </>
            }
            <Button variant="secondary" onClick={done}> Use an existing picture </Button>
        </div>
    );
}
