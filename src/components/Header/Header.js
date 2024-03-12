import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Ensure the path is correct

const Header = () => {
    // State for storing the current active address
    const [currentAddress, setCurrentAddress] = useState('');

    useEffect(() => {
        const getAddress = async () => {
            try {
                const wavesKeeper = await window.WavesKeeper;
                if (wavesKeeper) {
                    const state = await wavesKeeper.publicState();
                    setCurrentAddress(state.account.address);
                } else {
                    console.error('Waves Keeper is not available');
                }
            } catch (error) {
                console.error('Failed to fetch the current address from Waves Keeper:', error);
            }
        };

        getAddress();
    }, []);

    return (
        <header className="app-header">
            <div className="header-content">
                <h1><Link to="/" className="header-title">CircularBlockNet</Link></h1>
                <nav>
                    <ul>
                        <li><Link to="/contract-overview">Übersicht Contract</Link></li>
                        <li><Link to="/create-contract">Contract Erstellen</Link></li>
                        <li><Link to="/components-overview">Übersicht Komponenten</Link></li>
                        <li><Link to="/add-component">Komponente Hinzufügen</Link></li>
                        <li><Link to="/execute-transaction">Transaktion Ausführen</Link></li>
                    </ul>
                </nav>
                <button
                    className="waves-explorer-button"
                    onClick={async () => {
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
                    }}
                >
                    View on Waves Explorer
                </button>

                {/* <button
                    className="waves-explorer-button"
                    onClick={() => {
                        if (currentAddress) {
                            // Construct the URL using the current address
                            const url = `https://testnet.wavesexplorer.com/address/${currentAddress}`;
                            // Open the URL in a new tab
                            window.open(url, '_blank', 'noopener,noreferrer');
                        } else {
                            // Optionally handle the case when there is no address
                            alert("Address not available."); // Or any other fallback action
                        }
                    }}
                >
                    View on Waves Explorer
                </button> */}
                {/* {currentAddress && (
                    <a
                        href={`https://testnet.wavesexplorer.com/address/${currentAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="waves-explorer-link"
                    >
                        View on Waves Explorer
                    </a>
                )} */}
            </div>
        </header>
    );
};

export default Header;
