import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const LoginPage = () => {
  const { login, demoUsers } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = login(email, password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const loginAsDemo = (user) => {
    setEmail(user.email)
    setPassword('demo123')
    const result = login(user.email, 'demo123')
    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MyGestion</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Cahiers des charges</h2>
          <p className="text-gray-600">Connectez-vous pour accéder à la plateforme</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre.email@entreprise.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Comptes de démonstration */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
              Comptes de démonstration
            </h3>
            <div className="space-y-2">
              {demoUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => loginAsDemo(user)}
                  className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{user.avatar}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user.nom}</div>
                      <div className="text-sm text-gray-500">
                        {user.role === 'ADMIN' && 'Administrateur'}
                        {user.role === 'CHEF_POLE' && `Chef de pôle ${user.secteur}`}
                        {user.role === 'UTILISATEUR' && `Utilisateur ${user.secteur}`}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Cliquer pour se connecter
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Mode démo :</strong> Mot de passe universel : <code className="bg-blue-100 px-1 rounded">demo123</code>
              </p>
            </div>
          </div>
        </div>

        {/* Informations système */}
        <div className="text-center text-sm text-gray-500">
          <p>Système de gestion des cahiers des charges</p>
          <p>Version 1.0 - Interface professionnelle</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage