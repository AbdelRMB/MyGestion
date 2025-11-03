import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { contractsAPI } from '../../lib/api';
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Download,
  Calendar,
  User,
  Building2,
  Mail,
  Phone,
  Edit2,
  X,
  Check,
  FileCheck,
  Clock,
  AlertTriangle,
  Euro,
  Users,
  FileText,
  CheckCircle
} from 'lucide-react';

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContract();
  }, [id]);

  const loadContract = async () => {
    try {
      setLoading(true);
      
      if (id === 'new') {
        // Nouveau contrat
        setContract({
          id: null,
          contract_number: 'Nouveau contrat',
          title: '',
          client_name: '',
          client_email: '',
          client_phone: '',
          client_address: '',
          status: 'draft',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          contract_value: 0,
          contract_type: 'service',
          payment_schedule: 'lump_sum',
          auto_renew: false,
          renewal_period: 12,
          termination_notice: 30,
          notes: '',
          terms_and_conditions: '',
          clauses: [],
          milestones: []
        });
        setEditMode(true);
      } else {
        // Charger un contrat existant
        const contractData = await contractsAPI.getById(id);
        setContract(contractData);
      }
    } catch (error) {
      toast.addToast('Erreur lors du chargement du contrat', { type: 'error' });
      navigate('/contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (contract.id) {
        // Mise à jour
        await contractsAPI.update(contract.id, contract);
        toast.addToast('Contrat mis à jour avec succès', { type: 'success' });
      } else {
        // Création
        const newContract = await contractsAPI.create(contract);
        toast.addToast('Contrat créé avec succès', { type: 'success' });
        navigate(`/contracts/${newContract.id}`);
      }
      
      setEditMode(false);
    } catch (error) {
      toast.addToast('Erreur lors de la sauvegarde', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await contractsAPI.updateStatus(contract.id, newStatus);
      setContract(prev => ({ ...prev, status: newStatus }));
      toast.addToast('Statut mis à jour avec succès', { type: 'success' });
    } catch (error) {
      toast.addToast('Erreur lors de la mise à jour du statut', { type: 'error' });
    }
  };

  const handleMilestoneUpdate = async (milestoneId, updates) => {
    try {
      await contractsAPI.updateMilestone(contract.id, milestoneId, updates);
      setContract(prev => ({
        ...prev,
        milestones: prev.milestones.map(m => 
          m.id === milestoneId ? { ...m, ...updates } : m
        )
      }));
      toast.addToast('Jalon mis à jour avec succès', { type: 'success' });
    } catch (error) {
      toast.addToast('Erreur lors de la mise à jour du jalon', { type: 'error' });
    }
  };

  const addClause = () => {
    const newClause = {
      id: Date.now(),
      clause_title: '',
      clause_content: '',
      clause_type: 'general',
      is_mandatory: false,
      position: contract.clauses.length
    };
    setContract(prev => ({
      ...prev,
      clauses: [...prev.clauses, newClause]
    }));
  };

  const addMilestone = () => {
    const newMilestone = {
      id: Date.now(),
      milestone_title: '',
      milestone_description: '',
      due_date: '',
      amount: 0,
      status: 'pending',
      position: contract.milestones.length
    };
    setContract(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
  };

  const removeClause = (index) => {
    setContract(prev => ({
      ...prev,
      clauses: prev.clauses.filter((_, i) => i !== index)
    }));
  };

  const removeMilestone = (index) => {
    setContract(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700', icon: FileText },
      sent: { label: 'Envoyé', color: 'bg-blue-100 text-blue-700', icon: Clock },
      signed: { label: 'Signé', color: 'bg-purple-100 text-purple-700', icon: FileCheck },
      active: { label: 'Actif', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      completed: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
      expired: { label: 'Expiré', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
      cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700', icon: X }
    };
    return configs[status] || configs.draft;
  };

  const getMilestoneStatusConfig = (status) => {
    const configs = {
      pending: { label: 'En attente', color: 'bg-gray-100 text-gray-700', icon: Clock },
      completed: { label: 'Terminé', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      paid: { label: 'Payé', color: 'bg-blue-100 text-blue-700', icon: Euro },
      overdue: { label: 'En retard', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
    };
    return configs[status] || configs.pending;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Contrat non trouvé</p>
      </div>
    );
  }

  const statusConfig = getStatusConfig(contract.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contracts')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {contract.contract_number}
            </h1>
            <p className="text-gray-600">{contract.title}</p>
          </div>
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
            <StatusIcon className="w-4 h-4" />
            {statusConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>

              {/* Actions basées sur le statut */}
              {contract.status === 'draft' && (
                <button
                  onClick={() => handleStatusUpdate('sent')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              )}

              {contract.status === 'sent' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('signed')}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FileCheck className="w-4 h-4" />
                    Marquer Signé
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('cancelled')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </button>
                </>
              )}

              {contract.status === 'signed' && (
                <button
                  onClick={() => handleStatusUpdate('active')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Activer
                </button>
              )}

              {(contract.status === 'active' || contract.status === 'signed') && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Terminer
                </button>
              )}

              <button
                // onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du contrat
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={contract.title}
                    onChange={(e) => setContract(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{contract.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de contrat
                </label>
                {editMode ? (
                  <select
                    value={contract.contract_type}
                    onChange={(e) => setContract(prev => ({ ...prev, contract_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="service">Service</option>
                    <option value="development">Développement</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="consulting">Conseil</option>
                    <option value="other">Autre</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{contract.contract_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                {editMode ? (
                  <input
                    type="date"
                    value={contract.start_date}
                    onChange={(e) => setContract(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{formatDate(contract.start_date)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                {editMode ? (
                  <input
                    type="date"
                    value={contract.end_date}
                    onChange={(e) => setContract(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{formatDate(contract.end_date)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur du contrat
                </label>
                {editMode ? (
                  <input
                    type="number"
                    step="0.01"
                    value={contract.contract_value}
                    onChange={(e) => setContract(prev => ({ ...prev, contract_value: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formatCurrency(contract.contract_value)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode de paiement
                </label>
                {editMode ? (
                  <select
                    value={contract.payment_schedule}
                    onChange={(e) => setContract(prev => ({ ...prev, payment_schedule: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="lump_sum">Forfait</option>
                    <option value="monthly">Mensuel</option>
                    <option value="quarterly">Trimestriel</option>
                    <option value="annually">Annuel</option>
                    <option value="milestone">Par jalon</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{contract.payment_schedule}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              {editMode ? (
                <textarea
                  rows={3}
                  value={contract.notes}
                  onChange={(e) => setContract(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{contract.notes}</p>
              )}
            </div>
          </div>

          {/* Clauses du contrat */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Clauses contractuelles</h2>
              {editMode && (
                <button
                  onClick={addClause}
                  className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une clause
                </button>
              )}
            </div>

            <div className="space-y-4">
              {contract.clauses.map((clause, index) => (
                <div key={clause.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    {editMode ? (
                      <input
                        type="text"
                        value={clause.clause_title}
                        onChange={(e) => {
                          const updatedClauses = [...contract.clauses];
                          updatedClauses[index].clause_title = e.target.value;
                          setContract(prev => ({ ...prev, clauses: updatedClauses }));
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Titre de la clause"
                      />
                    ) : (
                      <h3 className="font-medium text-gray-900">{clause.clause_title}</h3>
                    )}
                    
                    {editMode && (
                      <button
                        onClick={() => removeClause(index)}
                        className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {editMode ? (
                    <textarea
                      rows={3}
                      value={clause.clause_content}
                      onChange={(e) => {
                        const updatedClauses = [...contract.clauses];
                        updatedClauses[index].clause_content = e.target.value;
                        setContract(prev => ({ ...prev, clauses: updatedClauses }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contenu de la clause"
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">{clause.clause_content}</p>
                  )}

                  {clause.is_mandatory && (
                    <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      Clause obligatoire
                    </span>
                  )}
                </div>
              ))}

              {contract.clauses.length === 0 && (
                <p className="text-gray-500 text-center py-4">Aucune clause définie</p>
              )}
            </div>
          </div>

          {/* Jalons (si mode paiement par jalons) */}
          {contract.payment_schedule === 'milestone' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Jalons de paiement</h2>
                {editMode && (
                  <button
                    onClick={addMilestone}
                    className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un jalon
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {contract.milestones.map((milestone, index) => {
                  const milestoneStatusConfig = getMilestoneStatusConfig(milestone.status);
                  const MilestoneStatusIcon = milestoneStatusConfig.icon;

                  return (
                    <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {editMode ? (
                            <input
                              type="text"
                              value={milestone.milestone_title}
                              onChange={(e) => {
                                const updatedMilestones = [...contract.milestones];
                                updatedMilestones[index].milestone_title = e.target.value;
                                setContract(prev => ({ ...prev, milestones: updatedMilestones }));
                              }}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Titre du jalon"
                            />
                          ) : (
                            <h3 className="font-medium text-gray-900">{milestone.milestone_title}</h3>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${milestoneStatusConfig.color}`}>
                            <MilestoneStatusIcon className="w-3 h-3" />
                            {milestoneStatusConfig.label}
                          </span>
                          
                          {editMode && (
                            <button
                              onClick={() => removeMilestone(index)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Date d'échéance
                          </label>
                          {editMode ? (
                            <input
                              type="date"
                              value={milestone.due_date}
                              onChange={(e) => {
                                const updatedMilestones = [...contract.milestones];
                                updatedMilestones[index].due_date = e.target.value;
                                setContract(prev => ({ ...prev, milestones: updatedMilestones }));
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">{formatDate(milestone.due_date)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Montant
                          </label>
                          {editMode ? (
                            <input
                              type="number"
                              step="0.01"
                              value={milestone.amount}
                              onChange={(e) => {
                                const updatedMilestones = [...contract.milestones];
                                updatedMilestones[index].amount = parseFloat(e.target.value) || 0;
                                setContract(prev => ({ ...prev, milestones: updatedMilestones }));
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{formatCurrency(milestone.amount)}</p>
                          )}
                        </div>

                        <div>
                          {!editMode && milestone.status !== 'pending' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Actions
                              </label>
                              <div className="flex gap-2">
                                {milestone.status === 'completed' && (
                                  <button
                                    onClick={() => handleMilestoneUpdate(milestone.id, { 
                                      status: 'paid', 
                                      payment_date: new Date().toISOString().split('T')[0] 
                                    })}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
                                  >
                                    Marquer payé
                                  </button>
                                )}
                                {milestone.status === 'pending' && (
                                  <button
                                    onClick={() => handleMilestoneUpdate(milestone.id, { 
                                      status: 'completed', 
                                      completion_date: new Date().toISOString().split('T')[0] 
                                    })}
                                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors"
                                  >
                                    Marquer terminé
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {milestone.milestone_description && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Description
                          </label>
                          {editMode ? (
                            <textarea
                              rows={2}
                              value={milestone.milestone_description}
                              onChange={(e) => {
                                const updatedMilestones = [...contract.milestones];
                                updatedMilestones[index].milestone_description = e.target.value;
                                setContract(prev => ({ ...prev, milestones: updatedMilestones }));
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Description du jalon"
                            />
                          ) : (
                            <p className="text-sm text-gray-700">{milestone.milestone_description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {contract.milestones.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Aucun jalon défini</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations client */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Informations client
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Nom du client
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={contract.client_name}
                    onChange={(e) => setContract(prev => ({ ...prev, client_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{contract.client_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={contract.client_email}
                    onChange={(e) => setContract(prev => ({ ...prev, client_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{contract.client_email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Téléphone
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={contract.client_phone}
                    onChange={(e) => setContract(prev => ({ ...prev, client_phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{contract.client_phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                {editMode ? (
                  <textarea
                    rows={3}
                    value={contract.client_address}
                    onChange={(e) => setContract(prev => ({ ...prev, client_address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{contract.client_address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Résumé financier */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Euro className="w-5 h-5" />
              Résumé financier
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valeur totale:</span>
                <span className="font-medium">{formatCurrency(contract.contract_value)}</span>
              </div>
              
              {contract.milestones.length > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Montant payé:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(
                        contract.milestones
                          .filter(m => m.status === 'paid')
                          .reduce((sum, m) => sum + (m.amount || 0), 0)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Solde restant:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        contract.contract_value - contract.milestones
                          .filter(m => m.status === 'paid')
                          .reduce((sum, m) => sum + (m.amount || 0), 0)
                      )}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Progression:</span>
                      <span className="font-medium">
                        {contract.milestones.filter(m => m.status === 'completed' || m.status === 'paid').length} / {contract.milestones.length} jalons
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${contract.milestones.length > 0 
                            ? (contract.milestones.filter(m => m.status === 'completed' || m.status === 'paid').length / contract.milestones.length) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dates importantes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Dates importantes
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Début:</span>
                <span className="font-medium">{formatDate(contract.start_date)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fin:</span>
                <span className="font-medium">{formatDate(contract.end_date)}</span>
              </div>
              
              {contract.signature_date && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Signature:</span>
                  <span className="font-medium text-green-600">{formatDate(contract.signature_date)}</span>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Renouvellement auto:</span>
                  <span className="font-medium">
                    {contract.auto_renew ? `Oui (${contract.renewal_period} mois)` : 'Non'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Préavis résiliation:</span>
                  <span className="font-medium">{contract.termination_notice} jours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetail;