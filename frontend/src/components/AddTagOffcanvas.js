import React from 'react';
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import * as uuid from "uuid";


export default function AddTagOffcanvas({ show, handleClose, value, setTagValue, category, setTagCategory, tags, setTags, handleUpdateTags, ...props }) {

    function handleAdd() {
        const id = uuid.v1();
        const newTag = {};
        newTag[id] = { category: category, value: value };
        setTags(Object.assign({}, tags, newTag));
        handleClose();
        handleUpdateTags();
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