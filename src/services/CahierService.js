// Service de gestion des données des cahiers des charges
import { STATUTS_CAHIER, STATUTS_SECTION } from '../utils/constants'

const STORAGE_KEY = 'cahiers_des_charges'
const COMMENTS_KEY = 'cahiers_commentaires'

export class CahierService {
  // Sauvegarder un cahier
  static saveCahier(cahier) {
    try {
      const cahiers = this.getAllCahiers()
      const existingIndex = cahiers.findIndex(c => c.id === cahier.id)
      
      const cahierToSave = {
        ...cahier,
        dateModification: new Date().toISOString(),
        version: (cahier.version || 1) + (existingIndex >= 0 ? 1 : 0)
      }

      if (existingIndex >= 0) {
        cahiers[existingIndex] = cahierToSave
      } else {
        cahiers.push(cahierToSave)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cahiers))
      return cahierToSave
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      throw new Error('Impossible de sauvegarder le cahier des charges')
    }
  }

  // Récupérer tous les cahiers
  static getAllCahiers() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Erreur lors du chargement des cahiers:', error)
      return []
    }
  }

  // Récupérer un cahier par ID
  static getCahierById(id) {
    const cahiers = this.getAllCahiers()
    return cahiers.find(c => c.id === parseInt(id))
  }

  // Supprimer un cahier
  static deleteCahier(id) {
    try {
      const cahiers = this.getAllCahiers()
      const filteredCahiers = cahiers.filter(c => c.id !== parseInt(id))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCahiers))
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      return false
    }
  }

  // Filtrer les cahiers selon l'utilisateur et ses permissions
  static getCahiersForUser(user) {
    const allCahiers = this.getAllCahiers()
    
    if (!user) return []

    // Admin voit tout
    if (user.role === 'ADMIN') {
      return allCahiers
    }

    // Chef de pôle voit les cahiers de son secteur + ses propres cahiers
    if (user.role === 'CHEF_POLE') {
      return allCahiers.filter(c => 
        c.secteur === user.secteur || c.auteurId === user.id
      )
    }

    // Utilisateur ne voit que ses cahiers
    return allCahiers.filter(c => c.auteurId === user.id)
  }

  // Calculer le pourcentage d'avancement
  static calculateProgress(cahier) {
    if (!cahier.sections || cahier.sections.length === 0) return 0
    
    const sectionsValidees = cahier.sections.filter(s => 
      s.statut === STATUTS_SECTION.VALIDEE
    ).length
    
    return Math.round((sectionsValidees / cahier.sections.length) * 100)
  }

  // Mettre à jour le statut d'une section
  static updateSectionStatus(cahierId, sectionId, newStatus, validatorUser = null) {
    try {
      const cahiers = this.getAllCahiers()
      const cahierIndex = cahiers.findIndex(c => c.id === parseInt(cahierId))
      
      if (cahierIndex === -1) return false

      const sectionIndex = cahiers[cahierIndex].sections.findIndex(s => s.id === sectionId)
      if (sectionIndex === -1) return false

      cahiers[cahierIndex].sections[sectionIndex].statut = newStatus
      cahiers[cahierIndex].sections[sectionIndex].dateModification = new Date().toISOString()

      if (validatorUser && newStatus === STATUTS_SECTION.VALIDEE) {
        cahiers[cahierIndex].sections[sectionIndex].valideur = validatorUser.nom
        cahiers[cahierIndex].sections[sectionIndex].dateValidation = new Date().toISOString()
      }

      // Ajouter à l'historique
      cahiers[cahierIndex].historique = cahiers[cahierIndex].historique || []
      cahiers[cahierIndex].historique.push({
        date: new Date().toISOString(),
        action: 'SECTION_STATUS_CHANGE',
        auteur: validatorUser ? validatorUser.nom : 'Système',
        details: `Statut de la section "${cahiers[cahierIndex].sections[sectionIndex].titre}" changé vers "${newStatus}"`
      })

      // Mettre à jour le statut global du cahier si toutes les sections sont validées
      const progress = this.calculateProgress(cahiers[cahierIndex])
      if (progress === 100) {
        cahiers[cahierIndex].statut = STATUTS_CAHIER.VALIDE
      } else if (progress > 0) {
        cahiers[cahierIndex].statut = STATUTS_CAHIER.EN_COURS
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cahiers))
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return false
    }
  }

  // Ajouter un commentaire à une section
  static addSectionComment(cahierId, sectionId, comment, author) {
    try {
      const cahiers = this.getAllCahiers()
      const cahierIndex = cahiers.findIndex(c => c.id === parseInt(cahierId))
      
      if (cahierIndex === -1) return false

      const sectionIndex = cahiers[cahierIndex].sections.findIndex(s => s.id === sectionId)
      if (sectionIndex === -1) return false

      const newComment = {
        id: Date.now(),
        auteur: author.nom,
        auteurId: author.id,
        date: new Date().toISOString(),
        contenu: comment,
        type: 'section'
      }

      cahiers[cahierIndex].sections[sectionIndex].commentaires = 
        cahiers[cahierIndex].sections[sectionIndex].commentaires || []
      cahiers[cahierIndex].sections[sectionIndex].commentaires.push(newComment)

      // Ajouter à l'historique global
      cahiers[cahierIndex].historique = cahiers[cahierIndex].historique || []
      cahiers[cahierIndex].historique.push({
        date: new Date().toISOString(),
        action: 'COMMENT_ADD',
        auteur: author.nom,
        details: `Commentaire ajouté sur la section "${cahiers[cahierIndex].sections[sectionIndex].titre}"`
      })

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cahiers))
      return newComment
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error)
      return false
    }
  }

  // Recherche dans les cahiers
  static searchCahiers(query, filters = {}) {
    const cahiers = this.getAllCahiers()
    let results = [...cahiers]

    // Recherche textuelle
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase()
      results = results.filter(c => 
        c.titre.toLowerCase().includes(searchTerm) ||
        c.auteurNom.toLowerCase().includes(searchTerm) ||
        c.sections.some(s => 
          s.titre.toLowerCase().includes(searchTerm) ||
          s.contenu.toLowerCase().includes(searchTerm)
        )
      )
    }

    // Filtres
    if (filters.secteur) {
      results = results.filter(c => c.secteur === filters.secteur)
    }

    if (filters.statut) {
      results = results.filter(c => c.statut === filters.statut)
    }

    if (filters.auteur) {
      results = results.filter(c => c.auteurId === parseInt(filters.auteur))
    }

    if (filters.dateDebut) {
      results = results.filter(c => new Date(c.dateCreation) >= new Date(filters.dateDebut))
    }

    if (filters.dateFin) {
      results = results.filter(c => new Date(c.dateCreation) <= new Date(filters.dateFin))
    }

    return results
  }

  // Statistiques
  static getStatistiques(user) {
    const cahiers = this.getCahiersForUser(user)
    
    const stats = {
      total: cahiers.length,
      parStatut: {},
      parSecteur: {},
      progressMoyen: 0,
      derniereActivite: null
    }

    // Compter par statut
    Object.values(STATUTS_CAHIER).forEach(statut => {
      stats.parStatut[statut] = cahiers.filter(c => c.statut === statut).length
    })

    // Compter par secteur
    cahiers.forEach(c => {
      stats.parSecteur[c.secteur] = (stats.parSecteur[c.secteur] || 0) + 1
    })

    // Calculer le progrès moyen
    if (cahiers.length > 0) {
      const totalProgress = cahiers.reduce((sum, c) => sum + this.calculateProgress(c), 0)
      stats.progressMoyen = Math.round(totalProgress / cahiers.length)
    }

    // Dernière activité
    const cahiersTriesParDate = cahiers
      .sort((a, b) => new Date(b.dateModification) - new Date(a.dateModification))
    
    if (cahiersTriesParDate.length > 0) {
      stats.derniereActivite = cahiersTriesParDate[0].dateModification
    }

    return stats
  }

  // Dupliquer un cahier
  static duplicateCahier(cahierId, newTitle, user) {
    try {
      const originalCahier = this.getCahierById(cahierId)
      if (!originalCahier) return null

      const duplicatedCahier = {
        ...originalCahier,
        id: Date.now(),
        titre: newTitle || `${originalCahier.titre} (Copie)`,
        auteurId: user.id,
        auteurNom: user.nom,
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        statut: STATUTS_CAHIER.BROUILLON,
        version: 1,
        sections: originalCahier.sections.map(section => ({
          ...section,
          statut: STATUTS_SECTION.NON_COMMENCE,
          commentaires: [],
          valideur: null,
          dateValidation: null
        })),
        commentairesGlobaux: [],
        historique: [{
          date: new Date().toISOString(),
          action: 'DUPLICATION',
          auteur: user.nom,
          details: `Dupliqué depuis "${originalCahier.titre}"`
        }]
      }

      return this.saveCahier(duplicatedCahier)
    } catch (error) {
      console.error('Erreur lors de la duplication:', error)
      return null
    }
  }
}

export default CahierService