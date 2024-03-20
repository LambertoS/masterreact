import React, {useEffect, useState} from 'react';
import './ExecuteTransaction.css';
import {useWavesTransactions} from '../Blockchain/WavesTransactionContext';

const ExecuteTransaction = () => {
    const [wavesAmount, setWavesAmount] = useState('');
    const [targetAddress, setTargetAddress] = useState('');
    const [scAddress, setScAddress] = useState(''); // Adresse des Smart Contracts
    const [functionName, setFunctionName] = useState(''); // Name der Smart-Contract-Funktion
    const [jsonData, setJsonData] = useState({});
    const {sendToken, invokeScript} = useWavesTransactions();

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const wavesKeeper = window.WavesKeeper; // Zugriff auf WavesKeeper-API
                if (!wavesKeeper) {
                    throw new Error('WavesKeeper not found');
                }

                // Überprüfen, ob der Benutzer angemeldet ist
                const authData = await wavesKeeper.auth({
                    data: 'Authentication required',
                    name: 'WavesKeeper App',
                    icon: 'URL_zu_Ihrem_App-Icon'
                });

                const publicState = await wavesKeeper.publicState()
                const account = publicState["account"]

                setScAddress(account.address)
            } catch (e) {

            }
        }
        fetchAccountData()
    }, [])

    // Funktion für das Senden von Waves
    const handleWavesSubmit = async (event) => {
        event.preventDefault();
        try {
            await sendToken({
                amount: {tokens: wavesAmount.replace(",", "."), assetId: "WAVES"},
                recipient: targetAddress,
            });
            console.log('Waves erfolgreich gesendet');
        } catch (error) {
            console.error('Fehler beim Senden von Waves:', error);
        }
    };

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

    // Funktion für das Hochladen und Parsen der JSON-Datei
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

    // Funktion zum Generieren der Formularfelder aus der JSON-Struktur
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
        <div className="execute-transaction">
            <h1>Blockchain-Transaktionen Ausführen</h1>

            {/* Formular für das Senden von Waves */}
            <div className="form-container">
                <h2>Send Waves</h2>
                <form onSubmit={handleWavesSubmit}>
                    <div className="form-field">
                        <label>Amount:</label>
                        <input
                            type="text"
                            value={wavesAmount}
                            onChange={(e) => setWavesAmount(e.target.value)}
                        />
                    </div>
                    <div className="form-field">
                        <label>target Address:</label>
                        <input
                            type="text"
                            value={targetAddress}
                            onChange={(e) => setTargetAddress(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="form-submit-button">Send</button>
                </form>
            </div>

            {/* Formular für den Smart-Contract-Aufruf */}
            <div className="form-container">
                <h2>Invoke Smart Contract</h2>
                <form onSubmit={handleSCSubmit}>
                    <div className="form-field">
                        <label>SC-Adress:</label>
                        <input
                            type="text"
                            value={scAddress}
                            onChange={(e) => setScAddress(e.target.value)}
                        />
                    </div>
                    <div className="form-field">
                        <label>Callable Function:</label>
                        <input
                            type="text"
                            value={functionName}
                            onChange={(e) => setFunctionName(e.target.value)}
                        />
                    </div>
                    <button type="submit">InvokeSC</button>
                </form>
            </div>

            {/* Bereich für das Hochladen und Anzeigen der JSON-Daten */}
            <div className="form-container">
                <h2>JSON-file for SC</h2>
                <input type="file" onChange={handleJsonUpload}/>
                <div>{jsonData && generateFormFields(jsonData)}</div>
            </div>
        </div>
    );
};

export default ExecuteTransaction;
