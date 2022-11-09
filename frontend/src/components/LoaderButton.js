import React from "react";
import Button from "react-bootstrap/Button";
import { BsArrowRepeat } from "react-icons/bs";
import "./LoaderButton.css";


export default function LoaderButton({
    isLoading,
    className = "",
    disabled = false,
    regularClassName = false,
    ...props
}) {
    return (
        <Button
            disabled={disabled || isLoading}
            className={`${regularClassName ? '' : 'LoaderButton'} ${className}`}
            {...props}
        >
            {isLoading && <BsArrowRepeat className="spinning" />}
            {props.children}
        </Button>
    );
}