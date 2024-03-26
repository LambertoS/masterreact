import React, {useState} from "react";
import {useWavesTransactions} from "../../context/WavesTransactionContext";

/**
 * The `ExecuteTransactionSendWaves` component provides a user interface for sending WAVES tokens
 * to a specified address. It leverages the `useWavesTransactions` hook for blockchain interactions,
 * specifically using the `sendToken` method. Users can input the amount of WAVES they wish to send
 * and the recipient's address, then submit the transaction.
 *
 * @returns {JSX.Element} A React component that renders a form for inputting transaction details (amount and recipient address) and a submit button.
 */
export const ExecuteTransactionSendWaves = () => {
    const [wavesAmount, setWavesAmount] = useState('');
    const [targetAddress, setTargetAddress] = useState('');
    const {sendToken} = useWavesTransactions();

    /**
     * Handles the form submission for sending WAVES. It prevents the default form submission action,
     * then calls the `sendToken` method with the specified amount and recipient address.
     *
     * @param {Event} event - The form submission event.
     */
    const handleWavesSubmit = async (event) => {
        event.preventDefault();
        try {
            // Attempt to send the specified amount of WAVES to the target address.
            await sendToken({
                amount: {tokens: wavesAmount.replace(",", "."), assetId: "WAVES"},
                recipient: targetAddress,
            });
            console.log('Waves successfully sent');
        } catch (error) {
            // Log any errors encountered during the transaction.
            console.error('Error sending Waves:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Send Waves</h2>
            <form onSubmit={handleWavesSubmit}>
                <div className="form-field">
                    <label className="form-label">Amount:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={wavesAmount}
                        onChange={(e) => setWavesAmount(e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label className="form-label">target Address:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={targetAddress}
                        onChange={(e) => setTargetAddress(e.target.value)}
                    />
                </div>
                <button type="submit" className="form-submit-button">Send</button>
            </form>
        </div>
    )
}