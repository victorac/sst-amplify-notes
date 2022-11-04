import React, { useState } from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import { Button, ButtonGroup, Container, Image as RBImage, Row } from 'react-bootstrap';

// {
//     index: {
//         image:
//         setImage:
//     }
// }
export default function ImageTray({ images }) {
    const [selectedImage, setSelectedImage] = useState(Object.values(images)[0]?.image ?? null);
    const selectMenu = {};
    function handleSelect(event) {
        selectMenu[event.target.id] = true        
        setSelectedImage(images[event.target.id]?.image)
    }
    const imageList = Object.entries(images).map((entry, index) => {
        const entryIndex = entry[0]
        const element = entry[1]
        return (
            <ListGroup.Item style={{ "minWidth": "25%", "minHeigth": "25%" }} key={index} action onClick={handleSelect}>
                <div>
                    <RBImage width="100%" height="100%" id={entryIndex} src={element.image} />
                    {selectMenu[entryIndex]} ? <ButtonGroup style={{ position: "absolute", bottom: "10px", right: "10px" }}>
                        <Button variant="secondary">One</Button>
                        <Button variant="secondary">Two</Button>
                        <Button variant="secondary">Three</Button>
                    </ButtonGroup> : {null}
                </div>
            </ListGroup.Item>
        );
    })
    return (
        <div>
            <Row>
                <RBImage src={selectedImage} />
            </Row>
            <Row className="justify-content-md-center" style={{ maxHeight: "10%" }}>
                <ListGroup style={{ "overflowX": "auto", "maxWidth": "100%", "maxHeight": "25%" }} data-spy="scroll" flush="true" horizontal>
                    {imageList}
                </ListGroup>
            </Row>

        </div>
    );

}