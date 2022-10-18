import React, { useEffect, useRef } from "react";
import { MDCDataTable } from '@material/data-table';

const Table = () => {
    const tableEl = useRef(null);
    useEffect(() => {
        MDCDataTable.attachTo(tableEl.current);
    });
    return (
        <div ref = {tableEl} className="mdc-data-table table">
            <div className="mdc-data-table__table-container">
                <table className="mdc-data-table__table" aria-label="Dessert calories">
                    <thead>
                        <tr className="mdc-data-table__header-row">
                            <th className="mdc-data-table__header-cell" role="columnheader" scope="col">Dessert</th>
                            <th className="mdc-data-table__header-cell mdc-data-table__header-cell--numeric" role="columnheader" scope="col">Carbs (g)</th>
                            <th className="mdc-data-table__header-cell mdc-data-table__header-cell--numeric" role="columnheader" scope="col">Protein (g)</th>
                            <th className="mdc-data-table__header-cell" role="columnheader" scope="col">Comments</th>
                        </tr>
                    </thead>
                    <tbody className="mdc-data-table__content">
                        <tr className="mdc-data-table__row">
                            <th className="mdc-data-table__cell" scope="row">Frozen yogurt</th>
                            <td className="mdc-data-table__cell mdc-data-table__cell--numeric">24</td>
                            <td className="mdc-data-table__cell mdc-data-table__cell--numeric">4.0</td>
                            <td className="mdc-data-table__cell">Super tasty</td>
                        </tr>
                        <tr className="mdc-data-table__row">
                            <th className="mdc-data-table__cell" scope="row">Ice cream sandwich</th>
                            <td className="mdc-data-table__cell mdc-data-table__cell--numeric">37</td>
                            <td className="mdc-data-table__cell mdc-data-table__cell--numeric">4.33333333333</td>
                            <td className="mdc-data-table__cell">I like ice cream more</td>
                        </tr>
                        <tr className="mdc-data-table__row">
                            <th className="mdc-data-table__cell" scope="row">Eclair</th>
                            <td className="mdc-data-table__cell mdc-data-table__cell--numeric">24</td>
                            <td className="mdc-data-table__cell mdc-data-table__cell--numeric">6.0</td>
                            <td className="mdc-data-table__cell">New filing flavor</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Table;