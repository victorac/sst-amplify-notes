import React, { useState, useRef, useEffect } from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import { Button, ButtonGroup, Container, Image as RBImage, Row } from 'react-bootstrap';
import Cropper from 'cropperjs';
import "./ImageTray.css";
import "cropperjs/dist/cropper.css";


export default function ImageTray({ images, setImages }) {
    const [selectedImage, setSelectedImage] = useState(Object.keys(images)[0] ?? null);
    const imageList = Object.entries(images).map((entry, index) => {
        const entryIndex = entry[0]
        const element = entry[1]
        return (
            <ListGroup.Item style={{ cursor: "pointer", minWidth: "25%", minHeigth: "25%" }} key={index} onClick={() => selectedImage === entryIndex ? setSelectedImage(null) : setSelectedImage(entryIndex)}>
                <RBImage width="100%" height="100%" id={entryIndex} src={element.image} />
            </ListGroup.Item>
        );
    })
    function handleRemove() {
        delete images[selectedImage];
        setSelectedImage(Object.keys(images)[0] ?? null);
        setImages({ ...images });
    }
    const imageRef = useRef(null);
    const [cropper, setCropper] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
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
        images[selectedImage].image = data;
        setImages({ ...images });
        setIsEditing(false);
    }
    return (
        <Container style={{ maxHeight: "50%" }}>
            <Row className="position-relative">
                {selectedImage &&
                    <>
                        <div className="p-0 m-0" style={{ "maxWidth": "100%", "maxHeight": "100%" }}>
                            <RBImage ref={imageRef} src={images[selectedImage]?.image} />
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