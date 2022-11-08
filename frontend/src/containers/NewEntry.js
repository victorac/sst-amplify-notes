import React, { useState } from "react";
import { FormControl, FormGroup, FormLabel } from "react-bootstrap";
import Camera from "../components/Camera";
import ImageTray from "../components/ImageTray";
import LoaderButton from "../components/LoaderButton";
import * as uuid from "uuid";
import config from "../config";
import { s3Upload } from "../lib/awsLib";
import { API } from "aws-amplify";
import { onError } from "../lib/errorLib";
import { useNavigate } from "react-router-dom";


export default function NewEntry() {
    const nav = useNavigate();
    const [entry, setEntry] = useState({
        imageData: {},
        imageURL: {},
        imageDetectionResponse: {},
        keys: {},
    });
    const [isLoading, setIsLoading] = useState(false);

    function fromFiletoBase64(file) {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            const imageId = uuid.v1();
            entry.imageData[imageId] = { image: reader.result?.toString() || '' }
            setEntry({...entry});
            // const currentImages = Object.entries(images);
            // const newImages = Object.fromEntries(currentImages.concat([[imageId, { image: reader.result?.toString() || '' }]]))
            // setImages(newImages);
        })
        reader.readAsDataURL(file)
    }

    function handleFileChange(event) {
        const file = event.target.files[0];
        fromFiletoBase64(file);
        event.target.value = null;
    }

    function urltoFile(url, filename, mimeType) {
        mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
        return (fetch(url)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
        );
    }

    function createEntry(entry) {
        return API.post("notes", "/entries", {
            body: entry,
        });
    }

    async function handleSubmit() {
        const array = Object.entries(entry.imageData);
        const files = [];
        setIsLoading(true);
        for (let index = 0; index < array.length; index++) {
            const [imageId, imageObject] = array[index];
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
            const keys = [];
            for (let index = 0; index < files.length; index++) {
                const key = files[index] ? await s3Upload(files[index]) : null;
                keys.push(key);
            }
            const content = ""
            const {noteId} = await createEntry({ content, keys });
            nav(`/entries/${noteId}`);
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }

    }
    return (
        <div className="d-grid gap-2">
            <Camera entry={entry} setEntry={setEntry} />
            <FormGroup>
                <FormLabel>Input image from file</FormLabel>
                <FormControl type="file" accept=".jpg,.jpeg" onChange={handleFileChange} />
            </FormGroup>
            <ImageTray entry={entry} setEntry={setEntry} />
            <LoaderButton isLoading={isLoading} disabled={Object.values(entry.imageData).length === 0} onClick={handleSubmit}>Upload Images!</LoaderButton>
        </div>

    );
}