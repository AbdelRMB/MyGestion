import { useEffect, useState } from 'react';
import { specificationsAPI, featuresAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Plus, LogOut, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function SpecificationsList({ onSelectSpecification }) {
  const [specifications, setSpecifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, signOut } = useAuth();
  const toast = useToast();

  useEffect(() => {
    loadSpecifications();
  }, []);

  const loadSpecifications = async () => {
    setLoading(true);
    try {
      const specs = await specificationsAPI.getAll();

      const specsWithFeatures = await Promise.all(
        specs.map(async (spec) => {
          try {
            const features = await featuresAPI.getBySpecification(spec.id);
            return { ...spec, features };
          } catch {
            return { ...spec, features: [] };
          }
        })
      );

      setSpecifications(specsWithFeatures);
    } catch (error) {
      console.error('Erreur:', error);
      setSpecifications([]);
      toast.addToast(error.message || 'Erreur lors du chargement', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpecification = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title');
    const description = formData.get('description');

    try {
      await specificationsAPI.create(title, description);
      setShowCreateModal(false);
      loadSpecifications();
    } catch (error) {
      toast.addToast(error.message || 'Erreur lors de la création', { type: 'error' });
    }
  };

  const getCompletionStats = (spec) => {
    const total = spec.features?.length || 0;
    const completed = spec.features?.filter(f => f.isCompleted).length || 0;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Mes Cahiers des Charges</h1>
                <p className="text-sm text-slate-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {specifications.length} cahier{specifications.length !== 1 ? 's' : ''} des charges
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nouveau cahier
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : specifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun cahier des charges</h3>
            <p className="text-slate-600 mb-6">Commencez par créer votre premier cahier des charges</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Créer un cahier
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specifications.map((spec) => {
              const stats = getCompletionStats(spec);
              return (
                <div
                  key={spec.id}
                  onClick={() => onSelectSpecification(spec)}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    {stats.total > 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">
                          {stats.completed}/{stats.total}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                    {spec.title}
                  </h3>

                  {spec.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {spec.description}
                    </p>
                  )}

                  {stats.total > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                        <span>Progression</span>
                        <span className="font-medium">{stats.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 rounded-full"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <Clock className="w-3.5 h-3.5" />
                    Modifié {new Date(spec.updatedAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Nouveau cahier des charges
            </h3>
            <form onSubmit={handleCreateSpecification} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ex: Application mobile e-commerce"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Décrivez brièvement votre projet..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
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
