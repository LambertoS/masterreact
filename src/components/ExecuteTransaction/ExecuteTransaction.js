import React from 'react';
import './ExecuteTransaction.css';
import {ExecuteTransactionSendWaves} from "./ExecuteTransactionSendWaves";
import {ExecuteTransactionInvokeSmartContract} from "./ExecuteTransactionInvokeSmartContract";
import {ExecuteTransactionUploadScript} from "./ExecuteTransactionUploadScript";
import {ExecuteTransactionKeyValueDataTransaction} from "./ExecuteTransactionKeyValueDataTransaction";
import {ExecuteTransactionAuth} from "./ExecuteTransactionAuth";

/**
 * The `ExecuteTransaction` component serves as a container for various transaction-related components.
 * It renders a series of components that allow the user to interact with blockchain transactions
 * in different ways, including sending Waves, invoking smart contracts, posting key-value data transactions,
 * and uploading scripts. This component acts as an aggregator, providing a singular interface
 * for multiple blockchain transaction functionalities.
 *
 * @returns {JSX.Element} A React component that groups together various transaction execution components.
 */
const ExecuteTransaction = () => {
    return (
        <div className="execute-transaction">
            <h1>Execute blockchain transactions</h1>

            <div className="execute-transaction-container">
                <ExecuteTransactionSendWaves/>
                <ExecuteTransactionInvokeSmartContract/>
                <ExecuteTransactionKeyValueDataTransaction/>
            </div>

            <hr/>

            <div className="execute-transaction-container2">
                <ExecuteTransactionUploadScript/>
                <ExecuteTransactionAuth/>
            </div>
        </div>
    );
};

export default ExecuteTransaction;
