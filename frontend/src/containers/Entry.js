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
import { useFormFields } from "../lib/hooksLib";
import config from "../config";
import { s3Upload } from "../lib/awsLib";

export function Entry() {
    const { id } = useParams();
    const nav = useNavigate();
    const [entry, setEntry] = useState({
        imageData: {},
        imageURL: {},
        imageDetectionResponse: {},
        imgKeys: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [reLoadEntry, setReLoadEntry] = useState(false);
    const [retryKeyFetch, setRetryKeyFetch] = useState(null);

    useEffect(() => {
        if (!retryKeyFetch) {
            return;
        }
        console.log("retrying fetch");
        let counter = 0;
        const interval = setInterval(async () => {
            counter++;
            entry.imageDetectionResponse[retryKeyFetch] = await API.get("notes", `/detect-text/${retryKeyFetch}`);
            if (!entry.imageDetectionResponse[retryKeyFetch].notFound || counter >= 5) {
                clearInterval(interval);
                setRetryKeyFetch(null);
                setEntry({ ...entry });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [retryKeyFetch]);

    useEffect(() => {
        console.log("reloading entry!")
        function loadEntry() {
            return API.get("notes", `/entries/${id}`);
        }
        async function onLoad() {
            try {
                const entry = await loadEntry();
                entry["imageURL"] = {};
                entry["imageData"] = {};
                entry["imageDetectionResponse"] = {};
                if (entry.imgKeys) {
                    for (let index = 0; index < entry.imgKeys.length; index++) {
                        const key = entry.imgKeys[index];
                        entry.imageURL[key] = await Storage.vault.get(key);
                        entry.imageData[key] = {};
                        entry.imageData[key].image = await getBase64FromUrl(entry.imageURL[key]);
                        entry.imageData[key].uploaded = true;
                        entry.imageData[key].edited = false;
                        entry.imageDetectionResponse[key] = await API.get("notes", `/detect-text/${key}`);
                        if (entry.imageDetectionResponse[key].notFound) {
                            console.log("not found!")
                            setRetryKeyFetch(key);
                            entry.imageDetectionResponse[key].lineDetections = []
                        }
                    }
                } else {
                    entry.imgKeys = [];
                }
                setEntry({ ...entry });
            } catch (e) {
                onError(e);
            }
        }
        onLoad();
    }, [id, reLoadEntry]);

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

    function updateEntry(entry) {
        return API.put("notes", `/entries/${id}`, {
            body: entry
        });
    }

    function urltoFile(url, filename, mimeType) {
        mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
        return (fetch(url)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
        );
    }

    async function handleUpload() {
        const array = Object.entries(entry.imageData);
        const files = [];
        setIsLoading(true);
        for (let index = 0; index < array.length; index++) {
            const [imageId, imageObject] = array[index];
            if (imageObject.uploaded && !imageObject.edited) {
                console.log("skipped ", imageId);
                continue;
            }
            const imageFile = await urltoFile(imageObject.image, `${imageId}_TBA.jpg`, "image/jpeg");
            if (imageFile && imageFile.size > config.MAX_ATTACHMENT_SIZE) {
                alert(
                    `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 10 ** 6
                    } MB.`
                );
                return;
            }
            files.push(imageFile);
        }
        try {
            const imgKeys = [];
            for (let index = 0; index < files.length; index++) {
                const key = files[index] ? await s3Upload(files[index]) : null;
                imgKeys.push(key);
            }
            await updateEntry({ updateData: { imgKeys: [...entry.imgKeys, ...imgKeys] } });
            setTimeout(() => {
                setReLoadEntry(!reLoadEntry);
            }, 100);
        } catch (e) {
            onError(e);

        }
        setIsLoading(false);
    }

    async function handleDeleteAllImages() {
        const confirmation = window.confirm('Are you sure you want to delete all images?');
        setIsLoading(true);
        if (confirmation) {

            for (let index = 0; index < entry.imgKeys.length; index++) {
                const key = entry.imgKeys[index];
                try {
                    await Storage.vault.remove(key);
                } catch (e) {
                    onError(e);
                }
            }
            await updateEntry({ updateData: { imgKeys: [] } });

            setTimeout(() => {
                setReLoadEntry(!reLoadEntry);
            }, 100);
        }
        setIsLoading(false);
    }

    const [fields, handleFieldChange] = useFormFields({});
    const tags = () => {
        const detections = [].concat(...Object.values(entry.imageDetectionResponse).map((value) => value.lineDetections));
        return detections.map((line, index) =>
            <Badge key={index} style={{ cursor: "pointer" }} id={`tag-${id}`} pill bg="light" text="dark">{line.DetectedText}</Badge>
        )

    }
    return (
        <div>
            <Camera entry={entry} setEntry={setEntry} />
            <FormGroup>
                <FormLabel>Input image from file</FormLabel>
                <FormControl type="file" accept=".jpg,.jpeg" onChange={handleFileChange} />
            </FormGroup>
            <ImageTray entry={entry} setEntry={setEntry} updateEntry={updateEntry} />
            <LoaderButton
                isLoading={isLoading}
                disabled={Object.values(entry.imageData).filter(data => !data.uploaded).length === 0}
                onClick={handleUpload}>
                Upload Images!
            </LoaderButton>
            <LoaderButton
                variant="danger"
                isLoading={isLoading}
                disabled={Object.values(entry.imageData).length === 0}
                onClick={handleDeleteAllImages}
            >
                Delete all images
            </LoaderButton>


            <div className="justify-content-md-center">
                <h6 className="mt-2">Detected text:</h6>
                {entry && tags()}
            </div>
        </div>
    );
}