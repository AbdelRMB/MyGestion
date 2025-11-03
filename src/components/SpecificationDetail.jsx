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
    try {
      // Get fresh data from server
      const freshData = await featuresAPI.getBySpecification(specification.id);
      const freshFeatures = Array.isArray(freshData) ? freshData : [];
      
      // Build fresh children map
      const freshChildrenMap = freshFeatures.reduce((acc, f) => {
        const pid = f.parentId ?? null;
        if (pid !== null && pid !== undefined) {
          acc[pid] = acc[pid] || [];
          acc[pid].push(f);
        }
        return acc;
      }, {});
      
      const getFreshChildren = (id) => (freshChildrenMap[id] ? [...freshChildrenMap[id]] : []);
      
      let current = freshFeatures.find((f) => f.id === childId);
      if (!current) {
        await loadFeatures(); // Update UI state
        return;
      }
      
      let parentId = current.parentId ?? null;
      let hasUpdated = false;
      
      // walk up the chain
      while (parentId) {
        const parent = freshFeatures.find((f) => f.id === parentId);
        if (!parent) break;
        
        const children = getFreshChildren(parent.id);
        const allDone = children.length > 0 && children.every((c) => c.isCompleted === true);
        
        try {
          if (allDone && !parent.isCompleted) {
            await featuresAPI.update(parent.id, { isCompleted: true });
            hasUpdated = true;
            // Update parent in fresh data for next iteration
            parent.isCompleted = true;
          } else if (!allDone && parent.isCompleted) {
            await featuresAPI.update(parent.id, { isCompleted: false });
            hasUpdated = true;
            // Update parent in fresh data for next iteration
            parent.isCompleted = false;
          }
        } catch (err) {
          console.warn('Reconcile parent error', err);
        }
        
        // move up to next parent
        parentId = parent.parentId ?? null;
      }
      
      // Reload UI state if we made updates
      if (hasUpdated) {
        await loadFeatures();
      }
    } catch (error) {
      console.error('Error in reconcileParentsFrom:', error);
      await loadFeatures(); // Ensure UI is updated even on error
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

    const levelColors = {
      1: 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50',
      2: 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50',
      3: 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50'
    };

    const levelBadgeColors = {
      1: 'bg-blue-100 text-blue-700 border-blue-200',
      2: 'bg-purple-100 text-purple-700 border-purple-200',
      3: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };

    return (
      <div className={`
        relative rounded-2xl shadow-sm border-2 transition-all duration-300 ease-in-out
        ${feature.isCompleted 
          ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-green-100/50' 
          : `${levelColors[level] || levelColors[3]} hover:shadow-lg hover:scale-[1.02]`
        }
        ${level > 1 ? 'ml-6 mt-3' : 'mb-4'}
      `}>
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
          <div className="p-6">
            <div className="flex items-start gap-5">
              {/* hide completion toggle when feature has children */}
              {!hasChildren(feature.id) ? (
                <button 
                  onClick={() => toggleFeatureCompletion(feature)} 
                  className="flex-shrink-0 mt-1 transition-all duration-200 hover:scale-125 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200 rounded-full"
                >
                  {feature.isCompleted ? (
                    <CheckCircle2 className="w-7 h-7 text-green-600 drop-shadow-sm" />
                  ) : (
                    <Circle className="w-7 h-7 text-slate-400 hover:text-blue-600 transition-colors duration-200" />
                  )}
                </button>
              ) : (
                <div className="flex-shrink-0 mt-1 w-7 h-7 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-xs font-bold text-white">{children.filter(c => c.isCompleted).length}/{children.length}</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        #{index + 1}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${levelBadgeColors[level] || levelBadgeColors[3]}`}>
                        Niveau {feature.level || 1}
                      </span>
                      {feature.isCompleted && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          ✓ Terminé
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xl font-bold transition-all duration-300 ${
                      feature.isCompleted 
                        ? 'text-green-700 line-through opacity-75' 
                        : 'text-slate-900 hover:text-blue-700'
                    }`}>
                      {feature.title}
                    </h3>
                    {feature.description && (
                      <p className={`text-sm mt-3 leading-relaxed ${
                        feature.isCompleted 
                          ? 'text-green-600/70' 
                          : 'text-slate-600'
                      }`}>
                        {feature.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingFeature(feature.id)} 
                      className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200" 
                      title="Modifier"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFeature(feature.id)} 
                      className="p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200" 
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* children toggle for this feature */}
            {hasChildren(feature.id) && (
              <div className="mt-6 pt-4 border-t border-slate-200/50">
                <button 
                  onClick={() => setExpanded((s) => ({ ...s, [feature.id]: !s[feature.id] }))} 
                  className="flex items-center gap-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-md border border-indigo-200 hover:border-indigo-300"
                >
                  {expandedForThis ? (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      Masquer les sous-tâches
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-5 h-5" />
                      Afficher {children.length} sous-tâche{children.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* Render children directly below when expanded */}
            {hasChildren(feature.id) && expandedForThis && (
              <div className="mt-4 space-y-1">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-3 text-slate-600 hover:text-slate-900 mb-6 transition-all duration-200 group hover:bg-slate-100 px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform duration-200" />
            <span className="font-medium">Retour à la liste</span>
          </button>

          <div className="mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-3">
              {specification.title}
            </h1>
            {specification.description && (
              <p className="text-slate-700 text-xl leading-relaxed max-w-4xl">
                {specification.description}
              </p>
            )}
          </div>

          {features.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-white to-slate-50 rounded-2xl p-6 border-2 border-slate-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{progressPercentage}%</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Progression globale</h3>
                    <p className="text-sm text-slate-600">Avancement du projet</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{completedCount} / {features.length}</div>
                  <div className="text-sm text-slate-500">tâches terminées</div>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-full transition-all duration-700 ease-out rounded-full relative overflow-hidden" 
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Fonctionnalités
            </h2>
            <p className="text-slate-600 mt-1">Gérez vos tâches par niveaux hiérarchiques</p>
          </div>
          <button 
            onClick={openAddModal} 
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200"
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
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl border-2 border-slate-100 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Circle className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Aucune fonctionnalité</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
              Commencez par ajouter des fonctionnalités à votre cahier des charges. Vous pouvez créer jusqu'à 3 niveaux hiérarchiques.
            </p>
            <button 
              onClick={openAddModal} 
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="w-6 h-6" /> 
              Créer ma première fonctionnalité
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {levelList(1).map((feature, idx) => (
              <FeatureItem key={feature.id} feature={feature} level={1} index={idx} />
            ))}
          </div>
        )}
      </main>

      {showAddFeature && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 border-2 border-slate-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Nouvelle fonctionnalité
              </h3>
              <p className="text-slate-600 mt-2">Ajoutez une nouvelle tâche à votre projet</p>
            </div>
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

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddFeature(false)} 
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold hover:border-slate-400"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Créer la fonctionnalité
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 border-2 border-red-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirmer la suppression</h3>
              <p className="text-slate-600 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer cette fonctionnalité ? Cette action est irréversible et supprimera également toutes les sous-tâches associées.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setShowDeleteConfirm(null)} 
                className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold hover:border-slate-400"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
