import React, { useState } from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import { Button, ButtonGroup, Container, Image as RBImage, Row } from 'react-bootstrap';

// {
//     index: {
//         image:
//         setImage:
//     }
// }
export default function ImageTray({ images, setImages }) {
    const [selectedImage, setSelectedImage] = useState(Object.keys(images)[0] ?? null);
    const imageList = Object.entries(images).map((entry, index) => {
        const entryIndex = entry[0]
        const element = entry[1]
        return (
            <ListGroup.Item style={{ cursor: "pointer", minWidth: "25%", minHeigth: "25%" }} key={index} onClick={() => setSelectedImage(entryIndex)}>
                <RBImage width="100%" height="100%" id={entryIndex} src={element.image} />
            </ListGroup.Item>
        );
    })
    function handleRemove(){
        delete images[selectedImage];
        setSelectedImage(Object.keys(images)[0] ?? null);
        setImages({...images});
    }
    return (
        <Container>
            <Row className="position-relative">
                <RBImage className="p-0 m-0" src={images[selectedImage]?.image} rounded/>
                {selectedImage &&
                    <ButtonGroup className="p-0 m-0 position-absolute" style={{ bottom: 0}}>
                        <Button variant="primary">Crop</Button>
                        <Button variant="danger" onClick={handleRemove}>Remove</Button>
                    </ButtonGroup>}
            </Row>
            <Row className="justify-content-md-center" style={{ maxHeight: "10%" }}>
                <ListGroup style={{ "overflowX": "auto", "maxWidth": "100%", "maxHeight": "25%" }} flush="true" horizontal>
                    {imageList}
                </ListGroup>
            </Row>
        </Container>
    );

}