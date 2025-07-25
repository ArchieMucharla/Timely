import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from './components/ThemeContext';  // 🌟 add this!

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>  
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// Performance
reportWebVitals();
