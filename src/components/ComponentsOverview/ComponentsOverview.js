import React, { useState, useEffect } from 'react';
import './ComponentsOverview.css';

const ComponentsOverview = () => {
  const [accountData, setAccountData] = useState(null);

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

        // Abrufen der aktuellen Adresse des Benutzers
        const address = authData.address;

        // Abrufen von Daten von der Waves-Keeper-API mit der aktuellen Adresse
        const response = await fetch(`https://nodes-testnet.wavesnodes.com/addresses/data/${address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch account data');
        }
        const data = await response.json();
        setAccountData(data);
      } catch (error) {
        console.error('Error fetching account data:', error);
      }
    };

    fetchAccountData();
  }, []);

  return (
    <div className="components-overview">
      <h1>Übersicht Komponenten</h1>
      {accountData ? (
        <div>
          <p>Account Address: {accountData.address}</p>
          <p>Account Balance: {accountData.balance}</p>
          <p>Account Data: {accountData.balance}</p>
          {/* Weitere Informationen entsprechend der Struktur Ihrer Account-Daten */}
        </div>
      ) : (
        <p>Lade Daten...</p>
      )}
    </div>
  );
};

export default ComponentsOverview;
