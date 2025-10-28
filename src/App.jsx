import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import CreerCahierPage from './pages/CreerCahierPage'
import MesCahiersPage from './pages/MesCahiersPage'
import TemplatesPage from './pages/TemplatesPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/creer-cahier" element={<CreerCahierPage />} />
          <Route path="/mes-cahiers" element={<MesCahiersPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
