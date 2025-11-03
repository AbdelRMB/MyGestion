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
  Download,
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import SpecificationPDF from './SpecificationPDF';

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
  const [activeTab, setActiveTab] = useState('document'); // 'document' ou 'tasks'

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
      
      // Force reload all features to ensure UI is up to date
      await loadFeatures();
    } catch (error) {
      toast.addToast(error.message || 'Erreur lors de la mise à jour', { type: 'error' });
      // Reload features even on error to ensure UI consistency
      await loadFeatures();
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

  // Fonction pour générer la table des matières (niveaux 1 et 2 uniquement)
  const generateTableOfContents = () => {
    const level1Features = levelList(1);
    
    return level1Features.map((feature, index) => {
      const children = getChildren(feature.id);
      const hasLevel2Children = children.length > 0;
      
      return {
        ...feature,
        index: index + 1,
        children: hasLevel2Children ? children.map((child, childIndex) => ({
          ...child,
          index: `${index + 1}.${childIndex + 1}`,
          children: getChildren(child.id) // On garde les enfants niveau 3 pour le contenu mais pas pour la table des matières
        })) : []
      };
    });
  };

  // Fonction pour exporter en PDF
  const exportToPDF = async () => {
    try {
      const blob = await pdf(
        <SpecificationPDF 
          specification={specification}
          features={features}
          generateTableOfContents={generateTableOfContents}
          getChildren={getChildren}
          levelList={levelList}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cahier-des-charges-${specification.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.addToast('PDF exporté avec succès', { type: 'success' });
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.addToast('Erreur lors de l\'export PDF', { type: 'error' });
    }
  };

  // Inline component to render a feature and its nested children
  function FeatureItem({ feature, level = 1, index = 0 }) {
    const children = getChildren(feature.id);
    const expandedForThis = !!expanded[feature.id];

    const levelColors = {
      1: 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50',
      2: 'border-purple-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50',
      3: 'border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-teal-50/50'
    };

    const levelBadgeColors = {
      1: 'bg-blue-100 text-blue-700 border-blue-200',
      2: 'bg-purple-100 text-purple-700 border-purple-200',
      3: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };

    return (
      <div className={`
        relative rounded-lg sm:rounded-xl shadow-sm border transition-all duration-200 ease-in-out
        ${feature.isCompleted 
          ? 'border-green-300 bg-gradient-to-r from-green-50/70 to-emerald-50/70' 
          : `${levelColors[level] || levelColors[3]} hover:shadow-md`
        }
        ${level > 1 ? 'ml-2 sm:ml-4 mt-1 sm:mt-2' : 'mb-2 sm:mb-3'}
      `}>
        {editingFeature === feature.id ? (
          <form onSubmit={(e) => handleUpdateFeature(feature.id, e)} className="p-2 sm:p-3">
            <input 
              type="text" 
              name="title" 
              defaultValue={feature.title} 
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm" 
              placeholder="Titre de la fonctionnalité" 
              required 
            />
            <textarea 
              name="description" 
              defaultValue={feature.description} 
              rows={2} 
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-xs sm:text-sm" 
              placeholder="Description (optionnel)" 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Niveau</label>
                <select name="level" defaultValue={feature.level || 1} className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs sm:text-sm">
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Parent</label>
                <select name="parentId" defaultValue={feature.parentId ?? ''} className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs sm:text-sm">
                  <option value="">Aucun</option>
                  {features.filter((f) => f.id !== feature.id && Number(f.level || 1) === (Number(feature.level || 1) - 1)).map((f) => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
              </div>
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
          <div className="p-2 sm:p-3">
            <div className="flex items-start gap-2 sm:gap-3">
              {/* hide completion toggle when feature has children */}
              {!hasChildren(feature.id) ? (
                <button 
                  onClick={() => toggleFeatureCompletion(feature)} 
                  className="flex-shrink-0 mt-0.5 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  {feature.isCompleted ? (
                    <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                  ) : (
                    <Circle className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400 hover:text-blue-600 transition-colors duration-200" />
                  )}
                </button>
              ) : (
                <div className="flex-shrink-0 mt-0.5 w-4 sm:w-5 h-4 sm:h-5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{children.filter(c => c.isCompleted).length}/{children.length}</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        #{index + 1}
                      </span>
                      <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium ${levelBadgeColors[level] || levelBadgeColors[3]}`}>
                        N{feature.level || 1}
                      </span>
                      {feature.isCompleted && (
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✓
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm sm:text-base font-semibold transition-all duration-300 leading-tight ${
                      feature.isCompleted 
                        ? 'text-green-700 line-through opacity-75' 
                        : 'text-slate-900'
                    }`}>
                      {feature.title}
                    </h3>
                    {feature.description && (
                      <p className={`text-xs mt-0.5 sm:mt-1 leading-relaxed ${
                        feature.isCompleted 
                          ? 'text-green-600/70' 
                          : 'text-slate-600'
                      }`}>
                        {feature.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <button 
                      onClick={() => setEditingFeature(feature.id)} 
                      className="p-1.5 sm:p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" 
                      title="Modifier"
                    >
                      <Edit2 className="w-3 sm:w-4 h-3 sm:h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFeature(feature.id)} 
                      className="p-1.5 sm:p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200" 
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* children toggle for this feature */}
            {hasChildren(feature.id) && (
              <div className="mt-3 pt-2 border-t border-slate-200/50">
                <button 
                  onClick={() => setExpanded((s) => ({ ...s, [feature.id]: !s[feature.id] }))} 
                  className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium hover:bg-slate-50 px-3 py-1.5 rounded-lg w-full text-left"
                >
                  {expandedForThis ? (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Masquer ({children.length})
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      Voir {children.length} sous-tâche{children.length > 1 ? 's' : ''}
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
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-1 sm:gap-2 text-slate-600 hover:text-slate-900 transition-all duration-200 group hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium text-xs sm:text-sm">Retour</span>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                  {specification.title}
                </h1>
                {specification.description && (
                  <p className="text-slate-600 text-xs sm:text-sm mt-0.5 sm:mt-1 max-w-full sm:max-w-2xl truncate">
                    {specification.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-wrap justify-end sm:justify-start">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm">
                <div className="text-xs font-medium opacity-90">Total</div>
                <div className="text-sm sm:text-base lg:text-lg font-bold leading-tight">{features.length}</div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm">
                <div className="text-xs font-medium opacity-90">OK</div>
                <div className="text-sm sm:text-base lg:text-lg font-bold leading-tight">
                  {features.filter(f => f.isCompleted).length}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm">
                <div className="text-xs font-medium opacity-90">%</div>
                <div className="text-sm sm:text-base lg:text-lg font-bold leading-tight">{progressPercentage}%</div>
              </div>

              {activeTab === 'tasks' && (
                <button
                  onClick={() => setShowAddFeature(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-1 sm:gap-2 group text-xs sm:text-sm"
                >
                  <Plus className="w-3 sm:w-4 h-3 sm:h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="hidden xs:inline">Ajouter</span>
                  <span className="xs:hidden">+</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Onglets */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center">
            <div className="flex">
              <button
                onClick={() => setActiveTab('document')}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-all duration-200 ${
                  activeTab === 'document'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
              >
                📄 Cahier des charges
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-all duration-200 ${
                  activeTab === 'tasks'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
              >
                ✅ Tâches
              </button>
            </div>
            
            {/* Bouton Export PDF - visible uniquement dans l'onglet document */}
            {activeTab === 'document' && features.length > 0 && (
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4">
        {activeTab === 'document' ? (
          // Vue Cahier des charges (PDF-like)
          <div className="bg-white shadow-xl rounded-lg border border-slate-200 min-h-[800px] p-8 sm:p-12">
            {/* En-tête du document */}
            <div className="text-center mb-12 border-b-2 border-slate-200 pb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                CAHIER DES CHARGES
              </h1>
              <h2 className="text-xl sm:text-2xl text-blue-800 font-semibold">
                {specification.title}
              </h2>
              {specification.description && (
                <p className="text-slate-600 mt-4 text-lg max-w-4xl mx-auto leading-relaxed">
                  {specification.description}
                </p>
              )}
              <div className="mt-6 text-sm text-slate-500">
                Document généré le {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : features.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-500 text-lg">Aucune fonctionnalité définie pour ce cahier des charges.</p>
              </div>
            ) : (
              <>
                {/* Table des matières */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-300 pb-2">
                    TABLE DES MATIÈRES
                  </h2>
                  <div className="space-y-2">
                    {generateTableOfContents().map((item) => (
                      <div key={item.id}>
                        {/* Niveau 1 */}
                        <div className="flex justify-between items-center py-2 border-b border-dotted border-slate-200">
                          <button
                            onClick={() => document.getElementById(`section-${item.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-left"
                          >
                            {item.index}. {item.title}
                          </button>
                          <span className="text-slate-400">
                            {item.children.length > 0 ? '.....................' : '- - - - - - - - - -'}
                          </span>
                        </div>
                        
                        {/* Niveau 2 */}
                        {item.children.map((child) => (
                          <div key={child.id} className="flex justify-between items-center py-1 ml-6 text-sm border-b border-dotted border-slate-100">
                            <button
                              onClick={() => document.getElementById(`section-${child.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                              className="text-slate-700 hover:text-blue-600 transition-colors cursor-pointer text-left"
                            >
                              {child.index} {child.title}
                            </button>
                            <span className="text-slate-300">- - - - - - -</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contenu du document */}
                <div className="space-y-8">
                  {generateTableOfContents().map((item) => (
                    <div key={item.id}>
                      {/* Section Niveau 1 */}
                      <div id={`section-${item.id}`} className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b-2 border-blue-600 pb-2 flex items-center gap-3">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-lg">
                            {item.index}
                          </span>
                          {item.title}
                        </h2>
                        {item.description && (
                          <p className="text-slate-700 mb-6 leading-relaxed bg-slate-50 p-4 rounded-lg border-l-4 border-blue-600">
                            {item.description}
                          </p>
                        )}

                        {/* Sous-sections Niveau 2 */}
                        {item.children.length > 0 && (
                          <div className="ml-4 space-y-6">
                            {item.children.map((child) => (
                              <div key={child.id} id={`section-${child.id}`} className="scroll-mt-24">
                                <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                  <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm">
                                    {child.index}
                                  </span>
                                  {child.title}
                                </h3>
                                {child.description && (
                                  <p className="text-slate-600 mb-4 leading-relaxed bg-purple-50 p-3 rounded border-l-4 border-purple-600">
                                    {child.description}
                                  </p>
                                )}

                                {/* Éléments Niveau 3 */}
                                {child.children.length > 0 && (
                                  <div className="ml-4 space-y-3">
                                    {child.children.map((grandChild, idx) => (
                                      <div key={grandChild.id} className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                          •
                                        </span>
                                        <div className="flex-1">
                                          <h4 className="font-medium text-slate-700 mb-1">
                                            {grandChild.title}
                                          </h4>
                                          {grandChild.description && (
                                            <p className="text-slate-600 text-sm leading-relaxed">
                                              {grandChild.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Si pas d'enfants niveau 2, afficher directement les niveau 3 s'il y en a */}
                        {item.children.length === 0 && getChildren(item.id).length > 0 && (
                          <div className="ml-4 space-y-3">
                            {getChildren(item.id).map((child) => (
                              <div key={child.id} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                  •
                                </span>
                                <div className="flex-1">
                                  <h4 className="font-medium text-slate-700 mb-1">
                                    {child.title}
                                  </h4>
                                  {child.description && (
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                      {child.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          // Vue Tâches (ancienne vue)
          <>
            {features.length > 0 && (
              <div className="mb-3 sm:mb-4 bg-gradient-to-r from-white to-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">Progression</h3>
                  <span className="text-xs font-medium text-slate-600">{completedCount} / {features.length} terminées</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-full transition-all duration-700 ease-out rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Fonctionnalités
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 sm:py-20">
                <Loader2 className="w-6 sm:w-8 h-6 sm:h-8 animate-spin text-blue-600" />
              </div>
            ) : features.length === 0 ? (
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8 text-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Circle className="w-6 sm:w-8 h-6 sm:h-8 text-slate-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Aucune fonctionnalité</h3>
                <p className="text-slate-600 mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto text-xs sm:text-sm">
                  Ajoutez des fonctionnalités avec jusqu'à 3 niveaux hiérarchiques.
                </p>
                <button 
                  onClick={() => setShowAddFeature(true)} 
                  className="inline-flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg text-xs sm:text-sm"
                >
                  <Plus className="w-4 sm:w-5 h-4 sm:h-5" /> 
                  <span className="hidden sm:inline">Créer ma première fonctionnalité</span>
                  <span className="sm:hidden">Créer une fonctionnalité</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-4">
                {levelList(1).map((feature, idx) => (
                  <FeatureItem key={feature.id} feature={feature} level={1} index={idx} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showAddFeature && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-sm sm:max-w-lg p-4 sm:p-6 border border-slate-200 mx-3">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Plus className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Nouvelle fonctionnalité
              </h3>
            </div>
            <form onSubmit={handleAddFeature} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
                <input type="text" id="title" name="title" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="Ex: Système d'authentification" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-1">Niveau</label>
                  <select id="level" name="level" value={addLevel} onChange={(e) => { setAddLevel(Number(e.target.value)); setAddParentId(''); }} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    {Array.from({ length: maxLevelAllowed }, (_, i) => i + 1).map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {addLevel > 1 && (
                  <div>
                    <label htmlFor="parentId" className="block text-sm font-medium text-slate-700 mb-1">Parent</label>
                    <select id="parentId" name="parentId" value={addParentId} onChange={(e) => setAddParentId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                      <option value="">Aucun</option>
                      {features.filter((f) => Number(f.level || 1) === addLevel - 1).map((f) => (
                        <option key={f.id} value={f.id}>{f.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea id="description" name="description" rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm" placeholder="Décrivez la fonctionnalité..." />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddFeature(false)} 
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200 font-medium text-sm"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-60">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-xs sm:max-w-md p-4 sm:p-6 border border-red-200 mx-3">
            <div className="text-center mb-3 sm:mb-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Trash2 className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Confirmer la suppression</h3>
              <p className="text-slate-600 text-xs sm:text-sm">
                Supprimer cette fonctionnalité et toutes ses sous-tâches ?
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(null)} 
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200 font-medium text-sm"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
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
