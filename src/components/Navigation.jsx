import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Accueil', icon: '🏠' },
    { path: '/creer-cahier', label: 'Créer un cahier des charges', icon: '📝' },
    { path: '/mes-cahiers', label: 'Mes cahiers', icon: '📋' },
    { path: '/templates', label: 'Templates', icon: '📄' }
  ]

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold hover:text-blue-200">
              MyGestion
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${location.pathname === item.path 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                  }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Menu mobile */}
          <div className="md:hidden">
            <button className="text-blue-100 hover:text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation