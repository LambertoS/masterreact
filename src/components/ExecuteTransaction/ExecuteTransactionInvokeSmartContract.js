import {CustomComboBox} from "../ComboBox/ComboBox";
import {Accordion} from "../Accordion/Accordion";
import React, {useEffect, useState} from "react";
import {useWavesTransactions} from "../../context/WavesTransactionContext";
import {loginWavesKeeper} from "../../util/wavesKeeper";
import {getWavesScriptFunctions} from "../../util/wavesUtil";

/**
 * The `ExecuteTransactionInvokeSmartContract` component facilitates invoking a smart contract on the Waves blockchain.
 * Users can specify the smart contract address, select a callable function from those available on the contract,
 * and submit data for the function call as JSON. The component dynamically loads callable functions for a given
 * smart contract address and parses JSON data for the function arguments.
 *
 * @returns {JSX.Element} A form for invoking a smart contract, including inputs for the contract address,
 * callable function selection, and a file upload for JSON data.
 */
export const ExecuteTransactionInvokeSmartContract = () => {
    const [scAddress, setScAddress] = useState(''); // Adresse des Smart Contracts
    const [functionName, setFunctionName] = useState(''); // Name der Smart-Contract-Funktion
    const [jsonData, setJsonData] = useState({});
    const [functionParams, setFunctionParams] = useState([]);

    const [callableAccountFunctions, setCallableAccountFunctions] = useState([])
    const {invokeScript} = useWavesTransactions();

    // Fetches account data and loads callable functions for the smart contract at the account's address.
    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const wavesKeeper = await loginWavesKeeper()

                const publicState = await wavesKeeper.publicState()
                const account = publicState["account"]

                setScAddress(account.address)

                loadScriptAddressCallableFunctions(account.address)
            } catch (e) {
                // TODO error handling
            }
        }

        if (scAddress.length === 0) {
            fetchAccountData()
        }
    }, [])

    // Updates function parameters based on the selected callable function.
    useEffect(() => {
        // Find the function with the name matching functionName
        const selectedFunction = callableAccountFunctions.find(func => func.name === functionName);

        // If found, update the functionParams state with the params of the selected function
        if (selectedFunction) {
            setFunctionParams(selectedFunction.params);
        } else {
            // If not found (e.g., when functionName is ''), clear functionParams
            setFunctionParams([]);
        }
    }, [functionName, callableAccountFunctions]);

    /**
     * Fetches callable functions for a given smart contract address and updates the component state.
     *
     * @param {string} address The smart contract address.
     */
    const loadScriptAddressCallableFunctions = async (address) => {
        const functions = await getWavesScriptFunctions(address)
        setCallableAccountFunctions(functions)

        /*const responseData = await fetch(`https://nodes-testnet.wavesnodes.com/addresses/scriptInfo/${address}/meta`);
        const data = await responseData.json()
        const functionNames = Object.keys(data.meta.callableFuncTypes);
        setCallableAccountFunctions(functionNames)*/
    }

    /**
     * Handles the form submission to invoke a smart contract function with the specified parameters.
     *
     * @param {Event} event The form submission event.
     */
    const handleSCSubmit = async (event) => {
        event.preventDefault();
        try {
            const result = processJsonData(jsonData)

            await invokeScript({
                dApp: scAddress,
                call: {
                    function: functionName,
                    args: result,
                },
                payment: [],
            });
        } catch (error) {
            console.error('Fehler beim Aufruf des Smart Contracts:', error);
        }
    };

    /**
     * Processes the JSON data into an array suitable for smart contract invocation.
     *
     * @param {Object} jsonData The JSON data to be processed.
     * @returns {Array} An array of arguments for smart contract invocation.
     */
    const processJsonData = (jsonData) => {
        // Check the number of key-value pairs in jsonData
        const entries = Object.entries(jsonData);
        if (entries.length === 1) {
            // If there's only one key-value pair, create two vars: key and keyValue
            const [[key, value]] = entries; // Destructure the first (and only) entry
            return [{type: "string", value: key}, {type: "string", value: value.toString()}]
            //return { key, keyValue: value.toString(), type: "string" }; // Return them as part of an object
        } else {
            // If there are multiple key-value pairs, proceed with creating arrays
            const scriptDataKeys = [];
            const scriptDataValues = [];

            // Iterate over the jsonData entries
            for (const [key, value] of entries) {
                scriptDataKeys.push({ type: "string", value: key });
                scriptDataValues.push({ type: "string", value: value.toString() });
            }

            // Return the arrays as part of an object
            return [{type: "list", value: scriptDataKeys}, {type: "list", value: scriptDataValues}]
        }
    }

    /**
     * Handles the file upload and parses the JSON data.
     *
     * @param {Event} event The file input change event.
     */
    const handleJsonUpload = (event) => {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            try {
                const parsedJson = JSON.parse(e.target.result);
                setJsonData(parsedJson);
            } catch (error) {
                console.error("Fehler beim Parsen der JSON", error);
                setJsonData({});
            }
        };
    };

    /**
     * Dynamically generates form fields based on JSON data structure.
     * It recursively handles nested objects to allow for complex data structures.
     *
     * @param {Object|Array} data The JSON data from which to generate form fields.
     * @param {string} path The current path to the data, used for nested objects.
     * @returns {JSX.Element|null} A series of form fields generated from the JSON data.
     */
    const generateFormFields = (data, path = '') => {
        if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
            return Object.entries(data).map(([key, value], index) => {
                const newPath = path ? `${path}.${key}` : key;
                return (
                    <div key={newPath}>
                        {typeof value === 'object' ?
                            <div><strong>{newPath}</strong>{generateFormFields(value, newPath)}</div> :
                            <label>
                                {newPath}:
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => console.log(`Updated ${newPath}: ${e.target.value}`)}
                                />
                            </label>
                        }
                    </div>
                );
            });
        }
        return null;
    };

    return (
        <div className="form-container">
            <h2>Invoke Smart Contract</h2>
            <form onSubmit={handleSCSubmit}>
                <div className="form-field">
                    <label className="form-label">SC-Address:</label>
                    <input
                        type="text"
                        className="form-input"
                        value={scAddress}
                        onChange={(e) => setScAddress(e.target.value)}
                    />
                    <button type="button"
                        onClick={() => {
                            loadScriptAddressCallableFunctions(scAddress)
                        }}
                    >
                        Load Callable Functions
                    </button>
                </div>
                <div className="form-field">
                    <label className="form-label">Callable Function:</label>
                    <CustomComboBox inputChanged={setFunctionName} options={callableAccountFunctions.map(func => func.name)} inputClassName="form-input" />
                    <div>Params: {functionParams.join(', ')}</div>
                </div>
                <button type="submit" disabled={Object.keys(jsonData).length === 0}>InvokeSC</button>
            </form>

            {/* Bereich für das Hochladen und Anzeigen der JSON-Daten */}
            <div className="sub-container">
                <h3>JSON-file for SC</h3>
                <input type="file" onChange={handleJsonUpload}/>
                <div>{Object.keys(jsonData).length > 0 && (
                    <Accordion title="Show/Hide Json Data">
                        {generateFormFields(jsonData)}
                    </Accordion>
                )}
                </div>
            </div>
        </div>
    )
}