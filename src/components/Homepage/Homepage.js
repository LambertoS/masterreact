// src/components/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css'; // Für das Styling der Buttons und der Seite

const Homepage = () => {
  return (
    <div className="home-page">
      <h1>Willkommen bei CircularBlockNet</h1>
      <div className="button-container">
        <Link to="/contract-overview"><button>Übersicht Contract</button></Link>
        <Link to="/create-contract"><button>Contract Erstellen</button></Link>
        <Link to="/components-overview"><button>Übersicht Komponenten</button></Link>
        <Link to="/add-component"><button>Komponente Hinzufügen</button></Link>
        <Link to="/execute-transaction"><button>Transaktion Ausführen</button></Link>
      </div>
    </div>
  );
};

export default Homepage;
