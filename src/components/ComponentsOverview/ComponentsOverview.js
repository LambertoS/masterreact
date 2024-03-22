import React, {useState, useEffect} from 'react';
import './ComponentsOverview.css';

const ComponentsOverview = () => {
    const [accountBalance, setAccountBalance] = useState(0)
    const [accountData, setAccountData] = useState([]);
    const [accountAddress, setAccountAddress] = useState("")
    const [accountCallableScriptFunctions, setAccountCallableScriptFunctions] = useState([])

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

                await getScriptFunctions(account.address);
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

    const getScriptFunctions = async (address) => {
        const responseData = await fetch(`https://nodes-testnet.wavesnodes.com/addresses/scriptInfo/${address}`);
        const data = await responseData.json()
        const scriptBase64 = data.script

        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: scriptBase64
        };
        const responseUtilsScriptDecompile = await fetch(`https://nodes-testnet.wavesnodes.com/utils/script/decompile`, requestOptions);
        const responseUtilsScriptDecompileData = await responseUtilsScriptDecompile.json()
        const script = responseUtilsScriptDecompileData.script
        console.log(script)

        const callableFunctionRegex = /@Callable\(i\)\s*func\s+([^(]+)\(([^)]*)\)\s*=\s*{([\s\S]*?)}(?:\n\s*@|$)/gm;
        const invokeFunctionRegex = /invoke\([^,]+,\s*"([^"]+)",/g;

        let callableFunctions = [];
        let match;

        while ((match = callableFunctionRegex.exec(script)) !== null) {
            const functionName = match[1].trim();
            const params = match[2].trim().split(',').map(param => param.trim());
            const functionBody = match[3];

            let invokedFunctions = [];
            let invokeMatch;
            while ((invokeMatch = invokeFunctionRegex.exec(functionBody)) !== null) {
                invokedFunctions.push(invokeMatch[1]);
            }

            callableFunctions.push({
                name: functionName,
                params: params,
                invokes: invokedFunctions
            });
        }

        console.log(callableFunctions)
        setAccountCallableScriptFunctions(callableFunctions);
    }

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
        if (accountData.length === 0) {
            return " No data."
        }

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

    function ScriptList() {
        if (accountCallableScriptFunctions.length === 0) {
            return " No data."
        }

        return (
            <ul>
                {accountCallableScriptFunctions.map((item, index) => (
                    <li key={index}>
                        <strong>{item.name}:</strong> {item.params.join(', ')}
                        {item.invokes && item.invokes.length > 0 && (
                            <>
                                <br /><strong>Invokes:</strong> {item.invokes.join(', ')}
                            </>
                        )}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className="components-overview">
            <h1>Account Overview</h1>
            {accountData ? (
                <div>
                    <p>Account Address: {accountAddress}</p>
                    <p>Account Balance: {(accountBalance / 100000000).toFixed(2)} WAVES</p>
                    <div>
                        Account Scripts:
                        <ScriptList/>
                    </div>
                    <div>
                        Account Data:
                        <DataList/>
                    </div>
                </div>
            ) : (
                <p>Lade Daten...</p>
            )}
        </div>
    );
};

export default ComponentsOverview;
