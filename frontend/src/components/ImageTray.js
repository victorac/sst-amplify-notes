import React, { useState, useRef, useEffect } from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import { Button, ButtonGroup, Container, Image as RBImage, Row } from 'react-bootstrap';
import Cropper from 'cropperjs';
import "./ImageTray.css";
import "cropperjs/dist/cropper.css";
import { Storage } from "aws-amplify";
import { onError } from "../lib/errorLib";


export default function ImageTray({ entry, setEntry }) {
    const [selectedImage, setSelectedImage] = useState(Object.keys(entry.imageData)[0] ?? null);
    function handleSelect(entryIndex) {
        if (!isEditing) {
            if (selectedImage === entryIndex)
                setSelectedImage(null)
            else
                setSelectedImage(entryIndex)
        }
    }
    const imageList = Object.entries(entry.imageData).map((entry, index) => {
        const entryIndex = entry[0]
        const element = entry[1]
        return (
            <ListGroup.Item style={{ cursor: "pointer", maxWidth: "25%", maxHeigth: "25%" }} key={index} onClick={() => handleSelect(entryIndex)}>
                <RBImage id={entryIndex} src={element.image} />
            </ListGroup.Item>
        );
    })
    async function handleRemove() {
        delete entry.imageData[selectedImage];
        if (entry.imageURL?.[selectedImage]) {
            try {
                await Storage.vault.remove(selectedImage);
                delete entry.imageURL[selectedImage];
                delete entry.imageDetectionResponse[selectedImage];
            } catch (e) {
                onError(e);
            }
        }
        setSelectedImage(Object.keys(entry.imageData)[0] ?? null);
        setEntry({ ...entry });
    }
    const imageRef = useRef(null);
    const [cropper, setCropper] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const cropContainerRef = useRef(null);
    useEffect(() => {
        cropper?.clear();
        cropper?.destroy();
        if (imageRef.current && isEditing) {
            setCropper(new Cropper(imageRef.current, {
                viewMode: 3,
            }));
        }
    }, [isEditing]);
    function handleCrop() {
        const canvas = cropper?.getCroppedCanvas();
        const data = canvas.toDataURL();
        entry.imageData[selectedImage].image = data;
        entry.imageData[selectedImage].edited = true;
        entry.imageData[selectedImage].uploaded = false;
        setEntry({ ...entry });
        setIsEditing(false);
    }
    const [imgDimesions, setImageDimensions] = useState({
        width: 0,
        height: 0
    })
    useEffect(() => {
        const img = new Image();
        img.onload = function () {
            const newD = {
                width: this.width,
                height: this.height
            };
            setImageDimensions(newD);
        }
        img.src = entry.imageData[selectedImage]?.image;
    }, [selectedImage]);

    return (
        <Container>
            <Row className="position-relative">
                {selectedImage &&
                    <>
                        <div ref={cropContainerRef} className="p-0 m-0" style={imgDimesions}>
                            <RBImage ref={imageRef} width={imgDimesions.width} height={imgDimesions.height} src={entry.imageData[selectedImage]?.image} />
                        </div>
                        <ButtonGroup className="p-0 m-0" style={{ "maxWidth": "100%", "maxHeight": "100%" }}>
                            {
                                isEditing ?
                                    <>
                                        <Button variant="secondary" onClick={() => cropper?.rotate(-5)}>Rotate Left</Button>
                                        <Button variant="primary" onClick={handleCrop}>Crop</Button>
                                        <Button variant="secondary" onClick={() => cropper?.reset()}>Reset</Button>
                                        <Button variant="danger" onClick={() => setIsEditing(false)}>Cancel Edit</Button>
                                        <Button variant="secondary" onClick={() => cropper?.rotate(5)}>Rotate Right</Button>
                                    </>
                                    :
                                    <>
                                        <Button variant="primary" onClick={() => setIsEditing(true)}>Edit</Button>
                                        <Button variant="danger" onClick={handleRemove}>Remove</Button>
                                    </>
                            }
                        </ButtonGroup>
                    </>

                }
            </Row>
            <Row className="justify-content-md-center" style={{ maxHeight: "10%" }}>
                <ListGroup style={{ "overflowX": "auto", "maxWidth": "100%", "maxHeight": "25%" }} flush="true" horizontal>
                    {imageList}
                </ListGroup>
            </Row>
        </Container>
    );

}