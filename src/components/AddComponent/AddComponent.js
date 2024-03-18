import React, { useState, useContext } from 'react';
import { useWavesTransactions, WavesTransactionsProvider } from '../Blockchain/WavesTransactionContext';
import {convertJsonToKeyValue} from "../../util/eldatImport";


const EntryForm = ({ onSubmit }) => {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [type, setType] = useState('text'); // 'text', 'object', 'array'
    const { dataTransaction } = useWavesTransactions;
    console.log('Context value in consumer:', dataTransaction);


    const handleSubmit = async (e) => {
        e.preventDefault();
        let adjustedValue = type === 'text' ? value : (type === 'object' ? {} : []);

        // Konvertieren des Werts basierend auf dem Typ
        adjustedValue = type === 'text' ? adjustedValue : JSON.stringify(adjustedValue);

        // // Verwenden von dataTransaction aus dem Context
        // try {
        //     await dataTransaction({
        //         data: [
        //             {
        //                 key,
        //                 value: adjustedValue,
        //                 type: 'string' // Anpassen basierend auf den Anforderungen
        //             }
        //         ]
        //     });
        //     setKey('');
        //     setValue('');
        //     setType('text');
        // } catch (error) {
        //     console.error('Fehler beim Senden der Daten-Transaktion:', error);
        // }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
            />
            {type === 'text' && (
                <input
                    type="text"
                    placeholder="Value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            )}
            <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="text">Text</option>
                <option value="object">Object</option>
                <option value="array">Array</option>
            </select>
            <button type="submit">Add</button>
        </form>
    );
};

const DataDisplay = ({ data, onAdd, path = [] }) => {
    console.log(data, onAdd, path)
    return (
        <div>
            {Object.entries(data).map(([key, value], index) => (
                <div key={typeof key === 'number' ? index : key}>
                    {Array.isArray(value) ? (
                        <>
                            <strong>{key}:</strong> Array
                            {value.map((item, itemIndex) => (
                                <div key={itemIndex}>
                                    - {typeof item === 'object' ? <DataDisplay data={item} onAdd={onAdd} path={[...path, key, itemIndex]} /> : item.toString()}
                                </div>
                            ))}
                            <button onClick={() => onAdd(key, {}, [...path, key])}>+ Objekt zu Array hinzufügen</button>
                        </>
                    ) : typeof value === 'object' ? (
                        <>
                            <strong>{key}:</strong>
                            <DataDisplay data={value} onAdd={onAdd} path={[...path, key]} />
                        </>
                    ) : (
                        <div>{key}: {value.toString()}</div>
                    )}
                </div>
            ))}
            <EntryForm onSubmit={(key, value) => onAdd(key, value, path)} />
        </div>
    );
};

const JsonObjectBuilder = () => {
    const [data, setData] = useState({}); // Richtig, da es an der obersten Ebene aufgerufen wird

    // const context = useContext(useWavesTransactions);
    const { dataTransaction } = useWavesTransactions();
    //console.log('Context:', context);
    // if (!context) {
    //     console.error('WavesTransactionsContext is undefined.');
    //     return <div>WavesTransactionsContext nicht verfügbar. Bitte stellen Sie sicher, dass diese Komponente innerhalb eines WavesTransactionsProvider gerendert wird.</div>;// Frühe Rückkehr ist in Ordnung, solange alle Hooks vorher aufgerufen wurden
    // }
    //const { dataTransaction } = context; // Korrekte Verwendung des Kontexts

    // const { dataTransaction } = useContext(useWavesTransactions);

    const addEntry = (key, value, path) => {
        console.log(key, value, path)
        setData((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData)); // Deep clone von prevData

            // Bereite die Navigation zum Zielort im newData Objekt vor
            let current = newData;
            for (let i = 0; i < path.length; i++) {
                const pathKey = path[i];
                if (current[pathKey] === undefined) {
                    // Wenn der nächste Teil des Pfades eine Zahl ist, initialisiere als Array
                    current[pathKey] = Number.isInteger(path[i + 1]) ? [] : {};
                }
                current = current[pathKey];
            }

            // Überprüfe, ob der Zielort ein Array ist und füge das Objekt hinzu
            if (Array.isArray(current)) {
                if (key === null || key === '') { // Für den Fall, dass kein Schlüssel benötigt wird
                    current.push(value);
                } else { // Wenn ein Schlüssel vorhanden ist, erstelle ein neues Objekt im Array
                    const newObj = { [key]: value };
                    current.push(newObj);
                }
            } else if (key !== null && key !== '') {
                // Falls es sich nicht um ein Array handelt, füge ein normales Schlüssel-Wert-Paar hinzu
                current[key] = value;
            }

            return newData;
        });
    };

    const handleExport = () => {
        // Convert the data object to JSON and create a blob
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });

        // Create a link element to download the JSON file
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.json';
        document.body.appendChild(link);

        // Trigger the download
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const importedData = JSON.parse(event.target.result);
            setData(importedData);
        };
        reader.readAsText(file);
    };

    const handleDataTransaction = async () => {
        // Converts the data to a key-value pair
        convertJsonToKeyValue(data, async (filtered) => {
            console.log(filtered)
            // Convert it to the blockchain type
            const blockchainArray = Object.entries(filtered).map(([key, value]) => ({
                key: key,
                value: value,
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
        });
    };

    return (
        <div>
            <DataDisplay data={data} onAdd={addEntry} />
            <button onClick={handleExport}>Export JSON</button>
            <input type="file" accept=".json" onChange={handleImport} />
            <button onClick={handleDataTransaction}>Send Data via Blockchain</button>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};


export default JsonObjectBuilder;
