import React, {useState} from 'react';
import {convertJsonToKeyValue} from "../../util/eldatImport";
import {useWavesTransactions} from "../../context/WavesTransactionContext";
import {Accordion} from "../Accordion/Accordion";
import "./AddComponent.css"
import {DataDisplay} from "./DataDisplay";

/**
 * Represents the main component for adding, displaying, importing, exporting,
 * and sending data transactions over the blockchain.
 *
 * Utilizes Accordion for UI toggling, DataDisplay for rendering data structures,
 * and interacts with the blockchain for data transactions.
 */
const AddComponent = () => {
    const [data, setData] = useState({});
    const {dataTransaction} = useWavesTransactions();

    /**
     * Adds or updates an entry within the data state based on a specified path.
     * Supports deep nesting and initialization of arrays and objects.
     *
     * @param {string|null} key The key for the new entry. If null or empty in arrays, a value is pushed without a key.
     * @param {any} value The value to be added or updated at the specified path.
     * @param {Array} path An array representing the path to where the entry should be added or updated.
     */
    const addEntry = (key, value, path) => {
        setData((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData)); // Deep clone von prevData

            // Prepare navigation to the target location in newData object
            let current = newData;
            for (let i = 0; i < path.length; i++) {
                const pathKey = path[i];
                if (current[pathKey] === undefined) {
                    // Initialize as array or object based on the next path segment
                    current[pathKey] = Number.isInteger(path[i + 1]) ? [] : {};
                }
                current = current[pathKey];
            }

            // Add the object to an array or as a normal key-value pair
            if (Array.isArray(current)) {
                if (key === null || key === '') {
                    // Case for adding value without a key to an array
                    current.push(value);
                } else {
                    // Case for adding an object with a key to an array
                    const newObj = {[key]: value};
                    current.push(newObj);
                }
            } else if (key !== null && key !== '') {
                // Add a normal key-value pair
                current[key] = value;
            }

            return newData;
        });
    };

    /**
     * Handles the export of the current data state to a JSON file.
     * Creates a blob from the data, and triggers a download link.
     */
    const handleExport = () => {
        const jsonData = JSON.stringify(data, null, 2); // Pretty print the data
        const blob = new Blob([jsonData], {type: 'application/json'});

        // Create a download link for the blob
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.json';
        document.body.appendChild(link);

        link.click(); // Trigger the download

        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up
    };

    /**
     * Handles the import of a JSON file and updates the data state with its contents.
     *
     * @param {Event} e The event triggered by file input change.
     */
    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const importedData = JSON.parse(event.target.result);
            setData(importedData); // Update data with imported data
        };
        reader.readAsText(file);
    };

    /**
     * Handles the conversion of the current data state to a key-value pair format
     * and sends it as a data transaction over the blockchain.
     */
    const handleDataTransaction = async () => {
        // Converts the data to a key-value pair
        const filtered = await convertJsonToKeyValue(data)

        // Prepare for blockchain transaction
        const blockchainArray = Object.entries(filtered).map(([key, value]) => ({
            key: key,
            value: value.toString(),
            type: "string",
        }));

        try {
            await dataTransaction({
                data: blockchainArray
            });
            console.log('Data successfully sent over the blockchain');
        } catch (error) {
            console.error('Error sending data transaction:', error);
        }
    };

    return (
        <div className="add-component">
            <Accordion title="Show/Hide Entries">
                <DataDisplay data={data} onAdd={addEntry}/>
            </Accordion>

            <hr/>

            <button onClick={handleExport}>Export JSON</button>
            <input type="file" accept=".json" onChange={handleImport}/>
            <button onClick={handleDataTransaction}>Send Data via Blockchain</button>
            <Accordion title="Show/Hide JSON">
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </Accordion>
        </div>
    );
};


export default AddComponent;
