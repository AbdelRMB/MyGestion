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
  Filter,
  DollarSign,
  AlertCircle
} from 'lucide-react';

import { invoicesAPI } from '../../lib/api';

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700', icon: '📝' },
  sent: { label: 'Envoyé', color: 'bg-blue-100 text-blue-700', icon: '📤' },
  paid: { label: 'Payé', color: 'bg-green-100 text-green-700', icon: '✅' },
  overdue: { label: 'En retard', color: 'bg-red-100 text-red-700', icon: '⚠️' },
  cancelled: { label: 'Annulé', color: 'bg-orange-100 text-orange-700', icon: '❌' }
};

export default function InvoicesList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({});

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    loadInvoices();
  }, [searchTerm, statusFilter]);

  const loadInvoices = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      };
      
      const data = await invoicesAPI.getAll(params);
      setInvoices(data.invoices);
      setPagination(data.pagination);
    } catch (error) {
      toast.addToast('Erreur lors du chargement des factures', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const newInvoice = await invoicesAPI.create({
        title: 'Nouvelle facture',
        client: 'Client',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentTerms: 30,
        notes: ''
      });
      
      toast.addToast('Facture créée avec succès', { type: 'success' });
      loadInvoices();
    } catch (error) {
      toast.addToast('Erreur lors de la création de la facture', { type: 'error' });
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        await invoicesAPI.delete(invoiceId);
        toast.addToast('Facture supprimée avec succès', { type: 'success' });
        loadInvoices();
      } catch (error) {
        toast.addToast('Erreur lors de la suppression', { type: 'error' });
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const isOverdue = (invoice) => {
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    return invoice.status !== 'paid' && invoice.status !== 'cancelled' && dueDate < today;
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Factures</h1>
            <p className="text-gray-600">Gestion de vos factures et paiements</p>
          </div>
          <button
            onClick={handleCreateInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total factures</p>
                <p className="text-lg font-semibold">{filteredInvoices.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Payées</p>
                <p className="text-lg font-semibold">
                  {filteredInvoices.filter(i => i.status === 'paid').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-lg font-semibold">
                  {filteredInvoices.filter(i => i.status === 'sent').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En retard</p>
                <p className="text-lg font-semibold">
                  {filteredInvoices.filter(isOverdue).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyé</option>
              <option value="paid">Payé</option>
              <option value="overdue">En retard</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture</h3>
            <p className="text-gray-600">Créez votre première facture pour commencer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'échéance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{invoice.number}</div>
                        <div className="text-sm text-gray-600">{invoice.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{invoice.client}</div>
                        {invoice.clientEmail && (
                          <div className="text-sm text-gray-600">{invoice.clientEmail}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        isOverdue(invoice) ? 'bg-red-100 text-red-700' : statusConfig[invoice.status]?.color
                      }`}>
                        {isOverdue(invoice) ? '⚠️ En retard' : `${statusConfig[invoice.status]?.icon} ${statusConfig[invoice.status]?.label}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(invoice.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{formatCurrency(invoice.total)}</div>
                        {invoice.paidAmount > 0 && (
                          <div className="text-sm text-green-600">
                            Payé: {formatCurrency(invoice.paidAmount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </Link>
                      {invoice.status === 'draft' && (
                        <>
                          <Link
                            to={`/invoices/${invoice.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Affichage de {((pagination.currentPage - 1) * 10) + 1} à {Math.min(pagination.currentPage * 10, pagination.totalCount)} sur {pagination.totalCount} factures
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadInvoices(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {pagination.currentPage} sur {pagination.totalPages}
            </span>
            <button
              onClick={() => loadInvoices(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}