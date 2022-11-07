import React, { useState } from "react";
import { FormControl, FormGroup, FormLabel } from "react-bootstrap";
import Camera from "../components/Camera";
import ImageTray from "../components/ImageTray";
import LoaderButton from "../components/LoaderButton";
import * as uuid from "uuid";

export default function NewEntry() {

    const [images, setImages] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    function fromFiletoBase64(file) {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            const imageId = uuid.v1();
            const currentImages = Object.entries(images);
            const newImages = Object.fromEntries(currentImages.concat([[imageId, { image: reader.result?.toString() || '' }]]))
            setImages(newImages);
        })
        reader.readAsDataURL(file)
    }

    function handleFileChange(event) {
        const file = event.target.files[0];
        fromFiletoBase64(file);
        event.target.value = null;
    }

    return (
        <div className="d-grid gap-2">
            <Camera images={images} setImages={setImages} />
            <FormGroup>
                <FormLabel>Input image from file</FormLabel>
                <FormControl type="file" accept=".jpg,.jpeg" onChange={handleFileChange} />
            </FormGroup>
            <ImageTray images={images} setImages={setImages} />
            <LoaderButton isLoading={isLoading}>Upload Images!</LoaderButton>
        </div>

    );
}