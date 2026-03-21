import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const APP_VERSION = '1.3.6';
console.log(`%c QuizApp v${APP_VERSION} `, 'background: #6366F1; color: white; font-size: 14px; font-weight: bold; border-radius: 4px; padding: 4px 8px;');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
