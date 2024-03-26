import React, {useState, useEffect} from 'react';
import './ComponentsOverview.css';
import {loginWavesKeeper} from "../../util/wavesKeeper";
import {getWavesAccountData, getWavesScriptFunctions} from "../../util/wavesUtil";

const ComponentsOverview = () => {
    const [accountName, setAccountName] = useState("")
    const [accountBalance, setAccountBalance] = useState(0)
    const [accountData, setAccountData] = useState([]);
    const [accountAddress, setAccountAddress] = useState("")
    const [accountCallableScriptFunctions, setAccountCallableScriptFunctions] = useState([])

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const wavesKeeper = await loginWavesKeeper()

                const publicState = await wavesKeeper.publicState()
                const account = publicState["account"]

                setAccountBalance(account.balance.available)
                setAccountAddress(account.address)
                setAccountName(account.name)

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
                                <br /><strong>Invokes:</strong>
                                <ul>
                                    {item.invokes.map((invoke, invokeIndex) => (
                                        <li key={invokeIndex}>
                                            {/* Here we dynamically construct the string based on the presence of params and address */}
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

export default ComponentsOverview;
