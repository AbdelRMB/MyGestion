import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  FileText, 
  Plus, 
  Loader2, 
  Calendar, 
  Euro,
  Eye,
  Edit2,
  Trash2,
  Search,
  Filter
} from 'lucide-react';

import { quotesAPI } from '../../lib/api';

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700', icon: '📝' },
  sent: { label: 'Envoyé', color: 'bg-blue-100 text-blue-700', icon: '📤' },
  accepted: { label: 'Accepté', color: 'bg-green-100 text-green-700', icon: '✅' },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700', icon: '❌' },
  expired: { label: 'Expiré', color: 'bg-orange-100 text-orange-700', icon: '⏰' }
};

export default function QuotesList() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const data = await quotesAPI.getAll();
      setQuotes(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.addToast('Erreur lors du chargement des devis', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const quoteData = {
        title: formData.get('title'),
        client: formData.get('client'),
        status: 'draft',
        createdAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
        number: `DEV-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
        amount: 0
      };
      
      await quotesAPI.create(quoteData);
      setShowCreateModal(false);
      toast.addToast('Devis créé avec succès', { type: 'success' });
      loadQuotes();
    } catch (error) {
      toast.addToast('Erreur lors de la création du devis', { type: 'error' });
    }
  };

  const handleDeleteQuote = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) return;
    
    try {
      await quotesAPI.delete(id);
      toast.addToast('Devis supprimé avec succès', { type: 'success' });
      loadQuotes();
    } catch (error) {
      toast.addToast('Erreur lors de la suppression', { type: 'error' });
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || quote.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Devis
        </h1>
        <p className="text-gray-600">
          Gérez vos devis et propositions commerciales
        </p>
      </div>

      {/* Filtres et actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un devis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtre par statut */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Refusé</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nouveau devis
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Aucun devis trouvé' : 'Aucun devis'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre premier devis'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Créer un devis
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuotes.map((quote) => {
            const status = statusConfig[quote.status];
            const isExpired = new Date(quote.validUntil) < new Date() && quote.status === 'sent';
            
            return (
              <div
                key={quote.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-gray-500">{quote.number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {quote.title}
                    </h3>
                    <p className="text-sm text-gray-600">{quote.client}</p>
                  </div>
                </div>

                {/* Montant */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(quote.amount)}
                  </div>
                  {isExpired && (
                    <div className="text-xs text-red-600 font-medium">
                      ⚠️ Expiré le {formatDate(quote.validUntil)}
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Créé le {formatDate(quote.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Valide jusqu'au {formatDate(quote.validUntil)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Link
                    to={`/quotes/${quote.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Eye className="w-3 h-3" />
                    Voir
                  </Link>
                  <Link
                    to={`/quotes/${quote.id}/edit`}
                    className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Edit2 className="w-3 h-3" />
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDeleteQuote(quote.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Nouveau devis
            </h3>
            <form onSubmit={handleCreateQuote} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du devis *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Développement site web"
                />
              </div>
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <input
                  type="text"
                  id="client"
                  name="client"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Nom de l'entreprise"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}