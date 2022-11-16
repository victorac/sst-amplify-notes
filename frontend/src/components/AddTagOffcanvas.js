import React from 'react';
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import * as uuid from "uuid";
import { API } from "aws-amplify";


export default function AddTagOffcanvas({ show, handleClose, value, setTagValue, category, setTagCategory, tags, setTags, entryId, ...props }) {

    function createTag(tag) {
        return API.post("notes", `/tags/${entryId}`, {
            body: tag
        });
    }

    async function handleAdd() {
        const createdTag = await createTag({ category: category, value: value });
        setTags(tags.concat(createdTag));
        handleClose();
    }

    return (
        <Offcanvas show={show} onHide={handleClose} placement="end" {...props}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Edit tag</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <FormGroup controlId='value'>
                    <FormLabel>Value</FormLabel>
                    <FormControl autoFocus type="text" value={value} onChange={(event) => setTagValue(event.target.value)}></FormControl>
                </FormGroup>
                <FormGroup controlId='category'>
                    <FormLabel>Category</FormLabel>
                    <FormControl type="text" value={category} onChange={(event) => setTagCategory(event.target.value)}></FormControl>
                </FormGroup>
                <Button variant="primary" className="my-2" onClick={handleAdd}>Add</Button>
            </Offcanvas.Body>
        </Offcanvas>
    );
}