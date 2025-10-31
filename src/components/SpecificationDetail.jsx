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
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export default function SpecificationDetail({ specification, onBack }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const toast = useToast();
  const [addLevel, setAddLevel] = useState(1);
  const [addParentId, setAddParentId] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    loadFeatures();
  }, [specification.id]);

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const data = await featuresAPI.getBySpecification(specification.id);
      setFeatures(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  const hasLevel1 = features.some((f) => Number(f.level || 1) === 1);
  const hasLevel2 = features.some((f) => Number(f.level || 1) === 2);
  const maxLevelAllowed = !hasLevel1 ? 1 : hasLevel1 && !hasLevel2 ? 2 : 3;

  const openAddModal = () => {
    setAddLevel(1);
    setAddParentId('');
    setShowAddFeature(true);
  };

  // helpers to organize features by level and parent
  const levelList = (lvl) => features.filter((f) => Number(f.level || 1) === lvl).sort((a, b) => (Number(a.orderIndex || 0) - Number(b.orderIndex || 0)));

  const buildChildrenMap = (list) => {
    return list.reduce((acc, f) => {
      const pid = f.parentId ?? null;
      if (pid !== null && pid !== undefined) {
        acc[pid] = acc[pid] || [];
        acc[pid].push(f);
      }
      return acc;
    }, {});
  };

  const childrenMap = buildChildrenMap(features);
  const getChildren = (id) => (childrenMap[id] ? [...childrenMap[id]].sort((a, b) => (Number(a.orderIndex || 0) - Number(b.orderIndex || 0))) : []);
  const hasChildren = (id) => (childrenMap[id] && childrenMap[id].length > 0);

  const handleAddFeature = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title');
    const description = formData.get('description');

    const maxOrder = features.length > 0
      ? Math.max(...features.map((f) => Number(f.orderIndex || 0)))
      : -1;

    try {
      const level = Number(addLevel || formData.get('level') || 1);
      const parentIdRaw = addParentId !== '' ? addParentId : formData.get('parentId');
      const parentId = parentIdRaw === '' || parentIdRaw === 'null' || parentIdRaw === null ? undefined : Number(parentIdRaw);

      await featuresAPI.create(specification.id, title, description, (maxOrder || 0) + 1, level, Number.isFinite(parentId) ? parentId : undefined);
      setShowAddFeature(false);
      await loadFeatures();
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
      const levelRaw = formData.get('level');
      const parentIdRaw = formData.get('parentId');
      const level = levelRaw ? Number(levelRaw) : undefined;
      const parentId = parentIdRaw === '' ? null : (parentIdRaw ? Number(parentIdRaw) : undefined);

      const updates = { title, description };
      if (level !== undefined && !Number.isNaN(level)) updates.level = level;
      if (parentIdRaw !== null) updates.parentId = parentId;

      await featuresAPI.update(featureId, updates);
      setEditingFeature(null);
      await loadFeatures();
      toast.addToast('Fonctionnalité mise à jour', { type: 'success' });
    } catch (error) {
      toast.addToast(error.message || 'Erreur lors de la mise à jour', { type: 'error' });
    }
  };

  // Prevent toggling a feature that has children (they are auto-managed)
  const toggleFeatureCompletion = async (feature) => {
    if (hasChildren(feature.id)) return;
    
    const wasCompleted = feature.isCompleted;
    
    try {
      await featuresAPI.update(feature.id, { isCompleted: !feature.isCompleted });
      toast.addToast(wasCompleted ? 'Tâche réouverte' : 'Tâche complétée', { type: 'success' });
      
      // reconcile parents after a child changed - this will reload features internally
      await reconcileParentsFrom(feature.id);
    } catch (error) {
      toast.addToast(error.message || 'Erreur lors de la mise à jour', { type: 'error' });
    }
  };

  // After a child (id) changed, ensure parent tasks reflect children completion state
  const reconcileParentsFrom = async (childId) => {
    // Reload features first to get latest state
    await loadFeatures();
    
    let current = features.find((f) => f.id === childId);
    if (!current) return;
    
    let parentId = current.parentId ?? null;
    let hasUpdated = false;
    
    // walk up the chain
    while (parentId) {
      const parent = features.find((f) => f.id === parentId);
      if (!parent) break;
      
      const children = getChildren(parent.id);
      const allDone = children.length > 0 && children.every((c) => c.isCompleted === true);
      
      try {
        if (allDone && !parent.isCompleted) {
          await featuresAPI.update(parent.id, { isCompleted: true });
          hasUpdated = true;
        } else if (!allDone && parent.isCompleted) {
          await featuresAPI.update(parent.id, { isCompleted: false });
          hasUpdated = true;
        }
      } catch (err) {
        console.warn('Reconcile parent error', err);
      }
      
      // move up to next parent
      parentId = parent.parentId ?? null;
    }
    
    // Reload features one final time if we made updates
    if (hasUpdated) {
      await loadFeatures();
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
      await loadFeatures();
      toast.addToast('Fonctionnalité supprimée', { type: 'success' });
    } catch (error) {
      toast.addToast(error.message || 'Erreur lors de la suppression', { type: 'error' });
    }
  };

  const completedCount = features.filter((f) => f.isCompleted).length;
  const progressPercentage = features.length > 0
    ? Math.round((completedCount / features.length) * 100)
    : 0;

  // Inline component to render a feature and its nested children
  function FeatureItem({ feature, level = 1, index = 0 }) {
    const children = getChildren(feature.id);
    const expandedForThis = !!expanded[feature.id];

    return (
      <div className={`bg-white rounded-xl shadow-sm border transition-all ${
        feature.isCompleted
          ? 'border-green-200 bg-green-50/30'
          : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
      }`}>
        {editingFeature === feature.id ? (
          <form onSubmit={(e) => handleUpdateFeature(feature.id, e)} className="p-5">
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Niveau</label>
              <select name="level" defaultValue={feature.level || 1} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">Parent (optionnel)</label>
              <select name="parentId" defaultValue={feature.parentId ?? ''} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                <option value="">Aucun</option>
                {features.filter((f) => f.id !== feature.id && Number(f.level || 1) === (Number(feature.level || 1) - 1)).map((f) => (
                  <option key={f.id} value={f.id}>{`${f.title} (niveau ${f.level || 1})`}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                <Save className="w-4 h-4" /> Sauvegarder
              </button>
              <button type="button" onClick={() => setEditingFeature(null)} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                <X className="w-4 h-4" /> Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className={`p-5 ${level > 1 ? 'ml-8 border-l-2 border-slate-200' : ''}`}>
            <div className="flex items-start gap-4">
              {/* hide completion toggle when feature has children */}
              {!hasChildren(feature.id) ? (
                <button onClick={() => toggleFeatureCompletion(feature)} className="flex-shrink-0 mt-1 transition-transform hover:scale-110 active:scale-95">
                  {feature.isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-slate-400 hover:text-blue-600 transition-colors" />}
                </button>
              ) : (
                <div className="flex-shrink-0 mt-1 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-600">{children.filter(c => c.isCompleted).length}/{children.length}</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">#{index + 1}</span>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">Niveau {feature.level || 1}</span>
                      <h3 className={`text-lg font-semibold transition-all ${feature.isCompleted ? 'text-green-700 line-through' : 'text-slate-900'}`}>{feature.title}</h3>
                    </div>
                    {feature.description && <p className={`text-sm mt-2 ${feature.isCompleted ? 'text-green-600/80' : 'text-slate-600'}`}>{feature.description}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingFeature(feature.id)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteFeature(feature.id)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* children toggle for this feature */}
            {hasChildren(feature.id) && (
              <div className="mt-4">
                <button 
                  onClick={() => setExpanded((s) => ({ ...s, [feature.id]: !s[feature.id] }))} 
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                >
                  {expandedForThis ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {expandedForThis ? 'Masquer les sous-tâches' : `Afficher ${children.length} sous-tâche(s)`}
                </button>
              </div>
            )}
            
            {/* Render children directly below when expanded */}
            {hasChildren(feature.id) && expandedForThis && (
              <div className="mt-2">
                {children.map((child, idx) => (
                  <FeatureItem key={child.id} feature={child} level={level + 1} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{specification.title}</h1>
            {specification.description && (
              <p className="text-slate-600 text-lg">{specification.description}</p>
            )}
          </div>

          {features.length > 0 && (
            <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Progression globale</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{completedCount} / {features.length}</span>
                  <span className="text-sm text-slate-600">({progressPercentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500 rounded-full" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Fonctionnalités</h2>
          <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md">
            <Plus className="w-5 h-5" /> Ajouter une fonctionnalité
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : features.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <Circle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune fonctionnalité</h3>
            <p className="text-slate-600 mb-6">Ajoutez des fonctionnalités à votre cahier des charges</p>
            <button onClick={openAddModal} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Plus className="w-5 h-5" /> Ajouter une fonctionnalité
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {levelList(1).map((feature, idx) => (
              <div key={feature.id}>
                <FeatureItem feature={feature} level={1} index={idx} />
              </div>
            ))}
          </div>
        )}
      </main>

      {showAddFeature && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Nouvelle fonctionnalité</h3>
            <form onSubmit={handleAddFeature} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">Titre *</label>
                <input type="text" id="title" name="title" required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Ex: Système d'authentification" />
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-2">Niveau</label>
                <select id="level" name="level" value={addLevel} onChange={(e) => { setAddLevel(Number(e.target.value)); setAddParentId(''); }} className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-2">
                  {Array.from({ length: maxLevelAllowed }, (_, i) => i + 1).map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {addLevel > 1 && (
                <div>
                  <label htmlFor="parentId" className="block text-sm font-medium text-slate-700 mb-2">Parent (optionnel)</label>
                  <select id="parentId" name="parentId" value={addParentId} onChange={(e) => setAddParentId(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg">
                    <option value="">Aucun</option>
                    {features.filter((f) => Number(f.level || 1) === addLevel - 1).map((f) => (
                      <option key={f.id} value={f.id}>{`${f.title} (niveau ${f.level || 1})`}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea id="description" name="description" rows={4} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="Décrivez la fonctionnalité..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddFeature(false)} className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md">Ajouter</button>
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
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
