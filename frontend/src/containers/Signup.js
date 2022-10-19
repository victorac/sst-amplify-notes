import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import { useAppContext } from "../lib/contextLib";
import { useFormFields } from "../lib/hooksLib";
import LoaderButton from "../components/LoaderButton";
import { Auth } from "aws-amplify";
import "./Signup.css";
import { onError } from "../lib/errorLib";



export default function Signup() {
    const [fields, handleFieldChange] = useFormFields({
        email: "",
        password: "",
        confirmPassword: "",
        confirmationCode: "",
    });
    const nav = useNavigate();
    const [newUser, setNewUser] = useState(null);
    const { userHasAuthenticated } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);

    function validateForm() {
        return (
            fields.email.length > 0 &&
            fields.password.length > 0 &&
            fields.password === fields.confirmPassword
        );
    }

    function validateConfirmationForm() {
        return fields.confirmationCode.length > 0
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);
        try {
            const newUser = await Auth.signUp({
                username: fields.email,
                password: fields.password,
            });
            setIsLoading(false);
            setNewUser(newUser);
        } catch (e) {
            if (e.name === "UsernameExistsException") {
                try {
                    const newUser = await Auth.resendSignUp(fields.email);
                    setNewUser(newUser);
                } catch (e) {
                    onError(e);
                }
            } else {
                onError(e);
            }
            setIsLoading(false);
        }
    }

    async function handleConfirmationSubmit(event) {
        event.preventDefault();
        setIsLoading(true);
        try {
            await Auth.confirmSignUp(fields.email, fields.confirmationCode);
            await Auth.signIn(fields.email, fields.password);
            userHasAuthenticated(true);
            nav("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function renderConfirmationForm() {
        return (
            <Form onSubmit={handleConfirmationSubmit}>
                <div className="d-grid gap-2">
                    <Form.Group controlId="confirmationCode" size="lg">
                        <Form.Label>Confirmation Code</Form.Label>
                        <Form.Control
                            autoFocus
                            type="tel"
                            onChange={handleFieldChange}
                            value={fields.confirmationCode}
                        />
                        <Form.Text muted>Please check your email for the code.</Form.Text>
                    </Form.Group>
                    <LoaderButton
                        size="lg"
                        type="submit"
                        variant="success"
                        isLoading={isLoading}
                        disabled={!validateConfirmationForm()}
                    >
                        Verify
                    </LoaderButton>
                </div>
            </Form>
        );
    }

    function renderForm() {
        return (
            <Form onSubmit={handleSubmit}>
                <div className="d-grid gap-2">
                    <Form.Group controlId="email" size="lg">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            autoFocus
                            type="email"
                            onChange={handleFieldChange}
                            value={fields.email}
                        />
                    </Form.Group>
                    <Form.Group controlId="password" size="lg">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            onChange={handleFieldChange}
                            value={fields.password}
                        />
                    </Form.Group>
                    <Form.Group controlId="confirmPassword" size="lg">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            onChange={handleFieldChange}
                            value={fields.confirmPassword}
                        />
                    </Form.Group>
                    <LoaderButton
                        size="lg"
                        type="submit"
                        variant="success"
                        isLoading={isLoading}
                        disabled={!validateForm()}
                    >
                        Signup
                    </LoaderButton>
                </div>
            </Form>
        );
    }

    return (
        <div className="Signup">
            {newUser === null ? renderForm() : renderConfirmationForm()}
        </div>
    );
}