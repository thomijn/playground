import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import Doorway from './playgrounds/doorway/index.jsx'
import Soolax from './playgrounds/soolax/index.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Soolax />
  </StrictMode>,
)
