import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './Popup';
import './style.css';
import '@/styles/themes.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
