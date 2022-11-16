import React from "react";
import { ListGroup } from "react-bootstrap";
import { useAppContext } from "../lib/contextLib";
import { onError } from "../lib/errorLib";
import { API } from "aws-amplify";
import { LinkContainer } from "react-router-bootstrap";
import { BsPencilSquare } from "react-icons/bs";
import { useLoaderData } from "react-router-dom";
import "./Home.css";


function loadNotes() {
    return API.get("notes", "/notes");
}

export async function loader() {
    try {
        const notes = await loadNotes();
        return { notes };
    } catch (e) {
        onError(e);
        return { notes: [] };
    }
}

export default function Home() {
    const { isAuthenticated } = useAppContext();
    const { notes } = useLoaderData();
    function renderNotesList(notes) {
        return (
            <>
                <LinkContainer to="/entries/new">
                    <ListGroup.Item action className="py-3 text-nowrap text-truncate">
                        <BsPencilSquare size={17} />
                        <span className="ml-2 font-weight-bold">Create a new entry</span>
                    </ListGroup.Item>
                </LinkContainer>
                {notes.sort((a, b) => b.createdAt - a.createdAt).map(({ noteId, content, createdAt }) => (
                    <LinkContainer key={noteId} to={`/entries/${noteId}`}>
                        <ListGroup.Item action>
                            <span className="font-weight-bold">
                                {content && content.trim().split("/n")[0]}
                            </span>
                            <br />
                            <span className="text-muted">
                                Created: {new Date(createdAt).toLocaleString()}
                            </span>
                        </ListGroup.Item>
                    </LinkContainer>
                ))}
            </>
        );
    }

    function renderLander() {
        return (
            <div className="lander">
                <h1>Mirai Tomo</h1>
                <p className="text-muted">Your taste diary</p>
            </div>
        );
    }

    function renderNotes() {
        return (
            <div className="notes">
                <h2 className="pb-3 mt-4 mb-3 border-bottom">Your entries</h2>
                <ListGroup>{renderNotesList(notes)}</ListGroup>
            </div>
        );
    }

    return (
        <div className="Home">
            {isAuthenticated ? renderNotes() : renderLander()}
        </div>
    );
}