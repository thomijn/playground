import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import Doorway from './playgrounds/doorway/index.jsx'
import Soolax from './playgrounds/soolax/index.jsx'
import Coolblue from './playgrounds/coolblue/MarkerLess.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Coolblue />
  </StrictMode>,
)
