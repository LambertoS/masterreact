// WavesTransactionsContext.js
import React, { createContext, useContext } from 'react';

// Definiert einen Initialwert mit Stubs für jede Funktion
const initialValue = {
    sendToken: () => Promise.reject(new Error("sendToken ist noch nicht verfügbar.")),
    invokeScript: () => Promise.reject(new Error("invokeScript ist noch nicht verfügbar.")),
    dataTransaction: () => Promise.reject(new Error("dataTransaction ist noch nicht verfügbar.")),
    setScript: () => Promise.reject(new Error("setScript ist noch nicht verfügbar.")),
};

const WavesTransactionsContext = createContext(initialValue);

export const useWavesTransactions = () => useContext(WavesTransactionsContext);

export class WavesTransactionsProvider extends React.Component {
    signAndPublishTransaction = (transactionData) => {
        if (window.WavesKeeper) {
            return window.WavesKeeper.signAndPublishTransaction(transactionData);
        } else {
            return Promise.reject(new Error('WavesKeeper is not installed'));
        }
    };

    sendToken = (data) => this.signAndPublishTransaction({ type: 4, data });
    invokeScript = (data) => this.signAndPublishTransaction({ type: 16, data });
    dataTransaction = (data) => this.signAndPublishTransaction({
        type: 12,
        data,
        fee: 500000
    });
    setScript = (data) => this.signAndPublishTransaction({ type: 13, data });

    render() {
        const { children } = this.props;
        const value = {
            sendToken: this.sendToken,
            invokeScript: this.invokeScript,
            dataTransaction: this.dataTransaction,
            setScript: this.setScript,
        };
        console.log('WavesTransactionsProvider rendering', value);
        return (
            <WavesTransactionsContext.Provider value={value}>
                {children}
            </WavesTransactionsContext.Provider>
        );
    }
}


