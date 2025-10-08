import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App';

// Obtener la clave publicable de Clerk desde las variables de entorno
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
const API_URL = process.env.REACT_APP_API_URL;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Validar variables de entorno críticas
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Validar API_URL en producción
if (IS_PRODUCTION && !API_URL) {
  throw new Error(
    "REACT_APP_API_URL is required in production. " +
    "Please set this environment variable to your backend URL."
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <App />
  </ClerkProvider>
);