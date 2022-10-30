import React, { useState } from "react";
import Badge from "react-bootstrap/Badge";
import "./Tag.css";


export default function Tag({ name, confidence, boundingBox, setCrop }) {
    const [checked, setChecked] = useState(false);

    function handleClick() {
        let crop = null;
        console.log(!checked);
        if (!checked) {
            crop = {
                unit: '%', // Can be 'px' or '%'
                x: boundingBox.Left * 100,
                y: boundingBox.Top * 100,
                width: boundingBox.Width * 100,
                height: boundingBox.Height * 100
            }
        }
        setChecked(!checked);
        setCrop(crop);
    }

    let className = "Tag m-1";
    if (checked) {
        className += " text-muted";
    }

    return <Badge onClick={handleClick} className={className} pill bg="light" text="dark">{name}</Badge>

}