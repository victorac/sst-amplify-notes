import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { onError } from "../lib/errorLib";
import { Badge, Col, Container, Image, Row } from "react-bootstrap";

export function Entry() {
    const { id } = useParams();
    const nav = useNavigate();
    const [entry, setEntry] = useState(null);


    useEffect(() => {
        function loadEntry() {
            return API.get("notes", `/entries/${id}`);
        }

        async function onLoad() {
            try {
                const entry = await loadEntry();
                entry["imageURL"] = {};
                entry["imageDetectionResponse"] = {};
                for (let index = 0; index < entry.keys.length; index++) {
                    const key = entry.keys[index];
                    entry.imageURL[key] = await Storage.vault.get(key);
                    entry.imageDetectionResponse[key] = await API.get("notes", `/detect-text/${key}`);
                }
                setEntry(entry);
            } catch (e) {
                onError(e);
            }
        }

        onLoad();
    }, [id]);
    const imageColumns = () => {
        return Object.values(entry.imageURL).map((value, index) => <Col key={index}><Image src={value} /></Col>)
    }
    const tags = () => {
        const detections = [].concat(...Object.values(entry.imageDetectionResponse).map((value) => value.lineDetections));
        console.log(detections);
        return detections.map((line, index) =>
            <Badge key={index} style={{cursor: "pointer"}} id={`tag-${id}`} pill bg="light" text="dark">{line.DetectedText}</Badge>
        )

    }
    return (
        <Container fluid>
            <Row className="justify-content-md-center">
                {entry && imageColumns()}
            </Row>
            <div className="justify-content-md-center">
                {entry && tags()}
            </div>
        </Container>
    );
}