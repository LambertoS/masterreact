import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import './Header.css';
import {loginWavesKeeper} from "../../util/wavesKeeper"; // Ensure the path is correct

/**
 * The header component of the CircularBlockNet application, including navigation links and a button to view the current account on Waves Explorer.
 */
const Header = () => {
    const [currentAddress, setCurrentAddress] = useState(''); // State to store the current address

    useEffect(() => {
        const getAddress = async () => {
            try {
                const wavesKeeper = await window.WavesKeeper;
                if (wavesKeeper) {
                    const state = await wavesKeeper.publicState();
                    setCurrentAddress(state.account.address); // Set the current address
                } else {
                    console.error('Waves Keeper is not available');
                }
            } catch (error) {
                console.error('Failed to fetch the current address from Waves Keeper:', error);
            }
        };

        getAddress(); // Fetch the current address
    }, []);

    /**
     * View the current address on the waves explorer
     * @return {Promise<void>}
     */
    const handleWavesKeeperButtonClicked = async () => {
        let address = currentAddress;

        // If currentAddress is not set, try to fetch it from Waves Keeper
        if (!address) {
            try {
                const wavesKeeper = window.WavesKeeper;
                if (wavesKeeper) {
                    const state = await wavesKeeper.publicState();
                    address = state.account && state.account.address;

                    // Optionally update the state with the fetched address
                    // This step is recommended if you want to keep the fetched address for later use
                    setCurrentAddress(address);
                } else {
                    console.log('Waves Keeper is not available.');
                    alert('Waves Keeper is not available. Please install it or unlock your account.');
                    return; // Exit the function if Waves Keeper is not available
                }
            } catch (error) {
                console.error('Failed to fetch the address from Waves Keeper:', error);
                alert('There was an error fetching the address from Waves Keeper.');
                return; // Exit the function in case of error
            }
        }

        // If an address is available (either already was, or just fetched), navigate
        if (address) {
            const url = `https://testnet.wavesexplorer.com/address/${address}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    return (
        <header className="app-header">
            <div className="header-content">
                {/* Link to the homepage */}
                <h1><Link to="/" className="header-title">CircularBlockNet</Link></h1>
                <nav>
                    {/* Navigation links */}
                    <ul>
                        <li><Link to="/contract-overview">Contract Overview</Link></li>
                        <li><Link to="/create-contract">Create Contract</Link></li>
                        <li><Link to="/account-overview">Account Overview</Link></li>
                        <li><Link to="/add-component">Add Data</Link></li>
                        <li><Link to="/execute-transaction">Execute Transaction</Link></li>
                    </ul>
                </nav>
                <button
                    className="waves-explorer-button"
                    onClick={handleWavesKeeperButtonClicked}
                >
                    View on Waves Explorer
                </button>
            </div>
        </header>
    );
};

export default Header;
