import React from "react";
import Button from "./Button";
import Table from "./Table";

const App = () => {
    return (
        <div>
            <h3>React App</h3>
            <div className="container">
                <Table />
                <Button text="MyButton" />
            </div>


        </div>
    )
}

export default App;