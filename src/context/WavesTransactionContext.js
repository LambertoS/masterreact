// WavesTransactionsContext.js
import React, { createContext, useContext } from 'react';

const initialValue = {
    sendToken: () => Promise.reject(new Error("sendToken ist noch nicht verfügbar.")),
    invokeScript: () => Promise.reject(new Error("invokeScript ist noch nicht verfügbar.")),
    dataTransaction: () => Promise.reject(new Error("dataTransaction ist noch nicht verfügbar.")),
    setScript: () => Promise.reject(new Error("setScript ist noch nicht verfügbar.")),
};

/**
 * Creates a React context for Waves blockchain transactions with initial stub functions.
 * These functions are placeholders and will be replaced by actual implementations in the provider.
 */
const WavesTransactionsContext = createContext(initialValue);

/**
 * A custom hook to access the WavesTransactionsContext.
 * @returns The context value with actual blockchain transaction functions.
 */
export const useWavesTransactions = () => useContext(WavesTransactionsContext);

/**
 * Provides the actual implementation of blockchain transaction functions and makes them available
 * to any component within its tree.
 */
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
    dataTransaction = (data) => this.signAndPublishTransaction({ type: 12, data });
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


