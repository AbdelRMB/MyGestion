import { useEffect, useState } from 'react';
import { featuresAPI } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
} from 'lucide-react';

export default function SpecificationDetail({ specification, onBack }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadFeatures();
  }, [specification.id]);

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const data = await featuresAPI.getBySpecification(specification.id);
      setFeatures(data);
    } catch (error) {
      console.error('Erreur:', error);
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title');
    const description = formData.get('description');

    const maxOrder = features.length > 0
      ? Math.max(...features.map(f => {
          const v = Number(f.orderIndex);
          return Number.isFinite(v) && !Number.isNaN(v) ? Math.floor(v) : 0;
        }))
      : -1;

    try {
      const level = Number(formData.get('level') || 1);
      const parentIdRaw = formData.get('parentId');
      const parentId = parentIdRaw === 'null' ? null : parentIdRaw ? Number(parentIdRaw) : undefined;

      await featuresAPI.create(specification.id, title, description, maxOrder + 1, level, parentId);
      setShowAddFeature(false);
      loadFeatures();
      toast.addToast('Fonctionnalité créée', { type: 'success' });
    } catch (error) {
      toast.addToast(error.message || 'Erreur lors de la création', { type: 'error' });
    }
  };

  const handleUpdateFeature = async (featureId, e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title');
    const description = formData.get('description');

    try {
      const level = Number(formData.get('level') || undefined);
      const parentIdRaw = formData.get('parentId');
      const parentId = parentIdRaw === 'null' ? null : parentIdRaw ? Number(parentIdRaw) : undefined;

      const updates = { title, description };
      if (!Number.isNaN(level)) updates.level = level;
      if (parentIdRaw !== null) updates.parentId = parentId;

      await featuresAPI.update(featureId, updates);
      setEditingFeature(null);
      loadFeatures();
      toast.addToast('Fonctionnalité mise à jour', { type: 'success' });
    } catch (error) {
      toast.addToast(error.message || 'Erreur lors de la mise à jour', { type: 'error' });
    }
  };

  const toggleFeatureCompletion = async (feature) => {
    try {
      await featuresAPI.update(feature.id, { isCompleted: !feature.isCompleted });
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === feature.id ? { ...f, isCompleted: !f.isCompleted } : f
        )
      );
      toast.addToast(feature.isCompleted ? 'Tâche réouverte' : 'Tâche complétée', { type: 'success' });
    } catch (error) {
      toast.addToast(error.message || 'Erreur lors de la mise à jour', { type: 'error' });
    }
  };

  const handleDeleteFeature = async (featureId) => {
    setShowDeleteConfirm(featureId);
  };

  const confirmDelete = async () => {
    const featureId = showDeleteConfirm;
    setShowDeleteConfirm(null);
    try {
      await featuresAPI.delete(featureId);
      loadFeatures();
      toast.addToast('Fonctionnalité supprimée', { type: 'success' });
    } catch (error) {
      toast.addToast(error.message || 'Erreur lors de la suppression', { type: 'error' });
    }
  };

  const completedCount = features.filter((f) => f.isCompleted).length;
  const progressPercentage = features.length > 0
    ? Math.round((completedCount / features.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Retour à la liste
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {specification.title}
            </h1>
            {specification.description && (
              <p className="text-slate-600 text-lg">{specification.description}</p>
            )}
          </div>

          {features.length > 0 && (
            <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Progression globale
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {completedCount} / {features.length}
                  </span>
                  <span className="text-sm text-slate-600">({progressPercentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Fonctionnalités</h2>
          <button
            onClick={() => setShowAddFeature(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Ajouter une fonctionnalité
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : features.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <Circle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Aucune fonctionnalité
            </h3>
            <p className="text-slate-600 mb-6">
              Ajoutez des fonctionnalités à votre cahier des charges
            </p>
            <button
              onClick={() => setShowAddFeature(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Ajouter une fonctionnalité
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`bg-white rounded-xl shadow-sm border transition-all ${
                  feature.isCompleted
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {editingFeature === feature.id ? (
                    <form
                      onSubmit={(e) => handleUpdateFeature(feature.id, e)}
                      className="p-5"
                    >
                    <input
                      type="text"
                      name="title"
                      defaultValue={feature.title}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Titre de la fonctionnalité"
                      required
                    />
                    <textarea
                      name="description"
                      defaultValue={feature.description}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Description (optionnel)"
                    />
                    <div className="mb-3">
                      <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-2">
                        Niveau
                      </label>
                      <select id="level" name="level" defaultValue={feature.level || 1} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="parentId" className="block text-sm font-medium text-slate-700 mb-2">
                        Parent (optionnel)
                      </label>
                      <select id="parentId" name="parentId" defaultValue={feature.parentId ?? ''} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                        <option value="">Aucun</option>
                        {features.filter(f => f.id !== feature.id).map((f) => (
                          <option key={f.id} value={f.id}>{`${f.title} (niveau ${f.level || 1})`}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Save className="w-4 h-4" />
                        Sauvegarder
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingFeature(null)}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-5 flex items-start gap-4">
                    <button
                      onClick={() => toggleFeatureCompletion(feature)}
                      className="flex-shrink-0 mt-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      {feature.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-400 hover:text-blue-600 transition-colors" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <h3
                              className={`text-lg font-semibold transition-all ${
                                feature.isCompleted
                                  ? 'text-green-700 line-through'
                                  : 'text-slate-900'
                              }`}
                            >
                              {feature.title}
                            </h3>
                          </div>
                          {feature.description && (
                            <p
                              className={`text-sm mt-2 ${
                                feature.isCompleted
                                  ? 'text-green-600/80'
                                  : 'text-slate-600'
                              }`}
                            >
                              {feature.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingFeature(feature.id)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeature(feature.id)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {showAddFeature && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Nouvelle fonctionnalité
            </h3>
            <form onSubmit={handleAddFeature} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Titre *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ex: Système d'authentification"
                />
              </div>
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-2">
                  Niveau
                </label>
                <select id="level" name="level" className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-2">
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </div>

              <div>
                <label htmlFor="parentId" className="block text-sm font-medium text-slate-700 mb-2">
                  Parent (optionnel)
                </label>
                <select id="parentId" name="parentId" className="w-full px-4 py-3 border border-slate-300 rounded-lg">
                  <option value="">Aucun</option>
                  {features.map((f) => (
                    <option key={f.id} value={f.id}>{`${f.title} (niveau ${f.level || 1})`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Décrivez la fonctionnalité..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFeature(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Confirmer la suppression</h3>
            <p className="text-slate-600 mb-6">Êtes-vous sûr de vouloir supprimer cette fonctionnalité ? Cette action est irréversible.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
