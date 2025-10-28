import React, { useState, useRef } from 'react'
import './App.css'

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

function App() {
  const [cahier, setCahier] = useState(defaultCahier)
  const [previewMode, setPreviewMode] = useState('texte') // 'texte' or 'json'
  const downloadRef = useRef()

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

  function fillExample() {
    setCahier(defaultCahier)
  }

  function clearForm() {
    setCahier({ titre: '', description: '', objectifs: '', perimetre: '', contraintes: '', livrables: '', calendrier: [], budget: '', partiesPrenantes: '' })
  }

  return (
    <div className="app-container" style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Création de cahier des charges</h1>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <section style={{ flex: 1, minWidth: 320 }}>
          <h2>Formulaire (pré-rempli)</h2>
          <label>Titre</label>
          <input value={cahier.titre} onChange={(e) => updateField('titre', e.target.value)} />

          <label>Description</label>
          <textarea value={cahier.description} onChange={(e) => updateField('description', e.target.value)} rows={4} />

          <label>Objectifs</label>
          <textarea value={cahier.objectifs} onChange={(e) => updateField('objectifs', e.target.value)} rows={3} />

          <label>Périmètre</label>
          <textarea value={cahier.perimetre} onChange={(e) => updateField('perimetre', e.target.value)} rows={3} />

          <label>Contraintes</label>
          <input value={cahier.contraintes} onChange={(e) => updateField('contraintes', e.target.value)} />

          <label>Livrables</label>
          <input value={cahier.livrables} onChange={(e) => updateField('livrables', e.target.value)} />

          <label>Calendrier (étapes)</label>
          <div style={{ border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
            {cahier.calendrier.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input style={{ flex: 1 }} value={m.etape} onChange={(e) => updateMilestone(i, 'etape', e.target.value)} />
                <input style={{ width: 130 }} type="date" value={m.date} onChange={(e) => updateMilestone(i, 'date', e.target.value)} />
                <button onClick={() => removeMilestone(i)}>Suppr</button>
              </div>
            ))}
            <div>
              <button onClick={addMilestone}>+ Ajouter étape</button>
            </div>
          </div>

          <label>Budget</label>
          <input value={cahier.budget} onChange={(e) => updateField('budget', e.target.value)} />

          <label>Parties prenantes</label>
          <input value={cahier.partiesPrenantes} onChange={(e) => updateField('partiesPrenantes', e.target.value)} />

          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={fillExample}>Remplir exemple</button>
            <button onClick={clearForm}>Vider</button>
            <button onClick={() => setPreviewMode('texte')}>Aperçu texte</button>
            <button onClick={() => setPreviewMode('json')}>Aperçu JSON</button>
            <button onClick={copyJSON}>Copier JSON</button>
            <button onClick={downloadJSON}>Télécharger JSON</button>
          </div>
        </section>

        <aside style={{ flex: 1, minWidth: 320 }}>
          <h2>Aperçu</h2>
          <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, background: '#fafafa', maxHeight: '75vh', overflow: 'auto' }}>
            {previewMode === 'texte' ? (
              <pre style={{ whiteSpace: 'pre-wrap' }}>{generateText()}</pre>
            ) : (
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(cahier, null, 2)}</pre>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <small>Utilisez <strong>Copier JSON</strong> pour coller ailleurs ou <strong>Télécharger JSON</strong> pour sauvegarder localement.</small>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App
