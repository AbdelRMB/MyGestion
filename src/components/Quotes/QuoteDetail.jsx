import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { quotesAPI } from '../../lib/api';
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
  X
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import QuotePDF from './QuotePDF.jsx';



export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadQuote();
  }, [id]);

  const loadQuote = async () => {
    setLoading(true);
    try {
      const data = await quotesAPI.getById(id);
      setQuote(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.addToast('Erreur lors du chargement du devis', { type: 'error' });
      navigate('/quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await quotesAPI.update(id, quote);
      toast.addToast('Devis sauvegardé avec succès', { type: 'success' });
      setEditMode(false);
    } catch (error) {
      toast.addToast('Erreur lors de la sauvegarde', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendByEmail = async () => {
    try {
      await quotesAPI.sendByEmail(id);
      toast.addToast('Devis envoyé par email', { type: 'success' });
      // Mettre à jour le statut
      setQuote(prev => ({ ...prev, status: 'sent' }));
    } catch (error) {
      toast.addToast('Erreur lors de l\'envoi', { type: 'error' });
    }
  };

  const exportToPDF = async () => {
    try {
      const blob = await pdf(<QuotePDF quote={quote} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Devis-${quote.number}.pdf`;
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

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setQuote(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (itemId, field, value) => {
    setQuote(prev => ({
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
    
    // Recalculer les totaux
    recalculateTotal();
  };

  const removeItem = (itemId) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    recalculateTotal();
  };

  const recalculateTotal = () => {
    setTimeout(() => {
      setQuote(prev => {
        const subtotal = prev.items.reduce((sum, item) => sum + item.total, 0);
        const total = subtotal - prev.discount + prev.tax;
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
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Devis non trouvé</p>
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
              onClick={() => navigate('/quotes')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors hover:bg-gray-100 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {quote.number}
              </h1>
              <p className="text-gray-600">{quote.title}</p>
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
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
                {quote.status === 'draft' && (
                  <button
                    onClick={handleSendByEmail}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Envoyer
                  </button>
                )}
                <button 
                  onClick={exportToPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </>
            )}
          </div>
        </div>
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
                    value={quote.client}
                    onChange={(e) => setQuote(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{quote.client}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={quote.clientEmail}
                    onChange={(e) => setQuote(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {quote.clientEmail}
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
                    value={quote.clientPhone}
                    onChange={(e) => setQuote(prev => ({ ...prev, clientPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {quote.clientPhone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                {editMode ? (
                  <textarea
                    value={quote.clientAddress}
                    onChange={(e) => setQuote(prev => ({ ...prev, clientAddress: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-line">{quote.clientAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Lignes du devis */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Détail du devis
              </h2>
              {editMode && (
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Description</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700 w-20">Qté</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-700 w-24">Prix unit.</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-700 w-24">Total</th>
                    {editMode && <th className="w-12"></th>}
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        {editMode ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-900">{item.description}</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {editMode ? (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-center"
                          />
                        ) : (
                          <span className="text-gray-900">{item.quantity}</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {editMode ? (
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-right"
                          />
                        ) : (
                          <span className="text-gray-900">{formatCurrency(item.unitPrice)}</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                      {editMode && (
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800 p-1"
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

            {/* Totaux */}
            <div className="mt-6 space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Sous-total:</span>
                <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Remise:</span>
                <span className="font-medium">-{formatCurrency(quote.discount)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-lg">
                <span>Total HT:</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Notes et conditions
            </h2>
            {editMode ? (
              <textarea
                value={quote.notes}
                onChange={(e) => setQuote(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notes, conditions de paiement, délais..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-line">
                {quote.notes || 'Aucune note'}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statut */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  quote.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                  quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                  quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {quote.status === 'draft' ? '📝 Brouillon' :
                   quote.status === 'sent' ? '📤 Envoyé' :
                   quote.status === 'accepted' ? '✅ Accepté' :
                   '❌ Refusé'}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Créé le {new Date(quote.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Valide jusqu'au {new Date(quote.validUntil).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé financier */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant total:</span>
                <span className="font-semibold text-xl text-gray-900">
                  {formatCurrency(quote.total)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nombre de lignes:</span>
                <span>{quote.items.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}