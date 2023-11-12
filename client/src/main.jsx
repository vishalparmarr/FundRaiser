import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThirdwebProvider, useContract } from '@thirdweb-dev/react';


import { StateContextProvider } from './context';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
<ThirdwebProvider activeChain="binance-testnet"
  clientId="6f15e039d5bf80778aa9923f094bcc09">
    <Router>
      <StateContextProvider>
        <App />
      </StateContextProvider>
    </Router>
  </ThirdwebProvider>
)

// function Component() {
//   const { contract, isLoading } = useContract("0x0000000000000000000000000000000000000000");
// }