import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import "./Login.css";
import { Auth } from "aws-amplify";
import { useAppContext } from "../lib/contextLib";
import { useNavigate } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../lib/errorLib";
import { useFormFields } from "../lib/hooksLib";


export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const nav = useNavigate();
    const { userHasAuthenticated } = useAppContext();
    const [fields, handleFieldChange] = useFormFields({
        email: "",
        password: "",
    });

    function validateForm() {
        return fields.email.length > 0 && fields.password.length > 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setIsLoading(true);

        try {
            await Auth.signIn(fields.email, fields.password);
            userHasAuthenticated(true);
            nav("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    return (
        <div className="Login">
            <Form onSubmit={handleSubmit}>
                <div className="d-grid gap-2">
                    <Form.Group size="lg" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            autoFocus
                            type="email"
                            value={fields.email}
                            onChange={handleFieldChange}
                        />
                    </Form.Group>
                    <Form.Group size="lg" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={fields.password}
                            onChange={handleFieldChange}
                        />
                    </Form.Group>
                    <LoaderButton
                        size="lg"
                        type="submit"
                        isLoading={isLoading}
                        disabled={!validateForm()}
                    >
                        Login
                    </LoaderButton>
                </div>
            </Form>
        </div>
    );
}