import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Create a single root instance
const rootElement = document.getElementById('root')

// Only create a root if the element exists and no root has been created yet
if (rootElement && !rootElement.hasAttribute('data-reactroot')) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
