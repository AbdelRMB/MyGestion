import { SECTEURS, STATUTS_SECTION } from '../utils/constants'

// Templates professionnels par secteur d'activité
export const SECTEUR_TEMPLATES = {
  [SECTEURS.DEVELOPPEMENT]: {
    nom: 'Développement',
    icon: '💻',
    couleur: 'blue',
    sections: [
      {
        id: 'fonctionnalites',
        titre: 'Fonctionnalités attendues',
        description: 'Description détaillée des fonctionnalités à développer',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Décrivez les fonctionnalités principales, les cas d\'usage, les workflows...',
        defaut: ''
      },
      {
        id: 'livrables', 
        titre: 'Livrables techniques',
        description: 'Liste des éléments à livrer',
        type: 'checklist',
        obligatoire: true,
        items: [
          'Code source versionné',
          'Documentation technique',
          'Tests unitaires',
          'Tests d\'intégration', 
          'Guide de déploiement',
          'Documentation utilisateur'
        ]
      },
      {
        id: 'technologies',
        titre: 'Technologies et contraintes',
        description: 'Stack technique et contraintes d\'architecture',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Technologies imposées, contraintes d\'architecture, compatibilité...',
        defaut: ''
      },
      {
        id: 'contraintes_techniques',
        titre: 'Contraintes techniques',
        description: 'Performance, sécurité, scalabilité',
        type: 'wysiwyg',
        obligatoire: false,
        placeholder: 'Temps de réponse, nombre d\'utilisateurs concurrent, sécurité...',
        defaut: ''
      },
      {
        id: 'environnements',
        titre: 'Environnements',
        description: 'Environnements de développement, test et production',
        type: 'checklist',
        obligatoire: false,
        items: [
          'Environnement de développement',
          'Environnement de test',
          'Environnement de pre-production',
          'Environnement de production'
        ]
      }
    ]
  },

  [SECTEURS.RH]: {
    nom: 'Ressources Humaines', 
    icon: '👥',
    couleur: 'green',
    sections: [
      {
        id: 'poste_concerne',
        titre: 'Poste concerné',
        description: 'Description du poste à pourvoir',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Intitulé du poste, mission principale, rattachement hiérarchique...',
        defaut: ''
      },
      {
        id: 'profil_recherche',
        titre: 'Profil recherché',
        description: 'Compétences et expérience requises',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Formation, expérience, compétences techniques et comportementales...',
        defaut: ''
      },
      {
        id: 'processus_recrutement',
        titre: 'Processus de recrutement',
        description: 'Étapes du processus de recrutement',
        type: 'checklist',
        obligatoire: true,
        items: [
          'Tri des candidatures',
          'Entretien téléphonique',
          'Entretien RH',
          'Entretien technique/métier',
          'Tests/évaluations',
          'Prise de références'
        ]
      },
      {
        id: 'delai_budget',
        titre: 'Délai et budget',
        description: 'Planning et enveloppe budgétaire',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Date limite de recrutement, fourchette salariale, coûts de recrutement...',
        defaut: ''
      },
      {
        id: 'integration',
        titre: 'Intégration',
        description: 'Process d\'intégration du nouveau collaborateur',
        type: 'checklist',
        obligatoire: false,
        items: [
          'Préparation du poste de travail',
          'Parcours d\'intégration défini',
          'Tuteur/mentor désigné',
          'Formation initiale planifiée',
          'Point d\'étape à 1 mois',
          'Point d\'étape à 3 mois'
        ]
      }
    ]
  },

  [SECTEURS.COMMUNICATION]: {
    nom: 'Communication',
    icon: '📢',
    couleur: 'purple',
    sections: [
      {
        id: 'objectifs_communication',
        titre: 'Objectifs de communication',
        description: 'Buts et messages clés de la campagne',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Objectifs stratégiques, messages principaux, KPI visés...',
        defaut: ''
      },
      {
        id: 'public_cible',
        titre: 'Public cible',
        description: 'Audience visée et personas',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Démographie, comportements, besoins, canaux de communication privilégiés...',
        defaut: ''
      },
      {
        id: 'supports_canaux',
        titre: 'Supports et canaux',
        description: 'Moyens de communication à utiliser',
        type: 'checklist',
        obligatoire: true,
        items: [
          'Site web / Landing page',
          'Réseaux sociaux',
          'Emailing',
          'Presse / Relations publiques',
          'Événements',
          'Publicité digitale',
          'Supports print',
          'Vidéo / Podcast'
        ]
      },
      {
        id: 'ton_style',
        titre: 'Ton et style',
        description: 'Ligne éditoriale et identité visuelle',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Ton de communication, charte graphique, style rédactionnel...',
        defaut: ''
      },
      {
        id: 'planning_budget',
        titre: 'Planning et budget',
        description: 'Calendrier et ressources allouées',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Dates clés, budget par canal, ressources humaines nécessaires...',
        defaut: ''
      }
    ]
  },

  [SECTEURS.MARKETING]: {
    nom: 'Marketing',
    icon: '📊',
    couleur: 'orange',
    sections: [
      {
        id: 'etude_marche',
        titre: 'Étude de marché',
        description: 'Analyse du marché et de la concurrence',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Taille du marché, concurrents, tendances, opportunités...',
        defaut: ''
      },
      {
        id: 'positionnement',
        titre: 'Positionnement produit/service',
        description: 'Proposition de valeur et différenciation',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Avantages concurrentiels, proposition de valeur unique...',
        defaut: ''
      },
      {
        id: 'strategies_marketing',
        titre: 'Stratégies marketing',
        description: 'Mix marketing et tactiques',
        type: 'checklist',
        obligatoire: true,
        items: [
          'Marketing digital (SEO/SEA)',
          'Content marketing',
          'Social media marketing',
          'Email marketing', 
          'Marketing automation',
          'Partenariats',
          'Events marketing',
          'Influencer marketing'
        ]
      },
      {
        id: 'kpi_mesure',
        titre: 'KPI et mesure',
        description: 'Indicateurs de performance et outils de mesure',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'KPI principaux, outils d\'analyse, reporting, fréquence de mesure...',
        defaut: ''
      },
      {
        id: 'budget_roi',
        titre: 'Budget et ROI',
        description: 'Investment et retour sur investissement attendu',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Budget global, répartition par canal, ROI cible, seuil de rentabilité...',
        defaut: ''
      }
    ]
  },

  [SECTEURS.COMMERCIAL]: {
    nom: 'Commercial',
    icon: '💼',
    couleur: 'red',
    sections: [
      {
        id: 'objectifs_vente',
        titre: 'Objectifs de vente',
        description: 'Targets et quotas commerciaux',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'Chiffre d\'affaires cible, nombre de contrats, croissance visée...',
        defaut: ''
      },
      {
        id: 'prospection',
        titre: 'Stratégie de prospection',
        description: 'Méthodes et canaux de prospection',
        type: 'checklist',
        obligatoire: true,
        items: [
          'Prospection téléphonique',
          'Emailing commercial',
          'Réseaux sociaux (LinkedIn)',
          'Salons et événements',
          'Recommandations/parrainage',
          'Partenariats commerciaux',
          'Publicité digitale',
          'Démarchage terrain'
        ]
      },
      {
        id: 'processus_vente',
        titre: 'Processus de vente',
        description: 'Étapes du cycle de vente',
        type: 'checklist',
        obligatoire: true,
        items: [
          'Qualification du prospect',
          'Découverte des besoins',
          'Présentation de l\'offre',
          'Gestion des objections',
          'Négociation commerciale',
          'Closing / signature',
          'Onboarding client'
        ]
      },
      {
        id: 'outils_support',
        titre: 'Outils et supports',
        description: 'CRM, documentation commerciale, outils de suivi',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'CRM utilisé, plaquettes commerciales, outils de présentation...',
        defaut: ''
      },
      {
        id: 'suivi_reporting',
        titre: 'Suivi et reporting',
        description: 'Métriques et fréquence de reporting',
        type: 'wysiwyg',
        obligatoire: true,
        placeholder: 'KPI suivis, fréquence des points commerciaux, outils de reporting...',
        defaut: ''
      }
    ]
  }
}

// Fonction utilitaire pour créer un nouveau cahier vide basé sur un template
export const createEmptyCahier = (secteur, auteur) => {
  const template = SECTEUR_TEMPLATES[secteur]
  if (!template) return null

  return {
    id: Date.now(),
    titre: '',
    secteur,
    auteurId: auteur.id,
    auteurNom: auteur.nom,
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString(),
    statut: 'BROUILLON',
    priorite: 'NORMALE',
    sections: template.sections.map(section => ({
      ...section,
      statut: STATUTS_SECTION.NON_COMMENCE,
      contenu: section.defaut || '',
      checkedItems: section.type === 'checklist' ? [] : undefined,
      commentaires: [],
      valideur: null,
      dateValidation: null
    })),
    commentairesGlobaux: [],
    historique: [{
      date: new Date().toISOString(),
      action: 'CREATION',
      auteur: auteur.nom,
      details: 'Création du cahier des charges'
    }],
    version: 1,
    tags: []
  }
}

export default SECTEUR_TEMPLATES