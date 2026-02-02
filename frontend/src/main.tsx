import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  // if the warning message contains specific known text (related to Recharts layout), ignore it
  if (args[0] && typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1)')) {
    return;
  }
  originalWarn(...args);
};

console.error = (...args) => {
  // some Recharts warnings are logged as errors, so we handle those too
  if (args[0] && typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1)')) {
    return;
  }
  originalError(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)