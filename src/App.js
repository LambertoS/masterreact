import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { WavesTransactionsProvider } from './components/Blockchain/WavesTransactionContext'; // Stellen Sie sicher, dass der Pfad korrekt ist
import ContractOverview from './components/ContractOverview/ContractOverview';
import ComponentsOverview from './components/ComponentsOverview/ComponentsOverview';
import AddComponent from './components/AddComponent/AddComponent';
import CreateContract from './components/CreateContract/CreateContract';
import ExecuteTransaction from './components/ExecuteTransaction/ExecuteTransaction';
import Header from './components/Header/Header';
import Homepage from './components/Homepage/Homepage';
import './App.css';

function App() {
  return (
    <Router>
      <WavesTransactionsProvider> 
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/header-title" element={<Homepage />} />
            <Route path="/contract-overview" element={<ContractOverview />} />
            <Route path="/components-overview" element={<ComponentsOverview />} />
            <Route path="/add-component" element={<AddComponent />} />
            <Route path="/create-contract" element={<CreateContract />} />
            <Route path="/execute-transaction" element={<ExecuteTransaction />} />
          </Routes>
        </div>
      </WavesTransactionsProvider>
    </Router>
  );
}

export default App;
