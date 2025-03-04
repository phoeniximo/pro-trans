import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  MapPinIcon,
  TruckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '../ui/Button';

const AdvancedSearchComponent = ({ onSearch, initialFilters = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    villeDepart: '',
    villeArrivee: '',
    typeTransport: '',
    dateDepartMin: null,
    dateDepartMax: null,
    poids: '',
    volume: '',
    isUrgent: false,
    ...initialFilters
  });

  // Parse search params from URL on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlFilters = {};

    // Extract search parameters
    if (searchParams.has('villeDepart')) urlFilters.villeDepart = searchParams.get('villeDepart');
    if (searchParams.has('villeArrivee')) urlFilters.villeArrivee = searchParams.get('villeArrivee');
    if (searchParams.has('typeTransport')) urlFilters.typeTransport = searchParams.get('typeTransport');
    if (searchParams.has('dateDepartMin')) urlFilters.dateDepartMin = new Date(searchParams.get('dateDepartMin'));
    if (searchParams.has('dateDepartMax')) urlFilters.dateDepartMax = new Date(searchParams.get('dateDepartMax'));
    if (searchParams.has('poids')) urlFilters.poids = searchParams.get('poids');
    if (searchParams.has('volume')) urlFilters.volume = searchParams.get('volume');
    if (searchParams.has('isUrgent')) urlFilters.isUrgent = searchParams.get('isUrgent') === 'true';

    // Show filter section if any advanced filter is applied
    if (
      Object.keys(urlFilters).some(key => 
        !['villeDepart', 'villeArrivee', 'typeTransport'].includes(key) && 
        urlFilters[key] !== null && 
        urlFilters[key] !== ''
      )
    ) {
      setShowFilters(true);
    }

    // Update filters state with URL parameters
    if (Object.keys(urlFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...urlFilters }));
    }
  }, [location.search]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle date change
  const handleDateChange = (date, field) => {
    setFilters({
      ...filters,
      [field]: date
    });
  };

  // Toggle advanced filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      villeDepart: '',
      villeArrivee: '',
      typeTransport: '',
      dateDepartMin: null,
      dateDepartMax: null,
      poids: '',
      volume: '',
      isUrgent: false
    });
    
    // Also update URL
    navigate('/annonces');
    
    // Call the search function with empty filters
    if (onSearch) {
      onSearch({});
    }
  };

  // Submit search
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build search query
    const searchParams = new URLSearchParams();
    
    // Add only non-empty parameters
    if (filters.villeDepart) searchParams.append('villeDepart', filters.villeDepart);
    if (filters.villeArrivee) searchParams.append('villeArrivee', filters.villeArrivee);
    if (filters.typeTransport) searchParams.append('typeTransport', filters.typeTransport);
    if (filters.dateDepartMin) searchParams.append('dateDepartMin', filters.dateDepartMin.toISOString());
    if (filters.dateDepartMax) searchParams.append('dateDepartMax', filters.dateDepartMax.toISOString());
    if (filters.poids) searchParams.append('poids', filters.poids);
    if (filters.volume) searchParams.append('volume', filters.volume);
    if (filters.isUrgent) searchParams.append('isUrgent', filters.isUrgent);
    
    // Update URL with search params
    navigate({
      pathname: '/annonces',
      search: searchParams.toString()
    });
    
    // Call the search function if provided
    if (onSearch) {
      onSearch(filters);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          {/* Basic Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="villeDepart"
                value={filters.villeDepart}
                onChange={handleChange}
                placeholder="Ville de départ"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="villeArrivee"
                value={filters.villeArrivee}
                onChange={handleChange}
                placeholder="Ville d'arrivée"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TruckIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="typeTransport"
                value={filters.typeTransport}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Type de transport</option>
                <option value="colis">Colis</option>
                <option value="meuble">Meuble</option>
                <option value="marchandise">Marchandise</option>
                <option value="palette">Palette</option>
                <option value="demenagement">Déménagement</option>
                <option value="vehicule">Véhicule</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div className="md:w-auto">
              <Button
                type="submit"
                variant="primary"
                className="w-full md:w-auto"
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-1" />
                Rechercher
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters Toggle */}
          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center"
              onClick={toggleFilters}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-1" />
              {showFilters ? 'Masquer les filtres avancés' : 'Afficher les filtres avancés'}
            </button>
            
            {(filters.dateDepartMin || filters.dateDepartMax || filters.poids || filters.volume || filters.isUrgent) && (
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                onClick={clearFilters}
              >
                <XMarkIcon className="h-5 w-5 mr-1 inline-block" />
                Effacer les filtres
              </button>
            )}
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de départ (entre)
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <DatePicker
                      selected={filters.dateDepartMin}
                      onChange={(date) => handleDateChange(date, 'dateDepartMin')}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      placeholderText="Date min"
                      dateFormat="dd/MM/yyyy"
                      isClearable
                    />
                  </div>
                  <span className="text-gray-500">et</span>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <DatePicker
                      selected={filters.dateDepartMax}
                      onChange={(date) => handleDateChange(date, 'dateDepartMax')}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      placeholderText="Date max"
                      dateFormat="dd/MM/yyyy"
                      isClearable
                      minDate={filters.dateDepartMin || null}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="poids" className="block text-sm font-medium text-gray-700 mb-1">
                    Poids max (kg)
                  </label>
                  <input
                    type="number"
                    id="poids"
                    name="poids"
                    value={filters.poids}
                    onChange={handleChange}
                    placeholder="Ex: 100"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-1">
                    Volume max (m³)
                  </label>
                  <input
                    type="number"
                    id="volume"
                    name="volume"
                    value={filters.volume}
                    onChange={handleChange}
                    placeholder="Ex: 2"
                    min="0"
                    step="0.1"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isUrgent"
                    name="isUrgent"
                    checked={filters.isUrgent}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isUrgent" className="ml-2 block text-sm text-gray-700">
                    Urgences uniquement
                  </label>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearchComponent;