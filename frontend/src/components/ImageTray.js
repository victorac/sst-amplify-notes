import React, { useState, useRef, useEffect } from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import { Button, ButtonGroup, Container, Image as RBImage, Row } from 'react-bootstrap';
import Cropper from 'cropperjs';
import "./ImageTray.css";
import "cropperjs/dist/cropper.css";
import { Storage } from "aws-amplify";
import { onError } from "../lib/errorLib";
import LoaderButton from "../components/LoaderButton";


export default function ImageTray({ entry, setEntry, updateEntry }) {
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
                <RBImage style={{ maxWidth: "100%", maxHeigth: "100%" }} id={entryIndex} src={element.image} />
            </ListGroup.Item>
        );
    })
    const [isLoading, setIsLoading] = useState(false);
    async function handleRemove() {
        setIsLoading(true);
        if (entry.imageData[selectedImage].uploaded) {
            try {
                await Storage.vault.remove(selectedImage);
                delete entry.imageURL[selectedImage];
                delete entry.imageDetectionResponse[selectedImage];
                entry.imgKeys = entry.imgKeys.filter(e => e !== selectedImage);
                await updateEntry({ updateData: { imgKeys: [...entry.imgKeys] } });
            } catch (e) {
                onError(e);
            }
        }
        delete entry.imageData[selectedImage];
        setSelectedImage(Object.keys(entry.imageData)[0] ?? null);
        setEntry({ ...entry });
        setIsLoading(false);
    }
    const imageRef = useRef(null);
    const [cropper, setCropper] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const cropContainerRef = useRef(null);
    useEffect(() => {
        cropper?.clear();
        cropper?.destroy();
        setTimeout(() => {
            if (imageRef.current && isEditing) {
                setCropper(new Cropper(imageRef.current, {
                    viewMode: 1,
                    minContainerWidth: 0,
                    minContainerHeight: 0,
                }));
            }
        }, 100);
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
    }, [selectedImage, entry]);

    return (
        <Container>
            {selectedImage &&
                <Row className="justify-content-md-center">
                    <div ref={cropContainerRef} className="p-0 m-0" style={{ ...imgDimesions }}>
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
                                    <LoaderButton regularClassName={true} isLoading={isLoading} variant="danger" onClick={handleRemove}>Remove</LoaderButton>
                                </>
                        }
                    </ButtonGroup>
                </Row>
            }
            <Row className="justify-content-md-center mt-2" style={{ maxHeight: "10%" }}>
                <ListGroup style={{ "overflowX": "auto", "maxWidth": "100%", "maxHeight": "25%" }} flush="true" horizontal>
                    {imageList}
                </ListGroup>
            </Row>
        </Container >
    );

}