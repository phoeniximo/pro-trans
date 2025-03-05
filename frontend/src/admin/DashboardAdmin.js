import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  UsersIcon, DocumentTextIcon, CurrencyEuroIcon, 
  ShieldCheckIcon, ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import apiClient from '../../api/client';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import Button from '../../components/ui/Button';

const DashboardAdmin = () => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/admin/dashboard?periode=${period}`);
        setStats(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Erreur!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  // Si pas de stats
  if (!stats) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Aucune statistique disponible</p>
      </div>
    );
  }

  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Préparer les données pour le graphique d'utilisateurs
  const userData = [
    { name: 'Clients', value: stats.utilisateurs.clients },
    { name: 'Transporteurs', value: stats.utilisateurs.transporteurs }
  ];
  
  // Données pour le graphique d'annonces
  const annonceData = [
    { name: 'En cours', value: stats.annonces.enCours },
    { name: 'Terminées', value: stats.annonces.terminees },
    { name: 'Disponibles', value: stats.annonces.total - stats.annonces.enCours - stats.annonces.terminees }
  ];
  
  // Données pour le graphique de transactions
  const transactionData = stats.transactions.parJour.map(day => ({
    date: day._id,
    montant: parseFloat(day.montant.toFixed(2)),
    transactions: day.count
  }));
  
  // Données pour le graphique de litiges
  const litigeData = [
    { name: 'En cours', value: stats.disputes.enCours },
    { name: 'Résolus', value: stats.disputes.resolues }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord administration</h1>
      
      {/* Filtres de période */}
      <div className="flex space-x-2 pb-4 border-b border-gray-200">
        <Button 
          variant={period === '24h' ? 'primary' : 'outline'} 
          size="sm"
          onClick={() => setPeriod('24h')}
        >
          24h
        </Button>
        <Button 
          variant={period === '7d' ? 'primary' : 'outline'} 
          size="sm"
          onClick={() => setPeriod('7d')}
        >
          7 jours
        </Button>
        <Button 
          variant={period === '30d' ? 'primary' : 'outline'} 
          size="sm"
          onClick={() => setPeriod('30d')}
        >
          30 jours
        </Button>
        <Button 
          variant={period === '90d' ? 'primary' : 'outline'} 
          size="sm"
          onClick={() => setPeriod('90d')}
        >
          90 jours
        </Button>
        <Button 
          variant={period === '1y' ? 'primary' : 'outline'} 
          size="sm"
          onClick={() => setPeriod('1y')}
        >
          1 an
        </Button>
      </div>
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Utilisateurs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Utilisateurs</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.utilisateurs.total}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-teal-700">+{stats.utilisateurs.nouveaux}</span>
              <span className="text-gray-500"> nouveaux</span>
            </div>
          </div>
        </div>
        
        {/* Annonces */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Annonces</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.annonces.total}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-teal-700">+{stats.annonces.nouvelles}</span>
              <span className="text-gray-500"> nouvelles</span>
            </div>
          </div>
        </div>
        
        {/* Transactions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyEuroIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Transactions</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.transactions.montantTotal} €</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-teal-700">{stats.transactions.total}</span>
              <span className="text-gray-500"> paiements</span>
            </div>
          </div>
        </div>
        
        {/* Avis */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avis</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.avis.total}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-teal-700">{stats.avis.noteMoyenne}</span>
              <span className="text-gray-500"> note moyenne</span>
            </div>
          </div>
        </div>
        
        {/* Litiges */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Litiges</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.disputes.total}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-red-600">{stats.disputes.enCours}</span>
              <span className="text-gray-500"> en cours</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Graphique Utilisateurs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Répartition des utilisateurs</h3>
            <div className="mt-6" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {userData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} utilisateurs`, 'Nombre']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Graphique Annonces */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Statut des annonces</h3>
            <div className="mt-6" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={annonceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {annonceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} annonces`, 'Nombre']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Graphique Transactions */}
        <div className="bg-white overflow-hidden shadow rounded-lg col-span-1 lg:col-span-2">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Évolution des transactions</h3>
            <div className="mt-6" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={transactionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="montant"
                    stroke="#8884d8"
                    name="Montant (€)"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="transactions"
                    stroke="#82ca9d"
                    name="Nombre de transactions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;