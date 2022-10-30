import React, { useState } from "react";
import Badge from "react-bootstrap/Badge";
import "./Tag.css";


export default function Tag({ id, name, confidence, boundingBox, rects, setRects }) {
    const [checked, setChecked] = useState(false);
    
    function handleClick(event) {
        const rect_id = event.target.id;
        if (!checked) {
            rects[rect_id] = {
                x: boundingBox.Left,
                y: boundingBox.Top,
                width: boundingBox.Width,
                height: boundingBox.Height,
            }
        } else {
            delete rects[rect_id];
        }
        setChecked(!checked);
        setRects({...rects});
    }

    let className = "Tag m-1";
    if (checked) {
        className += " text-muted";
    }

    return <Badge id={`tag-${id}`} onClick={handleClick} className={className} pill bg="light" text="dark">{name}</Badge>

}