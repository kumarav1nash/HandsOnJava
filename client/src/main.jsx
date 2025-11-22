import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './design-system/tokens.css'
import './design-system/context-menu.css'
import App from './App.jsx'
import LocaleProvider from './i18n/LocaleProvider.jsx'

import { ModeProvider } from './context/ModeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <ModeProvider>
          <App />
        </ModeProvider>
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>,
)
