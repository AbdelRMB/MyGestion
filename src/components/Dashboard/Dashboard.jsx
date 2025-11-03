import { 
  Users, 
  FileText, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar
} from 'lucide-react';

const stats = [
  {
    title: 'Cahiers des charges',
    value: '12',
    change: '+2',
    changeType: 'positive',
    icon: FileText,
    color: 'blue'
  },
  {
    title: 'Tâches complétées',
    value: '89',
    change: '+12',
    changeType: 'positive',
    icon: CheckCircle,
    color: 'green'
  },
  {
    title: 'En cours',
    value: '34',
    change: '+5',
    changeType: 'positive',
    icon: Clock,
    color: 'orange'
  },
  {
    title: 'En retard',
    value: '3',
    change: '-1',
    changeType: 'negative',
    icon: AlertCircle,
    color: 'red'
  }
];

const recentActivities = [
  {
    id: 1,
    title: 'Cahier des charges "Application Mobile" créé',
    time: 'Il y a 2 heures',
    type: 'creation'
  },
  {
    id: 2,
    title: 'Tâche "Interface utilisateur" complétée',
    time: 'Il y a 4 heures',
    type: 'completion'
  },
  {
    id: 3,
    title: 'Révision du cahier "Site Web E-commerce"',
    time: 'Il y a 1 jour',
    type: 'update'
  },
  {
    id: 4,
    title: 'Nouveau cahier des charges assigné',
    time: 'Il y a 2 jours',
    type: 'assignment'
  }
];

export default function Dashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de vos projets et cahiers des charges
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`
                      text-sm font-medium
                      ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}
                    `}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      ce mois
                    </span>
                  </div>
                </div>
                <div className={`
                  p-3 rounded-lg
                  ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : ''}
                  ${stat.color === 'green' ? 'bg-green-50 text-green-600' : ''}
                  ${stat.color === 'orange' ? 'bg-orange-50 text-orange-600' : ''}
                  ${stat.color === 'red' ? 'bg-red-50 text-red-600' : ''}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Activité récente
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Voir tout
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`
                    w-2 h-2 rounded-full mt-2 flex-shrink-0
                    ${activity.type === 'creation' ? 'bg-blue-500' : ''}
                    ${activity.type === 'completion' ? 'bg-green-500' : ''}
                    ${activity.type === 'update' ? 'bg-orange-500' : ''}
                    ${activity.type === 'assignment' ? 'bg-purple-500' : ''}
                  `} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Résumé
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Progression globale</span>
                <span className="text-sm font-medium text-gray-900">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Prochaines échéances
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Application mobile - 15 Nov</div>
                  <div>• Site e-commerce - 22 Nov</div>
                  <div>• API Backend - 30 Nov</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  Nouveau cahier des charges
                </span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">
                  Voir les rapports
                </span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">
                  Gérer l'équipe
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}