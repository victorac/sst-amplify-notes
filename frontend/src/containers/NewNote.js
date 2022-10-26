import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import { API } from "aws-amplify";
import config from "../config";
import "./NewNote.css";
import { onError } from "../lib/errorLib";
import { s3Upload } from "../lib/awsLib";


function urltoFile(url, filename, mimeType) {
    mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
    return (fetch(url)
        .then(function (res) { return res.arrayBuffer(); })
        .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
}

export default function NewNote() {
    let usePicture = (document.location.search.match(/usePicture=([^&]*)/) || [null, null])[1];
    if (!usePicture || usePicture === "false") {
        usePicture = false
    }
    const [picture, setPicture] = useState(usePicture ? sessionStorage.getItem("picture") : null);
    const file = useRef(null);
    const nav = useNavigate();
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function validateForm() {
        return content.length > 0;
    }

    useEffect(() => {
        async function onLoad() {
            if (picture) {
                const fileInput = document.getElementById("file");
                const attachmentFile = await urltoFile(picture, "picture.jpg", "image/jpeg");
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(attachmentFile);
                fileInput.files = dataTransfer.files;
            }
        }
        
        onLoad();
    }, []);

    function getBase64(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            setPicture(reader.result);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    function handleFileChange(event) {
        file.current = event.target.files[0];
        getBase64(file.current);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
            alert(
                `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 10 ** 6
                } MB.`
            );
            return;
        }

        setIsLoading(true);

        try {
            const attachment = file.current ? await s3Upload(file.current) : null;
            await createNote({ content, attachment });
            nav("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function createNote(note) {
        return API.post("notes", "/notes", {
            body: note,
        });
    }

    return (
        <div className="NewNote">
            <Form onSubmit={handleSubmit}>
                <div className="d-grid gap-2">
                    <Form.Group controlId="content">
                        <Form.Control
                            value={content}
                            as="textarea"
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="file">
                        <Form.Label>Attachment</Form.Label>
                        {picture && <Image className="m-2" width={50} height={50} src={picture} thumbnail />}
                        <Form.Control onChange={handleFileChange} type="file" accept=".jpg,.jpeg" />
                    </Form.Group>
                    <LoaderButton
                        type="submit"
                        size="lg"
                        variant="primary"
                        isLoading={isLoading}
                        disabled={!validateForm()}
                    >
                        Create
                    </LoaderButton>
                </div>
            </Form>
        </div>
    );
}
