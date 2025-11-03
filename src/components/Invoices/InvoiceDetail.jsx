import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { invoicesAPI } from '../../lib/api';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Download,
  Calculator,
  Calendar,
  User,
  Building2,
  Mail,
  Phone,
  Edit2,
  X,
  Check,
  XCircle,
  FileText,
  FileCheck,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF.jsx';

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700', icon: '📝' },
  sent: { label: 'Envoyé', color: 'bg-blue-100 text-blue-700', icon: '📤' },
  paid: { label: 'Payé', color: 'bg-green-100 text-green-700', icon: '✅' },
  overdue: { label: 'En retard', color: 'bg-red-100 text-red-700', icon: '⚠️' },
  cancelled: { label: 'Annulé', color: 'bg-orange-100 text-orange-700', icon: '❌' }
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const data = await invoicesAPI.getById(id);
      setInvoice(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.addToast('Erreur lors du chargement de la facture', { type: 'error' });
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await invoicesAPI.update(invoice.id, invoice);
      toast.addToast('Facture sauvegardée avec succès', { type: 'success' });
      loadInvoice();
    } catch (error) {
      toast.addToast('Erreur lors de la sauvegarde', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendByEmail = async () => {
    try {
      // Simulation de l'envoi par email
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.addToast('Facture envoyée par email', { type: 'success' });
    } catch (error) {
      toast.addToast('Erreur lors de l\'envoi', { type: 'error' });
    }
  };

  const exportToPDF = async () => {
    try {
      const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture-${invoice.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.addToast('PDF généré avec succès', { type: 'success' });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.addToast('Erreur lors de la génération du PDF', { type: 'error' });
    }
  };

  const handleMarkAsSent = async () => {
    try {
      await invoicesAPI.updateStatus(invoice.id, 'sent');
      setInvoice(prev => ({ ...prev, status: 'sent' }));
      toast.addToast('Facture marquée comme envoyée', { type: 'success' });
    } catch (error) {
      toast.addToast('Erreur lors de la mise à jour du statut', { type: 'error' });
    }
  };

  const handleMarkAsCancelled = async () => {
    try {
      await invoicesAPI.updateStatus(invoice.id, 'cancelled');
      setInvoice(prev => ({ ...prev, status: 'cancelled' }));
      toast.addToast('Facture marquée comme annulée', { type: 'success' });
    } catch (error) {
      toast.addToast('Erreur lors de la mise à jour du statut', { type: 'error' });
    }
  };

  const handleRecordPayment = async () => {
    try {
      await invoicesAPI.recordPayment(invoice.id, {
        paidAmount: parseFloat(paymentAmount),
        paymentDate: paymentDate
      });
      
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      loadInvoice();
      toast.addToast('Paiement enregistré avec succès', { type: 'success' });
    } catch (error) {
      toast.addToast('Erreur lors de l\'enregistrement du paiement', { type: 'error' });
    }
  };

  const handleSaveAsDraft = async () => {
    await handleSave();
    setEditMode(false);
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (itemId, field, value) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
    recalculateTotal();
  };

  const removeItem = (itemId) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    recalculateTotal();
  };

  const recalculateTotal = () => {
    setTimeout(() => {
      setInvoice(prev => {
        const subtotal = prev.items.reduce((sum, item) => sum + (item.total || 0), 0);
        const discount = prev.discount || 0;
        const tax = prev.tax || 0;
        const total = subtotal - discount + tax;

        return {
          ...prev,
          subtotal,
          total
        };
      });
    }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const isOverdue = () => {
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    return invoice.status !== 'paid' && invoice.status !== 'cancelled' && dueDate < today;
  };

  if (loading || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/invoices')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors hover:bg-gray-100 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {invoice.number}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isOverdue() ? 'bg-red-100 text-red-700' : statusConfig[invoice.status]?.color
                }`}>
                  {isOverdue() ? '⚠️ En retard' : `${statusConfig[invoice.status]?.icon} ${statusConfig[invoice.status]?.label}`}
                </span>
              </div>
              <p className="text-gray-600">{invoice.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={handleSaveAsDraft}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </>
            ) : (
              <>
                {/* Workflow basé sur le statut */}
                {invoice.status === 'draft' && (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={handleMarkAsSent}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FileCheck className="w-4 h-4" />
                      Finaliser et Envoyer
                    </button>
                  </>
                )}

                {(invoice.status === 'sent' || isOverdue()) && (
                  <>
                    <button 
                      onClick={exportToPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger PDF
                    </button>
                    <button
                      onClick={handleSendByEmail}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Envoyer par Email
                    </button>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      Enregistrer Paiement
                    </button>
                    <button
                      onClick={handleMarkAsCancelled}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Annuler
                    </button>
                  </>
                )}

                {(invoice.status === 'paid' || invoice.status === 'cancelled') && (
                  <button 
                    onClick={exportToPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Messages d'aide basés sur le statut */}
        {invoice.status === 'draft' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Brouillon :</strong> Vous pouvez modifier cette facture. Cliquez sur "Finaliser et Envoyer" quand vous êtes prêt.
            </p>
          </div>
        )}

        {invoice.status === 'sent' && !isOverdue() && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-700">
              <strong>Envoyée :</strong> La facture a été finalisée et envoyée. Vous pouvez enregistrer les paiements reçus.
            </p>
          </div>
        )}

        {isOverdue() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              <strong>En retard :</strong> Cette facture a dépassé sa date d'échéance ({formatDate(invoice.dueDate)}). Contactez le client.
            </p>
          </div>
        )}

        {invoice.status === 'paid' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">
              <strong>Payée :</strong> Cette facture a été entièrement payée le {invoice.paymentDate ? formatDate(invoice.paymentDate) : 'N/A'}. Félicitations !
            </p>
          </div>
        )}

        {invoice.status === 'cancelled' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700">
              <strong>Annulée :</strong> Cette facture a été annulée.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations client */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informations client
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du client
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={invoice.client}
                    onChange={(e) => setInvoice(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{invoice.client}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={invoice.clientEmail || ''}
                    onChange={(e) => setInvoice(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {invoice.clientEmail || 'Non renseigné'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={invoice.clientPhone || ''}
                    onChange={(e) => setInvoice(prev => ({ ...prev, clientPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {invoice.clientPhone || 'Non renseigné'}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                {editMode ? (
                  <textarea
                    value={invoice.clientAddress || ''}
                    onChange={(e) => setInvoice(prev => ({ ...prev, clientAddress: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {invoice.clientAddress || 'Non renseignée'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Détails de la facture */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Détails de la facture
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'émission
                </label>
                {editMode ? (
                  <input
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(invoice.issueDate)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'échéance
                </label>
                {editMode ? (
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(invoice.dueDate)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conditions de paiement
                </label>
                {editMode ? (
                  <input
                    type="number"
                    value={invoice.paymentTerms}
                    onChange={(e) => setInvoice(prev => ({ ...prev, paymentTerms: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{invoice.paymentTerms} jours</p>
                )}
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                {editMode ? (
                  <textarea
                    value={invoice.notes || ''}
                    onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{invoice.notes}</p>
                )}
              </div>
            )}
          </div>

          {/* Lignes de la facture */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Lignes de facturation</h2>
              {editMode && (
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une ligne
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Description</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-700 w-24">Quantité</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-700 w-32">Prix unitaire</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-700 w-32">Total</th>
                    {editMode && <th className="w-12"></th>}
                  </tr>
                </thead>
                <tbody>
                  {invoice.items && invoice.items.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-gray-100">
                      <td className="py-3 px-3">
                        {editMode ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Description du service ou produit"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{item.description}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {editMode ? (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-center"
                            step="0.01"
                            min="0"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{item.quantity}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {editMode ? (
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-right"
                            step="0.01"
                            min="0"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{formatCurrency(item.unitPrice)}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.total)}
                        </span>
                      </td>
                      {editMode && (
                        <td className="py-3 px-3">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Résumé financier */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Résumé
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remise</span>
                  <span className="font-medium text-red-600">-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA</span>
                  <span className="font-medium">{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">{formatCurrency(invoice.total)}</span>
              </div>

              {invoice.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Montant payé</span>
                    <span className="font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Solde restant</span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatCurrency(invoice.total - invoice.paidAmount)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Informations de paiement */}
          {invoice.status === 'paid' && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Paiement reçu
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Montant payé</span>
                  <span className="font-medium text-green-900">{formatCurrency(invoice.paidAmount)}</span>
                </div>
                {invoice.paymentDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Date de paiement</span>
                    <span className="font-medium text-green-900">{formatDate(invoice.paymentDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informations sur le devis source */}
          {invoice.quoteId && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Devis source</h3>
              <p className="text-sm text-blue-700">
                Cette facture a été créée à partir d'un devis accepté.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Enregistrer un paiement
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant payé
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={invoice.total - invoice.paidAmount}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Montant restant: {formatCurrency(invoice.total - invoice.paidAmount)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de paiement
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}