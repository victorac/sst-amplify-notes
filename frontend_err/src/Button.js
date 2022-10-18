import React, { useEffect, useRef } from "react";
import { MDCRipple } from '@material/ripple/index';

const Button = (props) => {
    let {text} = props;
    if (!text) {
        text = "Button text"; 
    }
    const buttonEl = useRef(null);
    useEffect(() => {
        MDCRipple.attachTo(buttonEl.current);
    });

    return (
        // <button ref={buttonEl} className="mdc-button mdc-button--outlined">
        //     <span className="mdc-button__ripple"></span>
        //     <span className="mdc-button__label">Outlined Button</span>
        // </button>
        // <button ref={buttonEl} className="mdc-button">
        //     <span className="mdc-button__ripple"></span>
        //     <span className="mdc-button__label">Text Button</span>
        // </button>
        <button ref={buttonEl} className="mdc-button mdc-button--raised table-button">
            <span className="mdc-button__ripple"></span>
            <span className="mdc-button__label">{text}</span>
        </button>
        // <button ref={buttonEl} className="foo-button mdc-button">
        //     <div className="mdc-button__ripple"></div>
        //     <span className="mdc-button__label">Button</span>
        // </button>
    )
}

export default Button;