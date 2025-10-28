import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur MyGestion
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Créez, gérez et organisez vos cahiers des charges facilement. 
            Un outil simple et efficace pour tous vos projets.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/creer-cahier"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Créer un nouveau cahier des charges
            </Link>
            <Link
              to="/mes-cahiers"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Voir mes cahiers
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Création simple</h3>
            <p className="text-gray-600">
              Interface intuitive pour créer vos cahiers des charges avec tous les éléments essentiels.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">💾</div>
            <h3 className="text-xl font-semibold mb-2">Sauvegarde automatique</h3>
            <p className="text-gray-600">
              Vos données sont sauvegardées automatiquement et disponibles à tout moment.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📤</div>
            <h3 className="text-xl font-semibold mb-2">Export facile</h3>
            <p className="text-gray-600">
              Exportez vos cahiers au format JSON ou PDF pour les partager facilement.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Statistiques rapides</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">0</div>
              <div className="text-gray-600">Cahiers créés</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">0</div>
              <div className="text-gray-600">Projets terminés</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">4</div>
              <div className="text-gray-600">Templates disponibles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">∞</div>
              <div className="text-gray-600">Possibilités</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage