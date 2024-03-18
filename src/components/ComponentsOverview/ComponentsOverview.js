import React, {useState, useEffect} from 'react';
import './ComponentsOverview.css';

const ComponentsOverview = () => {
    const [accountBalance, setAccountBalance] = useState(0)
    const [accountData, setAccountData] = useState([]);
    const [accountAddress, setAccountAddress] = useState("")

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

                setAccountBalance(account.balance.available)
                setAccountAddress(account.address)

                // Get the account data
                const responseData = await fetch(`https://nodes-testnet.wavesnodes.com/addresses/data/${account.address}`);
                if (!responseData.ok) {
                    setAccountData([{key: "Fehler", type: "string", value: "Ein Fehler ist aufgetreten."}])
                } else {
                    const data = await responseData.json()
                    setAccountData(data)
                }
                // Abrufen der aktuellen Adresse des Benutzers
                /*const address = authData.address;*/

                // Abrufen von Daten von der Waves-Keeper-API mit der aktuellen Adresse
                /*const responseBalance = await fetch(`https://nodes-testnet.wavesnodes.com/addresses/balance/${address}`);
                const responseData = await fetch(`https://nodes-testnet.wavesnodes.com/addresses/data/${address}`);
                console.log(responseBalance)
                if (!responseBalance.ok || !responseData.ok) {
                    throw new Error('Failed to fetch account data');
                }
                const balance = await responseBalance.json();
                setAccountBalance(balance.balance);
                setAccountAddress(balance.address)

                const data = await responseData.json()
                setAccountData(data)*/
            } catch (error) {
                console.error('Error fetching account data:', error);
            }
        };

        fetchAccountData();
    }, []);

    const DataTable = () => {
        return (
            <table>
                <thead>
                <tr>
                    <th>Key</th>
                    <th>Value</th>
                </tr>
                </thead>
                <tbody>
                {accountData.map((item, index) => (
                    <tr key={index}>
                        <td>{item.key}</td>
                        <td>{item.value}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        );
    }

    function DataList() {
        return (
            <ul>
                {accountData.map((item, index) => (
                    <li key={index}>
                        <strong>{item.key}:</strong> {item.value}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className="components-overview">
            <h1>Übersicht Komponenten</h1>
            {accountData ? (
                <div>
                    <p>Account Address: {accountAddress}</p>
                    <p>Account Balance: {(accountBalance / 100000000).toFixed(2)} WAVES</p>
                    <div>
                        Account Data: {
                            <DataList/>
                        }
                    </div>
                </div>
            ) : (
                <p>Lade Daten...</p>
            )}
        </div>
    );
};

export default ComponentsOverview;
