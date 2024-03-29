// src/components/HomePage.js
import React from 'react';
import {Link} from 'react-router-dom';
import './Homepage.css'; // Für das Styling der Buttons und der Seite

/**
 * Homepage component displaying the main navigation buttons to various features of the CircularBlockNet application.
 */
const Homepage = () => {
    return (
        <div className="home-page">
            <h1>Welcome to CircularBlockNet</h1>
            <div className="button-container">
                {/* Links to different application pages using buttons for navigation */}
                <Link to="/contract-overview">
                    <button>Contract Overview</button>
                </Link>
                <Link to="/create-contract">
                    <button>Create Contract</button>
                </Link>
                <Link to="/account-overview">
                    <button>Account Overview</button>
                </Link>
                <Link to="/add-component">
                    <button>Add Data</button>
                </Link>
                <Link to="/execute-transaction">
                    <button>Execute Transaction</button>
                </Link>
            </div>
        </div>
    );
};

export default Homepage;
