import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/api.js'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_Y3Jpc3AtcmluZ3RhaWwtMTkuY2xlcmsuYWNjb3VudHMuZGV2JA';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App publishableKey={PUBLISHABLE_KEY} />
  </BrowserRouter>
);