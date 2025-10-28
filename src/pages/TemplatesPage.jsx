import React from 'react'
import { useNavigate } from 'react-router-dom'

const templates = [
  {
    id: 1,
    nom: "Application Web",
    description: "Template pour le développement d'une application web moderne",
    icon: "🌐",
    couleur: "blue",
    template: {
      titre: "Développement Application Web - [Nom du Projet]",
      description: "Création d'une application web responsive et moderne répondant aux besoins spécifiques de l'entreprise.",
      objectifs: "• Développer une interface utilisateur intuitive\n• Assurer une compatibilité multi-navigateurs\n• Optimiser les performances et la sécurité\n• Faciliter la maintenance et les évolutions futures",
      perimetre: "Inclus :\n• Interface utilisateur responsive\n• Backend API REST\n• Base de données\n• Tests unitaires\n• Documentation\n\nExclus :\n• Applications mobiles natives\n• Intégrations tierces complexes\n• Formation utilisateur",
      contraintes: "• Compatible navigateurs modernes (Chrome, Firefox, Safari, Edge)\n• Temps de chargement < 3 secondes\n• Respect des standards RGPD\n• Budget limité",
      livrables: "• Code source complet\n• Documentation technique\n• Guide d'installation\n• Tests de validation\n• Manuel utilisateur",
      calendrier: [
        { etape: 'Analyse et conception', date: '' },
        { etape: 'Maquettage UI/UX', date: '' },
        { etape: 'Développement backend', date: '' },
        { etape: 'Développement frontend', date: '' },
        { etape: 'Tests et débogage', date: '' },
        { etape: 'Déploiement', date: '' }
      ],
      budget: "À définir selon périmètre",
      partiesPrenantes: "Product Owner, Équipe développement, Designer UX/UI, Testeurs"
    }
  },
  {
    id: 2,
    nom: "Application Mobile",
    description: "Template pour le développement d'applications mobiles natives ou hybrides",
    icon: "📱",
    couleur: "green",
    template: {
      titre: "Développement Application Mobile - [Nom du Projet]",
      description: "Création d'une application mobile native/hybride offrant une expérience utilisateur optimale sur smartphones et tablettes.",
      objectifs: "• Développer une app mobile performante\n• Assurer une expérience utilisateur fluide\n• Optimiser pour iOS et Android\n• Intégrer les fonctionnalités natives du device",
      perimetre: "Inclus :\n• Application iOS et Android\n• Interface utilisateur adaptative\n• API backend si nécessaire\n• Publication sur stores\n• Tests sur devices réels\n\nExclus :\n• Versions web\n• Maintenance post-lancement prolongée\n• Marketing et promotion",
      contraintes: "• Compatible iOS 14+ et Android 8+\n• Taille APK/IPA optimisée\n• Respect des guidelines Apple/Google\n• Performance sur devices anciens",
      livrables: "• Applications iOS et Android\n• Code source\n• Documentation technique\n• Fichiers de publication stores\n• Guide d'utilisation",
      calendrier: [
        { etape: 'Analyse et conception', date: '' },
        { etape: 'Design UI/UX mobile', date: '' },
        { etape: 'Développement core', date: '' },
        { etape: 'Intégrations natives', date: '' },
        { etape: 'Tests multi-devices', date: '' },
        { etape: 'Publication stores', date: '' }
      ],
      budget: "À définir selon complexité",
      partiesPrenantes: "Product Owner, Développeurs mobile, Designer mobile, Testeurs QA"
    }
  },
  {
    id: 3,
    nom: "Site E-commerce",
    description: "Template pour la création d'une boutique en ligne complète",
    icon: "🛒",
    couleur: "purple",
    template: {
      titre: "Création Site E-commerce - [Nom de la Boutique]",
      description: "Développement d'une plateforme e-commerce complète permettant la vente en ligne avec gestion des commandes, paiements et livraisons.",
      objectifs: "• Créer une boutique en ligne professionnelle\n• Faciliter le processus d'achat\n• Gérer les stocks et commandes\n• Optimiser les conversions\n• Assurer la sécurité des transactions",
      perimetre: "Inclus :\n• Catalogue produits avec recherche\n• Panier et processus de commande\n• Système de paiement sécurisé\n• Gestion des utilisateurs\n• Panel d'administration\n• Responsive design\n\nExclus :\n• Logistique et expédition physique\n• Content marketing\n• Référencement SEO avancé",
      contraintes: "• Conformité PCI-DSS pour paiements\n• Respect RGPD\n• Temps de chargement optimisé\n• Compatible tous navigateurs\n• Scalabilité pour forte charge",
      livrables: "• Site e-commerce complet\n• Panel d'administration\n• Documentation utilisateur/admin\n• Formation équipe\n• Support post-lancement (1 mois)",
      calendrier: [
        { etape: 'Analyse besoins e-commerce', date: '' },
        { etape: 'Architecture et design', date: '' },
        { etape: 'Développement catalogue', date: '' },
        { etape: 'Intégration paiements', date: '' },
        { etape: 'Tests et sécurisation', date: '' },
        { etape: 'Mise en production', date: '' }
      ],
      budget: "À définir selon fonctionnalités",
      partiesPrenantes: "Directeur commercial, Équipe technique, Designer, Responsable logistique"
    }
  },
  {
    id: 4,
    nom: "Système de Gestion",
    description: "Template pour un logiciel de gestion métier (CRM, ERP, etc.)",
    icon: "📊",
    couleur: "orange",
    template: {
      titre: "Développement Système de Gestion - [Type/Nom]",
      description: "Création d'un système de gestion métier personnalisé pour optimiser les processus internes et améliorer la productivité.",
      objectifs: "• Digitaliser les processus métier\n• Centraliser les données\n• Améliorer la collaboration\n• Générer des rapports et analyses\n• Automatiser les tâches répétitives",
      perimetre: "Inclus :\n• Interface de gestion multi-utilisateurs\n• Base de données centralisée\n• Système de droits et permissions\n• Rapports et tableaux de bord\n• API pour intégrations\n• Formation utilisateurs\n\nExclus :\n• Migration de données legacy\n• Intégrations systèmes tiers complexes\n• Maintenance évolutive long terme",
      contraintes: "• Multi-utilisateurs simultanés\n• Sauvegarde automatique des données\n• Interface intuitive\n• Performance élevée\n• Sécurité des accès",
      livrables: "• Application de gestion complète\n• Documentation fonctionnelle\n• Guide administrateur\n• Formation équipe\n• Scripts de déploiement",
      calendrier: [
        { etape: 'Analyse processus métier', date: '' },
        { etape: 'Conception architecture', date: '' },
        { etape: 'Développement modules core', date: '' },
        { etape: 'Développement interfaces', date: '' },
        { etape: 'Tests et validation métier', date: '' },
        { etape: 'Déploiement et formation', date: '' }
      ],
      budget: "À définir selon modules",
      partiesPrenantes: "Direction métier, Utilisateurs finaux, Équipe IT, Formateur"
    }
  }
]

const TemplatesPage = () => {
  const navigate = useNavigate()

  const useTemplate = (template) => {
    // Sauvegarder le template dans le sessionStorage pour le récupérer dans la page de création
    sessionStorage.setItem('templateToLoad', JSON.stringify(template))
    navigate('/creer-cahier')
  }

  const getColorClasses = (couleur) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800'
    }
    return colors[couleur] || colors.blue
  }

  const getButtonColorClasses = (couleur) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      green: 'bg-green-600 hover:bg-green-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      orange: 'bg-orange-600 hover:bg-orange-700'
    }
    return colors[couleur] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Templates de cahiers des charges</h1>
          <p className="text-gray-600">
            Utilisez ces modèles prédéfinis pour créer rapidement vos cahiers des charges selon le type de projet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${getColorClasses(template.couleur)}`}>
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {template.nom}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Inclut :</span>
                    <ul className="mt-1 text-gray-600 space-y-1">
                      <li>• Structure complète pré-remplie</li>
                      <li>• Étapes de calendrier adaptées</li>
                      <li>• Exemples de livrables</li>
                      <li>• Parties prenantes types</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Template prêt à utiliser
                  </div>
                  <button
                    onClick={() => useTemplate(template.template)}
                    className={`px-6 py-2 text-white rounded-md font-medium transition-colors ${getButtonColorClasses(template.couleur)}`}
                  >
                    Utiliser ce template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section informative */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comment utiliser un template ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Choisissez</h3>
              <p className="text-sm text-gray-600">
                Sélectionnez le template qui correspond le mieux à votre type de projet.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personnalisez</h3>
              <p className="text-sm text-gray-600">
                Modifiez les champs pré-remplis selon vos besoins spécifiques.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sauvegardez</h3>
              <p className="text-sm text-gray-600">
                Enregistrez votre cahier des charges personnalisé et exportez-le.
              </p>
            </div>
          </div>
        </div>

        {/* Suggestion de création personnalisée */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Besoin d'un cahier personnalisé ?
              </h3>
              <p className="text-gray-600">
                Créez votre cahier des charges from scratch avec tous les champs vides.
              </p>
            </div>
            <button
              onClick={() => navigate('/creer-cahier')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Créer from scratch
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplatesPage