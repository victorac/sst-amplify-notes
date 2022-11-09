import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { onError } from "../lib/errorLib";
import { Badge, Col, Container, Image, Row } from "react-bootstrap";
import Camera from "../components/Camera";
import ImageTray from "../components/ImageTray";
import LoaderButton from "../components/LoaderButton";
import * as uuid from "uuid";
import { FormControl, FormGroup, FormLabel } from "react-bootstrap";


export function Entry() {
    const { id } = useParams();
    const nav = useNavigate();
    const [entry, setEntry] = useState({
        imageData: {},
        imageURL: {},
        imageDetectionResponse: {},
        keys: {},
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        function loadEntry() {
            return API.get("notes", `/entries/${id}`);
        }

        async function onLoad() {
            try {
                const entry = await loadEntry();
                entry["imageURL"] = {};
                entry["imageData"] = {};
                entry["imageDetectionResponse"] = {};
                for (let index = 0; index < entry.keys.length; index++) {
                    const key = entry.keys[index];
                    entry.imageURL[key] = await Storage.vault.get(key);
                    entry.imageData[key] = {};
                    entry.imageData[key].image = await getBase64FromUrl(entry.imageURL[key]);
                    entry.imageDetectionResponse[key] = await API.get("notes", `/detect-text/${key}`);
                }
                setEntry(entry);
            } catch (e) {
                onError(e);
            }
        }

        onLoad();
    }, [id]);

    function fromFiletoBase64(file) {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            const imageId = uuid.v1();
            entry.imageData[imageId] = { image: reader.result?.toString() || '' }
            setEntry({ ...entry });
        })
        reader.readAsDataURL(file)
    }

    function handleFileChange(event) {
        const file = event.target.files[0];
        fromFiletoBase64(file);
        event.target.value = null;
    }

    const getBase64FromUrl = async (url) => {
        const data = await fetch(url);
        const blob = await data.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result;
                resolve(base64data);
            }
        });
    }


    const imageColumns = () => {
        return Object.values(entry.imageURL).map((value, index) => <Col key={index}><Image src={value} /></Col>)
    }
    const tags = () => {
        const detections = [].concat(...Object.values(entry.imageDetectionResponse).map((value) => value.lineDetections));
        return detections.map((line, index) =>
            <Badge key={index} style={{ cursor: "pointer" }} id={`tag-${id}`} pill bg="light" text="dark">{line.DetectedText}</Badge>
        )

    }
    return (
        <Container fluid>
            <Row className="d-grid gap-2">
                <Camera entry={entry} setEntry={setEntry} />
                <FormGroup>
                    <FormLabel>Input image from file</FormLabel>
                    <FormControl type="file" accept=".jpg,.jpeg" onChange={handleFileChange} />
                </FormGroup>
                <ImageTray entry={entry} setEntry={setEntry} />
                <LoaderButton isLoading={isLoading} disabled={Object.values(entry.imageData).length === 0} >Upload Images!</LoaderButton>
            </Row>
            <div className="justify-content-md-center">
                {entry && tags()}
            </div>
        </Container>
    );
}