import React, { useState } from 'react';
import './ExecuteTransaction.css';
import { useWavesTransactions } from '../Blockchain/WavesTransactionContext';

const ExecuteTransaction = () => {
  const [wavesAmount, setWavesAmount] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [scAddress, setScAddress] = useState(''); // Adresse des Smart Contracts
  const [functionName, setFunctionName] = useState(''); // Name der Smart-Contract-Funktion
  const [jsonData, setJsonData] = useState({});
  const { sendToken, invokeScript } = useWavesTransactions();

  // Funktion für das Senden von Waves
  const handleWavesSubmit = async (event) => {
    event.preventDefault();
    try {
      await sendToken({
        amount: wavesAmount,
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
      // Konvertiere Key-Value-Paare aus jsonData in ein Format, das der Smart Contract erwartet
      const args = Object.entries(jsonData).map(([key, value]) => ({
        type: "string", // oder ein anderer Typ basierend auf dem Wert oder Schema
        key: key,
        value: value.toString(), // Stelle sicher, dass der Wert als String übergeben wird, falls nötig
      }));
  
      await invokeScript({
        dApp: scAddress,
        call: {
          function: functionName,
          args: args,
        },
        payment: [], // Leeres Array, wenn keine Zahlung erforderlich ist
      });
      console.log('Smart Contract Aufruf erfolgreich');
    } catch (error) {
      console.error('Fehler beim Aufruf des Smart Contracts:', error);
    }
  };
  

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
        <input type="file" onChange={handleJsonUpload} />
        <div>{jsonData && generateFormFields(jsonData)}</div>
      </div>
    </div>
  );
};

export default ExecuteTransaction;
