import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import LoginPage from './components/LoginPage'
import Dashboard from './pages/Dashboard'
import './App.css'

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <LoginPage />
  }
  
  return children
}

// Composant principal avec navigation
const MainApp = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cahiers" element={<div className="p-8 text-center">Page Mes Cahiers - En construction</div>} />
        <Route path="/creer" element={<div className="p-8 text-center">Page Création - En construction</div>} />
        <Route path="/tous-cahiers" element={<div className="p-8 text-center">Page Tous les Cahiers - En construction</div>} />
        <Route path="/admin" element={<div className="p-8 text-center">Page Administration - En construction</div>} />
        <Route path="/cahier/:id" element={<div className="p-8 text-center">Page Détail Cahier - En construction</div>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainApp />
      </Router>
    </AuthProvider>
  )
}

export default App
