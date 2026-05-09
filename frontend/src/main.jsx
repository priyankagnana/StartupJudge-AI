import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const stored = localStorage.getItem('theme');
const prefersDark = !stored
  ? window.matchMedia('(prefers-color-scheme: dark)').matches
  : stored === 'dark';
if (prefersDark) document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
