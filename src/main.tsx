import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useAccentColorStore } from './stores/accentColorStore';

// Initialize accent color from storage before rendering
const { accentColor, applyAccentColor } = useAccentColorStore.getState();
applyAccentColor(accentColor);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);