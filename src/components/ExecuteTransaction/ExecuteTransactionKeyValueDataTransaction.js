import React, {useState} from "react";
import {useWavesTransactions} from "../../context/WavesTransactionContext";

/**
 * The `ExecuteTransactionKeyValueDataTransaction` component provides a form to upload a key-value pair
 * to the Waves blockchain as a data transaction. It uses the `useWavesTransactions` hook to access
 * blockchain functionalities, specifically the `dataTransaction` method.
 *
 * @return {JSX.Element} Renders a form for inputting a key-value pair and a button to submit the data.
 */
export const ExecuteTransactionKeyValueDataTransaction = () => {
    const [keyValuePairKey, setKeyValuePairKey] = useState("")
    const [keyValuePairValue, setKeyValuePairValue] = useState("")

    const {dataTransaction} = useWavesTransactions();

    /**
     * Handles the submission of the key-value pair to the Waves blockchain.
     * It prevents the default form submission behavior, then uses the `dataTransaction`
     * method to send the key-value pair as a data transaction.
     *
     * @param {Event} event - The event object from the form submission.
     */
    const handleKeyValuePairSubmit = async (event) => {
        event.preventDefault()
        try {
            // Perform the data transaction with the provided key-value pair.
            await dataTransaction({
                data: [{key: keyValuePairKey, type: "string", value: keyValuePairValue}]
            })

            /*await invokeScript({
                dApp: scAddress,
                call: {
                    function: keyValuePairFunctionName,
                    args: [{type: "string", value: keyValuePairKey}, {type: "string", value: keyValuePairValue}],
                },
                payment: [],
            });*/
        } catch (error) {
            console.error("Error uploading the key-value pair", error);
        }
    }

    return (
        <div className="form-container">
            <h2>Upload Key-Value</h2>

            <form onSubmit={handleKeyValuePairSubmit}>
                <div className="form-field">
                    <label className="form-label">Key:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={keyValuePairKey}
                        onChange={(e) => setKeyValuePairKey(e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label className="form-label">Value:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={keyValuePairValue}
                        onChange={(e) => setKeyValuePairValue(e.target.value)}
                    />
                </div>
                <button type="submit">Upload</button>
            </form>
        </div>
    )
}