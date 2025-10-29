import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LABELS } from '../utils/constants'

const Navigation = () => {
  const location = useLocation()
  const { currentUser, logout, hasPermission, switchUser, demoUsers } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const getNavItems = () => {
    const items = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/cahiers', label: 'Mes cahiers', icon: '📋' },
      { path: '/creer', label: 'Nouveau cahier', icon: '➕' }
    ]

    if (hasPermission('VIEW_ALL_CAHIERS')) {
      items.push({ path: '/tous-cahiers', label: 'Tous les cahiers', icon: '�' })
    }

    if (hasPermission('MANAGE_TEMPLATES')) {
      items.push({ path: '/admin', label: 'Administration', icon: '⚙️' })
    }

    return items
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-xl font-bold hover:text-gray-300 flex items-center space-x-2">
              <span className="text-2xl">📋</span>
              <span>MyGestion CDC</span>
            </Link>
          </div>
          
          {/* Navigation principale - Desktop */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${location.pathname === item.path 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Menu utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Profil utilisateur */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none"
              >
                <span className="text-lg">{currentUser?.avatar || '👤'}</span>
                <div className="text-left">
                  <div className="text-sm font-medium">{currentUser?.nom}</div>
                  <div className="text-xs text-gray-400">
                    {LABELS.ROLES[currentUser?.role]}
                  </div>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menu déroulant utilisateur */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50">
                  <div className="py-2">
                    {/* Informations utilisateur */}
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-sm text-gray-900 font-medium">{currentUser?.nom}</div>
                      <div className="text-xs text-gray-500">{currentUser?.email}</div>
                      <div className="text-xs text-blue-600 font-medium mt-1">
                        {LABELS.ROLES[currentUser?.role]}
                        {currentUser?.secteur && ` - ${LABELS.SECTEURS[currentUser.secteur]}`}
                      </div>
                    </div>

                    {/* Changement d'utilisateur (démo) */}
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">Changer d'utilisateur (démo):</div>
                      {demoUsers.map(user => (
                        <button
                          key={user.id}
                          onClick={() => {
                            switchUser(user.id)
                            setShowUserMenu(false)
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-xs hover:bg-gray-100 flex items-center space-x-2
                            ${currentUser?.id === user.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                        >
                          <span>{user.avatar}</span>
                          <span>{user.nom}</span>
                        </button>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-2">
                      <button
                        onClick={() => {
                          logout()
                          setShowUserMenu(false)
                        }}
                        className="w-full text-left px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      >
                        🚪 Se déconnecter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu mobile hamburger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {showMobileMenu && (
          <div className="md:hidden bg-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${location.pathname === item.path 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showMobileMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false)
            setShowMobileMenu(false)
          }}
        />
      )}
    </nav>
  )
}

export default Navigation