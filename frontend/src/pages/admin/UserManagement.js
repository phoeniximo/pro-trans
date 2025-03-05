import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  TrashIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [sort, setSort] = useState('recent');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Récupérer les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sort,
        role: role || undefined,
        search: search || undefined
      };
      
      const response = await apiClient.get('/api/admin/users', { params });
      setUsers(response.data.data);
      setTotalPages(response.data.pages);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError('Erreur lors du chargement des utilisateurs');
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  // Charger les utilisateurs au chargement et quand les filtres changent
  useEffect(() => {
    fetchUsers();
  }, [page, sort, role]);

  // Gestion de la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Réinitialiser la pagination lors d'une nouvelle recherche
    fetchUsers();
  };

  // Gestion de la suppression
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await apiClient.delete(`/api/admin/users/${userToDelete}`);
      toast.success('Utilisateur supprimé avec succès');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers(); // Rafraîchir la liste après suppression
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  // Changer le statut d'un utilisateur (activer/désactiver)
  const toggleUserStatus = async (userId, newStatus) => {
    try {
      await apiClient.patch(`/api/admin/users/${userId}/status`, { actif: newStatus });
      toast.success(`Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
      
      // Mettre à jour localement
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, actif: newStatus } : user
        )
      );
    } catch (err) {
      console.error('Erreur lors de la modification du statut:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la modification du statut');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
      </div>
      
      {/* Filtres et recherche */}
      <div className="bg-white shadow-sm rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="md:col-span-2">
            <form onSubmit={handleSearch}>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Rechercher par nom, email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Button type="submit" variant="text" size="sm">
                    Rechercher
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Filtre par rôle */}
          <div>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              value={role}
              onChange={e => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tous les rôles</option>
              <option value="client">Clients</option>
              <option value="transporteur">Transporteurs</option>
              <option value="admin">Administrateurs</option>
            </select>
          </div>

          {/* Tri */}
          <div>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              value={sort}
              onChange={e => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="recent">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="name">Par nom</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Liste des utilisateurs */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-700 bg-red-50 border-l-4 border-red-500">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map(user => (
              <li key={user._id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {user.photo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.photo}
                              alt={`${user.prenom} ${user.nom}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                              </span>
                            </div>
                          )}
                          {!user.actif && (
                            <div className="absolute inset-0 rounded-full bg-gray-900 bg-opacity-50 flex items-center justify-center">
                              <XMarkIcon className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.prenom} {user.nom}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role === 'transporteur' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'admin' 
                            ? 'Admin' 
                            : user.role === 'transporteur' 
                              ? 'Transporteur' 
                              : 'Client'}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: fr })}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {/* Bouton vérifier documents (seulement pour transporteurs) */}
                        {user.role === 'transporteur' && (
                          <Button
                            to={`/admin/users/${user._id}/verify`}
                            variant="outline"
                            size="sm"
                            title="Vérifier les documents"
                          >
                            <DocumentCheckIcon className="h-5 w-5" />
                          </Button>
                        )}
                        
                        {/* Bouton éditer */}
                        <Button
                          to={`/admin/users/${user._id}/edit`}
                          variant="outline"
                          size="sm"
                          title="Modifier l'utilisateur"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Button>
                        
                        {/* Bouton activer/désactiver */}
                        <Button
                          variant={user.actif ? "danger" : "success"}
                          size="sm"
                          title={user.actif ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
                          onClick={() => toggleUserStatus(user._id, !user.actif)}
                        >
                          {user.actif ? <XMarkIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
                        </Button>
                        
                        {/* Bouton supprimer */}
                        <Button
                          variant="danger"
                          size="sm"
                          title="Supprimer l'utilisateur"
                          onClick={() => {
                            setUserToDelete(user._id);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de la page <span className="font-medium">{page}</span> sur{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Précédent</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    const pageNumber = page <= 3 
                      ? idx + 1 
                      : page >= totalPages - 2 
                        ? totalPages - 4 + idx 
                        : page - 2 + idx;
                    
                    if (pageNumber <= 0 || pageNumber > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === page ? "primary" : "outline"}
                        onClick={() => setPage(pageNumber)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Suivant</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Supprimer l'utilisateur</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action ne peut pas être annulée.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="danger"
                  onClick={handleDeleteUser}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Supprimer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                  }}
                  className="w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;