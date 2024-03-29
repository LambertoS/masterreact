import {Accordion} from "../Accordion/Accordion";
import React, {useState} from "react";
import {useWavesTransactions} from "../../context/WavesTransactionContext";
import {convertScriptToBase64} from "../../util/wavesApi";

/**
 * The `ExecuteTransactionUploadScript` component allows users to upload a script file (.ride, .txt),
 * reads its content, and uploads it to a Waves blockchain node after converting the script to Base64.
 * The script is uploaded via a POST request to the Waves blockchain's testnet node.
 *
 * @returns {JSX.Element} A React component that renders the script upload interface.
 */
export const ExecuteTransactionUploadScript = () => {
    const [scriptData, setScriptData] = useState("")
    const {setScript} = useWavesTransactions();

    /**
     * Handles the selection of a script file by the user, reading its content as text.
     *
     * @param {Event} event - The event triggered by file input change.
     */
    const handleScriptFile = (event) => {
        const fileReader = new FileReader();
        // Read the content of the first file selected by the user as text.
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            try {
                // On successful read, store the file's content as a string.
                const contentAsString = e.target.result;
                setScriptData(contentAsString);
            } catch (error) {
                // Log and handle any errors that occur during file read.
                console.error("Error parsing the script file", error);
                setScriptData("");
            }
        };
    }

    /**
     * Handles the submission of the script upload form. It compiles the script to Base64 via a POST request,
     * and then calls `setScript` to upload it to the blockchain.
     *
     * @param {Event} event - The event triggered by form submission.
     */
    const handleScriptUploadSubmit = async (event) => {
        event.preventDefault();

        try {
            const scriptBase64 = await convertScriptToBase64(scriptData)

            // Upload the compiled script to the blockchain.
            await setScript({
                script: scriptBase64
            });

            // Reset the script data to clear the form.
            setScriptData("")
        } catch (error) {
            console.error("Error uploading the script file", error);
        }
    }

    return (
        <div className="form-container">
            <h2>Upload Script</h2>
            <form onSubmit={handleScriptUploadSubmit}>
                <button type="submit" disabled={scriptData.length === 0}>Upload Script</button>
            </form>

            <div className="form-container">
                <h3>Script-file for Script Upload</h3>
                <div className="sub-container">
                    <input type="file" accept=".ride,.txt" onChange={handleScriptFile}/>
                    {scriptData && (
                        <Accordion title="Show/Hide Script">
                            <pre>{scriptData}</pre>
                        </Accordion>
                    )}
                </div>
            </div>
        </div>
    )
}