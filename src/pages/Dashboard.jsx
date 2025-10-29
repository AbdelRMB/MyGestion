import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCahiers } from '../hooks/useCahiers'
import { LABELS, COULEURS_STATUTS, SECTEURS, STATUTS_CAHIER } from '../utils/constants'

const Dashboard = () => {
  const { currentUser, hasPermission } = useAuth()
  const { cahiers, loading, getStatistiques } = useCahiers()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (currentUser && !loading) {
      setStats(getStatistiques())
    }
  }, [currentUser, loading, getStatistiques])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  const recentCahiers = cahiers
    .sort((a, b) => new Date(b.dateModification) - new Date(a.dateModification))
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard - Cahiers des charges
          </h1>
          <p className="text-gray-600">
            Bienvenue {currentUser?.nom} ({LABELS.ROLES[currentUser?.role]})
          </p>
        </div>

        {/* Actions rapides */}
        <div className="mb-8 grid md:grid-cols-4 gap-4">
          <Link
            to="/creer"
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-3"
          >
            <span className="text-2xl">➕</span>
            <div>
              <div className="font-semibold">Nouveau cahier</div>
              <div className="text-sm opacity-90">Créer un cahier des charges</div>
            </div>
          </Link>

          <Link
            to="/cahiers"
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-3"
          >
            <span className="text-2xl">📋</span>
            <div>
              <div className="font-semibold">Mes cahiers</div>
              <div className="text-sm opacity-90">{stats?.total || 0} cahiers</div>
            </div>
          </Link>

          {hasPermission('VIEW_ALL_CAHIERS') && (
            <Link
              to="/tous-cahiers"
              className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-3"
            >
              <span className="text-2xl">📚</span>
              <div>
                <div className="font-semibold">Tous les cahiers</div>
                <div className="text-sm opacity-90">Vue d'ensemble</div>
              </div>
            </Link>
          )}

          {hasPermission('MANAGE_TEMPLATES') && (
            <Link
              to="/admin"
              className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-3"
            >
              <span className="text-2xl">⚙️</span>
              <div>
                <div className="font-semibold">Administration</div>
                <div className="text-sm opacity-90">Gestion système</div>
              </div>
            </Link>
          )}
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="mb-8 grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl text-blue-600 mr-4">📊</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Cahiers total</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl text-green-600 mr-4">✅</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.parStatut[STATUTS_CAHIER.VALIDE] || 0}
                  </div>
                  <div className="text-sm text-gray-600">Validés</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl text-orange-600 mr-4">⏳</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.parStatut[STATUTS_CAHIER.EN_COURS] || 0}
                  </div>
                  <div className="text-sm text-gray-600">En cours</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl text-purple-600 mr-4">📈</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.progressMoyen}%</div>
                  <div className="text-sm text-gray-600">Progrès moyen</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cahiers récents */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Cahiers récents</h2>
                <Link
                  to="/cahiers"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Voir tous →
                </Link>
              </div>
              
              <div className="p-6">
                {recentCahiers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-gray-500 mb-4">Aucun cahier des charges</p>
                    <Link
                      to="/creer"
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Créer le premier
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCahiers.map(cahier => (
                      <div key={cahier.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <Link
                              to={`/cahier/${cahier.id}`}
                              className="text-lg font-medium text-gray-900 hover:text-blue-600"
                            >
                              {cahier.titre || 'Cahier sans titre'}
                            </Link>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500">
                                {LABELS.SECTEURS[cahier.secteur]}
                              </span>
                              <span className="text-sm text-gray-500">
                                par {cahier.auteurNom}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${cahier.statut === STATUTS_CAHIER.VALIDE ? 'bg-green-100 text-green-800' :
                                cahier.statut === STATUTS_CAHIER.EN_COURS ? 'bg-blue-100 text-blue-800' :
                                cahier.statut === STATUTS_CAHIER.EN_ATTENTE_VALIDATION ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {LABELS.STATUTS_CAHIER[cahier.statut]}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(cahier.dateModification).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>

                        {/* Barre de progression */}
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progression</span>
                            <span>{Math.round((cahier.sections?.filter(s => s.statut === 'VALIDEE').length || 0) / (cahier.sections?.length || 1) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.round((cahier.sections?.filter(s => s.statut === 'VALIDEE').length || 0) / (cahier.sections?.length || 1) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques détaillées */}
          <div className="space-y-6">
            {/* Répartition par secteur */}
            {stats && Object.keys(stats.parSecteur).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Par secteur</h3>
                <div className="space-y-3">
                  {Object.entries(stats.parSecteur).map(([secteur, count]) => (
                    <div key={secteur} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {LABELS.SECTEURS[secteur] || secteur}
                      </span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Répartition par statut */}
            {stats && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Par statut</h3>
                <div className="space-y-3">
                  {Object.entries(stats.parStatut)
                    .filter(([_, count]) => count > 0)
                    .map(([statut, count]) => (
                    <div key={statut} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {LABELS.STATUTS_CAHIER[statut]}
                      </span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions rapides */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer par secteur</h3>
              <div className="space-y-2">
                {Object.entries(LABELS.SECTEURS).map(([key, label]) => (
                  <Link
                    key={key}
                    to={`/creer?secteur=${key}`}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard