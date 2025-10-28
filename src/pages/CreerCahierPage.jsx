import React, { useState, useRef } from 'react'

const defaultCahier = {
  titre: "Cahier des charges - Projet Exemple",
  description: "Ce document décrit les besoins fonctionnels et techniques du projet Exemple.",
  objectifs: "Fournir une application web responsive permettant la gestion des tâches.",
  perimetre: "Fonctionnalités : création, modification, suppression et suivi des tâches. Exclu : intégration third-party.",
  contraintes: "Compatibilité navigateurs modernes, délais, budget limité.",
  livrables: "Application web, documentation utilisateur, guide d'installation.",
  calendrier: [
    { etape: 'Analyse', date: '2025-11-10' },
    { etape: 'Développement', date: '2026-01-15' },
    { etape: 'Recette', date: '2026-02-10' }
  ],
  budget: "10 000 €",
  partiesPrenantes: "Client, équipe dev, scrum master"
}

const CreerCahierPage = () => {
  const [cahier, setCahier] = useState(defaultCahier)
  const [previewMode, setPreviewMode] = useState('texte') // 'texte' or 'json'
  const [savedCahiers, setSavedCahiers] = useState([])
  
  // Charger un template si disponible dans sessionStorage
  React.useEffect(() => {
    const templateToLoad = sessionStorage.getItem('templateToLoad')
    if (templateToLoad) {
      try {
        const template = JSON.parse(templateToLoad)
        setCahier(template)
        sessionStorage.removeItem('templateToLoad') // Nettoyer après usage
      } catch (error) {
        console.error('Erreur lors du chargement du template:', error)
      }
    }
  }, [])

  function updateField(field, value) {
    setCahier((s) => ({ ...s, [field]: value }))
  }

  function updateMilestone(index, key, value) {
    setCahier((s) => {
      const calendrier = s.calendrier.map((m, i) => (i === index ? { ...m, [key]: value } : m))
      return { ...s, calendrier }
    })
  }

  function addMilestone() {
    setCahier((s) => ({ ...s, calendrier: [...s.calendrier, { etape: 'Nouvelle étape', date: '' }] }))
  }

  function removeMilestone(i) {
    setCahier((s) => ({ ...s, calendrier: s.calendrier.filter((_, idx) => idx !== i) }))
  }

  function generateText() {
    return `Titre: ${cahier.titre}\n\nDescription:\n${cahier.description}\n\nObjectifs:\n${cahier.objectifs}\n\nPérimètre:\n${cahier.perimetre}\n\nContraintes:\n${cahier.contraintes}\n\nLivrables:\n${cahier.livrables}\n\nCalendrier:\n${cahier.calendrier.map(m => `- ${m.etape} : ${m.date}`).join('\n')}\n\nBudget : ${cahier.budget}\n\nParties prenantes : ${cahier.partiesPrenantes}`
  }

  async function copyJSON() {
    const payload = JSON.stringify(cahier, null, 2)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(payload)
      alert('JSON copié dans le presse-papiers')
    } else {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = payload
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      alert('JSON copié (fallback)')
    }
  }

  function downloadJSON() {
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

  function saveCahier() {
    const savedData = {
      ...cahier,
      id: Date.now(),
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    }
    
    // Sauvegarder dans localStorage
    const existing = JSON.parse(localStorage.getItem('cahiers') || '[]')
    const updated = [...existing, savedData]
    localStorage.setItem('cahiers', JSON.stringify(updated))
    
    setSavedCahiers(updated)
    alert('Cahier des charges sauvegardé avec succès!')
  }

  function fillExample() {
    setCahier(defaultCahier)
  }

  function clearForm() {
    setCahier({ 
      titre: '', 
      description: '', 
      objectifs: '', 
      perimetre: '', 
      contraintes: '', 
      livrables: '', 
      calendrier: [], 
      budget: '', 
      partiesPrenantes: '' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un cahier des charges</h1>
          <p className="text-gray-600">Utilisez ce formulaire pour créer un cahier des charges complet et professionnel.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Informations du projet</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre du projet</label>
                <input 
                  type="text"
                  value={cahier.titre} 
                  onChange={(e) => updateField('titre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom de votre projet..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  value={cahier.description} 
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description détaillée du projet..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Objectifs</label>
                <textarea 
                  value={cahier.objectifs} 
                  onChange={(e) => updateField('objectifs', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Quels sont les objectifs à atteindre..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Périmètre</label>
                <textarea 
                  value={cahier.perimetre} 
                  onChange={(e) => updateField('perimetre', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ce qui est inclus et exclu du projet..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraintes</label>
                <input 
                  type="text"
                  value={cahier.contraintes} 
                  onChange={(e) => updateField('contraintes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contraintes techniques, budgétaires, temporelles..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Livrables</label>
                <input 
                  type="text"
                  value={cahier.livrables} 
                  onChange={(e) => updateField('livrables', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Liste des livrables attendus..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calendrier (étapes)</label>
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  <div className="space-y-3">
                    {cahier.calendrier.map((m, i) => (
                      <div key={i} className="flex gap-3 items-center bg-white p-3 rounded">
                        <input 
                          type="text"
                          value={m.etape} 
                          onChange={(e) => updateMilestone(i, 'etape', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Nom de l'étape..."
                        />
                        <input 
                          type="date"
                          value={m.date} 
                          onChange={(e) => updateMilestone(i, 'date', e.target.value)}
                          className="w-36 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button 
                          onClick={() => removeMilestone(i)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Suppr
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={addMilestone}
                    className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
                  >
                    + Ajouter une étape
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                <input 
                  type="text"
                  value={cahier.budget} 
                  onChange={(e) => updateField('budget', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Budget estimé..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parties prenantes</label>
                <input 
                  type="text"
                  value={cahier.partiesPrenantes} 
                  onChange={(e) => updateField('partiesPrenantes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Liste des personnes impliquées..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={fillExample}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium"
                >
                  Remplir exemple
                </button>
                <button 
                  onClick={clearForm}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
                >
                  Vider
                </button>
                <button 
                  onClick={saveCahier}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  💾 Sauvegarder
                </button>
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Aperçu</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPreviewMode('texte')}
                  className={`px-3 py-1 rounded text-sm font-medium ${previewMode === 'texte' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Texte
                </button>
                <button
                  onClick={() => setPreviewMode('json')}
                  className={`px-3 py-1 rounded text-sm font-medium ${previewMode === 'json' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  JSON
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 border rounded-lg p-4 h-96 overflow-auto">
              {previewMode === 'texte' ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {generateText()}
                </pre>
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {JSON.stringify(cahier, null, 2)}
                </pre>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button 
                onClick={copyJSON}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
              >
                📋 Copier JSON
              </button>
              <button 
                onClick={downloadJSON}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
              >
                📥 Télécharger JSON
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>💡 <strong>Astuce :</strong> Utilisez "Copier JSON" pour coller ailleurs ou "Télécharger JSON" pour sauvegarder localement.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreerCahierPage