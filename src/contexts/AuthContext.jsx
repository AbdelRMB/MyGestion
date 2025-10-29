import React, { createContext, useContext, useState, useEffect } from 'react'
import { ROLES } from '../utils/constants'

const AuthContext = createContext()

// Utilisateurs de démonstration
const DEMO_USERS = [
  {
    id: 1,
    nom: 'Jean Dupont',
    email: 'j.dupont@entreprise.com',
    role: ROLES.ADMIN,
    secteur: null,
    avatar: '👨‍💼'
  },
  {
    id: 2, 
    nom: 'Marie Martin',
    email: 'm.martin@entreprise.com',
    role: ROLES.CHEF_POLE,
    secteur: 'DEVELOPPEMENT',
    avatar: '👩‍💻'
  },
  {
    id: 3,
    nom: 'Pierre Durand',
    email: 'p.durand@entreprise.com', 
    role: ROLES.UTILISATEUR,
    secteur: 'MARKETING',
    avatar: '👨‍🎨'
  },
  {
    id: 4,
    nom: 'Sophie Bernard',
    email: 's.bernard@entreprise.com',
    role: ROLES.CHEF_POLE,
    secteur: 'RH',
    avatar: '👩‍💼'
  },
  {
    id: 5,
    nom: 'Thomas Petit',
    email: 't.petit@entreprise.com',
    role: ROLES.UTILISATEUR,
    secteur: 'COMMUNICATION',
    avatar: '👨‍📰'
  }
]

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Vérifier s'il y a un utilisateur en session
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error)
        localStorage.removeItem('currentUser')
      }
    }
  }, [])

  const login = (email, password) => {
    // Simulation d'authentification (en prod, appel API)
    const user = DEMO_USERS.find(u => u.email === email)
    
    if (user && password === 'demo123') { // Mot de passe de demo
      setCurrentUser(user)
      setIsAuthenticated(true)
      localStorage.setItem('currentUser', JSON.stringify(user))
      return { success: true, user }
    }
    
    return { success: false, error: 'Email ou mot de passe incorrect' }
  }

  const logout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('currentUser')
  }

  const switchUser = (userId) => {
    // Fonction pour changer d'utilisateur facilement en démo
    const user = DEMO_USERS.find(u => u.id === userId)
    if (user) {
      setCurrentUser(user)
      setIsAuthenticated(true)
      localStorage.setItem('currentUser', JSON.stringify(user))
    }
  }

  const hasPermission = (permission) => {
    if (!currentUser) return false

    switch (permission) {
      case 'MANAGE_TEMPLATES':
        return currentUser.role === ROLES.ADMIN
      case 'VALIDATE_CAHIERS':
        return currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.CHEF_POLE
      case 'CREATE_CAHIERS':
        return true // Tous les utilisateurs connectés
      case 'VIEW_ALL_CAHIERS':
        return currentUser.role === ROLES.ADMIN
      case 'MODERATE_COMMENTS':
        return currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.CHEF_POLE
      default:
        return false
    }
  }

  const canAccessCahier = (cahier) => {
    if (!currentUser || !cahier) return false

    // Admin voit tout
    if (currentUser.role === ROLES.ADMIN) return true

    // Chef de pôle voit les cahiers de son secteur
    if (currentUser.role === ROLES.CHEF_POLE) {
      return cahier.secteur === currentUser.secteur || cahier.auteurId === currentUser.id
    }

    // Utilisateur voit seulement ses propres cahiers
    return cahier.auteurId === currentUser.id
  }

  const value = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    switchUser,
    hasPermission,
    canAccessCahier,
    demoUsers: DEMO_USERS
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}