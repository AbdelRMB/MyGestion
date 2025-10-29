// Types de données pour le système de cahiers des charges professionnel

export const ROLES = {
  ADMIN: 'ADMIN',
  UTILISATEUR: 'UTILISATEUR', 
  CHEF_POLE: 'CHEF_POLE'
}

export const SECTEURS = {
  DEVELOPPEMENT: 'DEVELOPPEMENT',
  RH: 'RH', 
  COMMUNICATION: 'COMMUNICATION',
  MARKETING: 'MARKETING',
  COMMERCIAL: 'COMMERCIAL',
  FINANCE: 'FINANCE',
  JURIDIQUE: 'JURIDIQUE'
}

export const STATUTS_SECTION = {
  NON_COMMENCE: 'NON_COMMENCE',
  EN_COURS: 'EN_COURS', 
  A_VALIDER: 'A_VALIDER',
  VALIDEE: 'VALIDEE',
  REFUSEE: 'REFUSEE'
}

export const STATUTS_CAHIER = {
  BROUILLON: 'BROUILLON',
  EN_COURS: 'EN_COURS',
  EN_ATTENTE_VALIDATION: 'EN_ATTENTE_VALIDATION', 
  VALIDE: 'VALIDE',
  ARCHIVE: 'ARCHIVE'
}

export const PRIORITES = {
  BASSE: 'BASSE',
  NORMALE: 'NORMALE',
  HAUTE: 'HAUTE',
  CRITIQUE: 'CRITIQUE'
}

// Labels pour l'interface
export const LABELS = {
  ROLES: {
    [ROLES.ADMIN]: 'Administrateur',
    [ROLES.UTILISATEUR]: 'Utilisateur',
    [ROLES.CHEF_POLE]: 'Chef de pôle'
  },
  SECTEURS: {
    [SECTEURS.DEVELOPPEMENT]: 'Développement',
    [SECTEURS.RH]: 'Ressources Humaines',
    [SECTEURS.COMMUNICATION]: 'Communication',
    [SECTEURS.MARKETING]: 'Marketing',
    [SECTEURS.COMMERCIAL]: 'Commercial',
    [SECTEURS.FINANCE]: 'Finance',
    [SECTEURS.JURIDIQUE]: 'Juridique'
  },
  STATUTS_SECTION: {
    [STATUTS_SECTION.NON_COMMENCE]: 'Non commencé',
    [STATUTS_SECTION.EN_COURS]: 'En cours',
    [STATUTS_SECTION.A_VALIDER]: 'À valider',
    [STATUTS_SECTION.VALIDEE]: 'Validée',
    [STATUTS_SECTION.REFUSEE]: 'Refusée'
  },
  STATUTS_CAHIER: {
    [STATUTS_CAHIER.BROUILLON]: 'Brouillon',
    [STATUTS_CAHIER.EN_COURS]: 'En cours',
    [STATUTS_CAHIER.EN_ATTENTE_VALIDATION]: 'En attente de validation',
    [STATUTS_CAHIER.VALIDE]: 'Validé',
    [STATUTS_CAHIER.ARCHIVE]: 'Archivé'
  },
  PRIORITES: {
    [PRIORITES.BASSE]: 'Basse',
    [PRIORITES.NORMALE]: 'Normale', 
    [PRIORITES.HAUTE]: 'Haute',
    [PRIORITES.CRITIQUE]: 'Critique'
  }
}

// Couleurs pour les statuts
export const COULEURS_STATUTS = {
  [STATUTS_SECTION.NON_COMMENCE]: 'text-gray-500 bg-gray-100',
  [STATUTS_SECTION.EN_COURS]: 'text-blue-700 bg-blue-100',
  [STATUTS_SECTION.A_VALIDER]: 'text-orange-700 bg-orange-100',
  [STATUTS_SECTION.VALIDEE]: 'text-green-700 bg-green-100',
  [STATUTS_SECTION.REFUSEE]: 'text-red-700 bg-red-100'
}

export const COULEURS_PRIORITES = {
  [PRIORITES.BASSE]: 'text-gray-600 bg-gray-100',
  [PRIORITES.NORMALE]: 'text-blue-600 bg-blue-100',
  [PRIORITES.HAUTE]: 'text-orange-600 bg-orange-100',
  [PRIORITES.CRITIQUE]: 'text-red-600 bg-red-100'
}