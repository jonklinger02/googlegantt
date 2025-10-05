
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toaster } from 'sonner';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
    {/* Sonner is a dependency I am assuming exists for toast notifications */}
    {/* In a real project, this would be installed via npm/yarn */}
    {/* For now, I will omit its direct usage but keep the provider for structure */}
  </React.StrictMode>
);
