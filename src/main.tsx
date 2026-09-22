import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

// Fast theme init before mount
;(function () {
  try {
    const stored = localStorage.getItem('homelab-theme')
    const theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'dark'
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    }
  } catch {
    document.documentElement.classList.add('dark')
  }
})()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
