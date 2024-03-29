import React, {useState, useEffect} from 'react';
import './AccountOverview.css';
import {loginWavesKeeper} from "../../util/wavesKeeper";
import {getWavesAccountData, getWavesScriptFunctions} from "../../util/wavesUtil";

/**
 * Displays an overview of a Waves account, including information fetched from Waves Keeper,
 * account data, and callable script functions associated with the account.
 */
const AccountOverview = () => {
    const [accountName, setAccountName] = useState("")
    const [accountBalance, setAccountBalance] = useState(0)
    const [accountData, setAccountData] = useState([]);
    const [accountAddress, setAccountAddress] = useState("")
    const [accountCallableScriptFunctions, setAccountCallableScriptFunctions] = useState([])

    // Effect hook to fetch account data on component mount
    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const wavesKeeper = await loginWavesKeeper()

                const publicState = await wavesKeeper.publicState(); // Get public state from Waves Keeper
                const account = publicState["account"]; // Extract account information

                // Set various account information from the Waves Keeper account object
                setAccountBalance(account.balance.available);
                setAccountAddress(account.address);
                setAccountName(account.name);

                // Get the account data
                setAccountData(await getWavesAccountData(account.address))

                // Get the callable functions
                const callableFunctions = await getWavesScriptFunctions(account.address);
                setAccountCallableScriptFunctions(callableFunctions);
            } catch (error) {
                console.error('Error fetching account data:', error);
            }
        };

        fetchAccountData();
    }, []);

    /**
     * Renders a list of key-value pairs representing account data.
     * Displays a message if no data is found.
     */
    function DataList() {
        if (accountData.length === 0) {
            return (
                <ul>
                    <li key={"noData"}>
                        No data found on account.
                    </li>
                </ul>
            )
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

    /**
     * Renders a list of callable script functions associated with the account.
     * Includes function parameters and any invoked functions.
     */
    function ScriptList() {
        if (accountCallableScriptFunctions.length === 0) {
            return (
                <ul>
                    <li key={"noData"}>
                        No scripts found on account.
                    </li>
                </ul>
            );
        }

        return (
            <ul>
                {accountCallableScriptFunctions.map((item, index) => (
                    <li key={index}>
                        <strong>{item.name}:</strong> {item.params.join(', ')}
                        {item.invokes && item.invokes.length > 0 && (
                            <>
                                <br/><strong>Invokes:</strong>
                                <ul>
                                    {item.invokes.map((invoke, invokeIndex) => (
                                        <li key={invokeIndex}>
                                            {invoke.function}
                                            {invoke.params && invoke.params.filter(param => param).length > 0 && (
                                                ` [${invoke.params.join(', ')}]`
                                            )}
                                            {invoke.address && invoke.address.trim() !== "" && (
                                                ` (${invoke.address})`
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        );
    }

    /**
     * Renders basic account information, including the name, address, and balance.
     */
    const AccountInformation = () => {
        return (
            <ul>
                <li key={"noData"}>
                    <strong>Waves Keeper:</strong> {accountName}
                </li>
                <li key={"noData"}>
                    <strong>Address:</strong> {accountAddress}
                </li>
                <li key={"noData"}>
                    <strong>Balance:</strong> {(accountBalance / 100000000).toFixed(2)} WAVES
                </li>
            </ul>
        )
    }

    return (
        <div className="components-overview">
            <h1>Account Overview</h1>
            <div>
                <div>
                    Account Information:
                    <AccountInformation/>
                </div>
                <div>
                    Account Scripts:
                    <ScriptList/>
                </div>
                <div>
                    Account Data:
                    <DataList/>
                </div>
            </div>
        </div>
    );
};

export default AccountOverview;
