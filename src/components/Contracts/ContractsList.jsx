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
  Users,
  Clock,
  CheckCircle,
  FileCheck,
  AlertTriangle,
  XCircle
} from 'lucide-react';

const ContractsList = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadContracts();
  }, [currentPage, searchTerm, statusFilter]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      // const response = await contractsAPI.getAll({
      //   page: currentPage,
      //   limit: 10,
      //   search: searchTerm,
      //   status: statusFilter
      // });
      
      // Pour le moment, utilisons des données simulées
      const mockData = {
        contracts: [
          {
            id: 1,
            contract_number: 'CNT-2025-001',
            title: 'Contrat de développement Site Web',
            client_name: 'SARL TechnoServices',
            status: 'active',
            start_date: '2025-01-15',
            end_date: '2025-12-15',
            contract_value: 15000.00,
            contract_type: 'development',
            payment_schedule: 'monthly',
            milestone_count: 4,
            completed_milestones: 2,
            paid_amount: 7500.00,
            created_at: '2025-01-10T10:00:00Z'
          },
          {
            id: 2,
            contract_number: 'CNT-2025-002',
            title: 'Contrat de maintenance Application Mobile',
            client_name: 'Innovate Corp',
            status: 'signed',
            start_date: '2025-02-01',
            end_date: '2026-02-01',
            contract_value: 8000.00,
            contract_type: 'maintenance',
            payment_schedule: 'quarterly',
            milestone_count: 0,
            completed_milestones: 0,
            paid_amount: 0,
            created_at: '2025-01-20T14:30:00Z'
          },
          {
            id: 3,
            contract_number: 'CNT-2025-003',
            title: 'Contrat de conseil Digital',
            client_name: 'StartupXYZ',
            status: 'draft',
            start_date: '2025-03-01',
            end_date: '2025-09-01',
            contract_value: 12000.00,
            contract_type: 'consulting',
            payment_schedule: 'milestone',
            milestone_count: 3,
            completed_milestones: 0,
            paid_amount: 0,
            created_at: '2025-02-01T09:15:00Z'
          }
        ],
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_items: 3,
          items_per_page: 10
        },
        statistics: {
          total: 3,
          draft: 1,
          sent: 0,
          signed: 1,
          active: 1,
          completed: 0,
          expired: 0,
          cancelled: 0,
          total_value: 35000.00,
          active_value: 15000.00
        }
      };
      
      setContracts(mockData.contracts);
      setStatistics(mockData.statistics);
      setTotalPages(mockData.pagination.total_pages);
    } catch (error) {
      toast.addToast('Erreur lors du chargement des contrats', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = async (contractId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) return;
    
    try {
      // await contractsAPI.delete(contractId);
      toast.addToast('Contrat supprimé avec succès', { type: 'success' });
      loadContracts();
    } catch (error) {
      toast.addToast('Erreur lors de la suppression', { type: 'error' });
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700', icon: FileText },
      sent: { label: 'Envoyé', color: 'bg-blue-100 text-blue-700', icon: Clock },
      signed: { label: 'Signé', color: 'bg-purple-100 text-purple-700', icon: FileCheck },
      active: { label: 'Actif', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      completed: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
      expired: { label: 'Expiré', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
      cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700', icon: XCircle }
    };
    return configs[status] || configs.draft;
  };

  const getContractTypeLabel = (type) => {
    const types = {
      service: 'Service',
      development: 'Développement',
      maintenance: 'Maintenance',
      consulting: 'Conseil',
      other: 'Autre'
    };
    return types[type] || type;
  };

  const getPaymentScheduleLabel = (schedule) => {
    const schedules = {
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      annually: 'Annuel',
      milestone: 'Par jalon',
      lump_sum: 'Forfait'
    };
    return schedules[schedule] || schedule;
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

  const isContractExpiringSoon = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const daysUntilExpiry = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contrats</h1>
          <p className="text-gray-600">
            Gérez vos contrats clients et suivez leur statut
          </p>
        </div>
        
        <Link
          to="/contracts/new"
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau Contrat
        </Link>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Contrats</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span className="text-blue-600 font-medium">
                {statistics.active} actifs
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Valeur Totale</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(statistics.total_value)}
                </p>
              </div>
              <Euro className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span className="text-green-600 font-medium">
                {formatCurrency(statistics.active_value)} en cours
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Signés</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.signed}</p>
              </div>
              <FileCheck className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span className="text-gray-600">
                {statistics.draft} brouillons
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Terminés</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span className="text-orange-600 font-medium">
                {statistics.expired} expirés
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par titre, client ou numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyé</option>
              <option value="signed">Signé</option>
              <option value="active">Actif</option>
              <option value="completed">Terminé</option>
              <option value="expired">Expiré</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contrat trouvé</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Aucun contrat ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier contrat.'
            }
          </p>
          {(!searchTerm && statusFilter === 'all') && (
            <Link
              to="/contracts/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Créer un contrat
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contrat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progrès
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contracts.map((contract) => {
                  const statusConfig = getStatusConfig(contract.status);
                  const StatusIcon = statusConfig.icon;
                  const isExpiringSoon = isContractExpiringSoon(contract.end_date);
                  const progressPercent = contract.milestone_count > 0 
                    ? (contract.completed_milestones / contract.milestone_count) * 100 
                    : 0;

                  return (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {contract.contract_number}
                            </span>
                            {isExpiringSoon && (
                              <AlertTriangle className="w-4 h-4 text-orange-500" title="Expire bientôt" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {contract.title}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {contract.client_name}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getContractTypeLabel(contract.contract_type)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span>{formatDate(contract.start_date)}</span>
                          <span className="text-gray-500">au {formatDate(contract.end_date)}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(contract.contract_value)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getPaymentScheduleLabel(contract.payment_schedule)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {contract.milestone_count > 0 ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all" 
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">
                                {Math.round(progressPercent)}%
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {contract.completed_milestones}/{contract.milestone_count} jalons
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Aucun jalon</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/contracts/${contract.id}`}
                            className="text-blue-600 hover:text-blue-700"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/contracts/${contract.id}/edit`}
                            className="text-gray-600 hover:text-gray-700"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteContract(contract.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> sur{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractsList;