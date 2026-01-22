import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Siemens iX setup
import '@siemens/ix/dist/siemens-ix/siemens-ix.css';
import { defineCustomElements } from '@siemens/ix/loader';
import {IxApplicationContext} from "@siemens/ix-react";

// This function "wakes up" the buttons and modals
defineCustomElements();

createRoot(document.getElementById('root')).render(
    <IxApplicationContext>
        <StrictMode>
            <App />
        </StrictMode>
    </IxApplicationContext>
);