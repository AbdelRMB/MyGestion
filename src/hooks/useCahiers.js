import { useState, useEffect, useCallback } from 'react'
import CahierService from '../services/CahierService'
import { useAuth } from '../contexts/AuthContext'

export const useCahiers = () => {
  const { currentUser } = useAuth()
  const [cahiers, setCahiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Charger les cahiers de l'utilisateur
  const loadCahiers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const userCahiers = CahierService.getCahiersForUser(currentUser)
      setCahiers(userCahiers)
    } catch (err) {
      setError('Erreur lors du chargement des cahiers des charges')
      console.error('Erreur loadCahiers:', err)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  // Sauvegarder un cahier
  const saveCahier = useCallback(async (cahier) => {
    try {
      const savedCahier = CahierService.saveCahier(cahier)
      await loadCahiers() // Recharger la liste
      return savedCahier
    } catch (err) {
      setError('Erreur lors de la sauvegarde')
      console.error('Erreur saveCahier:', err)
      throw err
    }
  }, [loadCahiers])

  // Supprimer un cahier
  const deleteCahier = useCallback(async (cahierId) => {
    try {
      const success = CahierService.deleteCahier(cahierId)
      if (success) {
        await loadCahiers() // Recharger la liste
      }
      return success
    } catch (err) {
      setError('Erreur lors de la suppression')
      console.error('Erreur deleteCahier:', err)
      return false
    }
  }, [loadCahiers])

  // Mettre à jour le statut d'une section
  const updateSectionStatus = useCallback(async (cahierId, sectionId, newStatus) => {
    try {
      const success = CahierService.updateSectionStatus(cahierId, sectionId, newStatus, currentUser)
      if (success) {
        await loadCahiers() // Recharger pour voir les changements
      }
      return success
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut')
      console.error('Erreur updateSectionStatus:', err)
      return false
    }
  }, [currentUser, loadCahiers])

  // Ajouter un commentaire
  const addComment = useCallback(async (cahierId, sectionId, comment) => {
    try {
      const newComment = CahierService.addSectionComment(cahierId, sectionId, comment, currentUser)
      if (newComment) {
        await loadCahiers() // Recharger pour voir le commentaire
      }
      return newComment
    } catch (err) {
      setError('Erreur lors de l\'ajout du commentaire')
      console.error('Erreur addComment:', err)
      return false
    }
  }, [currentUser, loadCahiers])

  // Rechercher des cahiers
  const searchCahiers = useCallback((query, filters) => {
    return CahierService.searchCahiers(query, filters)
  }, [])

  // Dupliquer un cahier
  const duplicateCahier = useCallback(async (cahierId, newTitle) => {
    try {
      const duplicated = CahierService.duplicateCahier(cahierId, newTitle, currentUser)
      if (duplicated) {
        await loadCahiers() // Recharger la liste
      }
      return duplicated
    } catch (err) {
      setError('Erreur lors de la duplication')
      console.error('Erreur duplicateCahier:', err)
      return null
    }
  }, [currentUser, loadCahiers])

  // Obtenir les statistiques
  const getStatistiques = useCallback(() => {
    return CahierService.getStatistiques(currentUser)
  }, [currentUser])

  // Charger les cahiers au montage du composant
  useEffect(() => {
    if (currentUser) {
      loadCahiers()
    }
  }, [currentUser, loadCahiers])

  return {
    cahiers,
    loading,
    error,
    saveCahier,
    deleteCahier,
    updateSectionStatus,
    addComment,
    searchCahiers,
    duplicateCahier,
    getStatistiques,
    refreshCahiers: loadCahiers
  }
}

export const useCahier = (cahierId) => {
  const [cahier, setCahier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cahierId) {
      try {
        const foundCahier = CahierService.getCahierById(cahierId)
        setCahier(foundCahier)
        setError(foundCahier ? null : 'Cahier des charges non trouvé')
      } catch (err) {
        setError('Erreur lors du chargement du cahier')
        console.error('Erreur useCahier:', err)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [cahierId])

  return { cahier, loading, error }
}