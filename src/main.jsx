import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { preloadInitialLanguage } from './i18n'

preloadInitialLanguage().finally(() => {
  createRoot(document.getElementById('root')).render(
    <App />,
  )
})
