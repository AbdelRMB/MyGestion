import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const MesCahiersPage = () => {
  const [cahiers, setCahiers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Charger les cahiers depuis localStorage
    const savedCahiers = JSON.parse(localStorage.getItem('cahiers') || '[]')
    setCahiers(savedCahiers)
  }, [])

  const filteredCahiers = cahiers.filter(cahier => 
    cahier.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cahier.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deleteCahier = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cahier des charges ?')) {
      const updatedCahiers = cahiers.filter(c => c.id !== id)
      setCahiers(updatedCahiers)
      localStorage.setItem('cahiers', JSON.stringify(updatedCahiers))
    }
  }

  const downloadCahier = (cahier) => {
    const data = JSON.stringify(cahier, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (cahier.titre || 'cahier-des-charges').replace(/[^a-z0-9-_. ]/gi, '_') + '.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes cahiers des charges</h1>
          <p className="text-gray-600">Gérez et consultez tous vos cahiers des charges sauvegardés.</p>
        </div>

        {/* Barre de recherche et actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par titre ou description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <Link
                to="/creer-cahier"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                ➕ Nouveau cahier
              </Link>
            </div>
          </div>
        </div>

        {/* Liste des cahiers */}
        {filteredCahiers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            {cahiers.length === 0 ? (
              <>
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun cahier des charges</h3>
                <p className="text-gray-500 mb-6">Vous n'avez pas encore créé de cahier des charges.</p>
                <Link
                  to="/creer-cahier"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Créer mon premier cahier
                </Link>
              </>
            ) : (
              <>
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun résultat</h3>
                <p className="text-gray-500">Aucun cahier ne correspond à votre recherche "{searchTerm}".</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCahiers.map((cahier) => (
              <div key={cahier.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {cahier.titre}
                    </h3>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => downloadCahier(cahier)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Télécharger"
                      >
                        📥
                      </button>
                      <button
                        onClick={() => deleteCahier(cahier.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {cahier.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Budget:</span>
                      <span className="font-medium">{cahier.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Étapes:</span>
                      <span className="font-medium">{cahier.calendrier?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Créé le:</span>
                      <span className="font-medium">
                        {cahier.dateCreation ? formatDate(cahier.dateCreation) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Modifié {cahier.dateModification ? formatDate(cahier.dateModification) : 'N/A'}
                    </span>
                    <button
                      onClick={() => {
                        const data = JSON.stringify(cahier, null, 2)
                        navigator.clipboard.writeText(data)
                        alert('JSON copié dans le presse-papiers!')
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Copier JSON
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistiques */}
        {cahiers.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{cahiers.length}</div>
                <div className="text-sm text-gray-600">Cahiers créés</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {cahiers.reduce((sum, c) => sum + (c.calendrier?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Étapes planifiées</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {cahiers.filter(c => c.budget && c.budget.trim()).length}
                </div>
                <div className="text-sm text-gray-600">Avec budget</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(cahiers.reduce((sum, c) => sum + (c.titre?.length || 0), 0) / cahiers.length) || 0}
                </div>
                <div className="text-sm text-gray-600">Caractères moy. titre</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MesCahiersPage