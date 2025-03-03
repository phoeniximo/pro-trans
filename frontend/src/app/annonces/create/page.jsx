'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Liste des villes marocaines
const villesMarocaines = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Meknès", "Oujda", "Kénitra", 
  "Agadir", "Tétouan", "Témara", "Safi", "Mohammédia", "El Jadida", "Béni Mellal", 
  "Nador", "Taza", "Khémisset", "Settat", "Berrechid", "Khénifra", "Larache", "Guelmim", 
  "Khouribga", "Berkane", "Taourirt", "Essaouira", "Tiflet", "Oulad Teïma", "Sidi Kacem", 
  "Youssoufia", "Ksar El Kébir", "Sidi Slimane", "Errachidia", "Guercif", "Ouazzane", 
  "Tan-Tan", "Chefchaouen", "Sefrou", "Ouarzazate", "Azrou"
];

export default function CreateAnnonce() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    titre: '',
    villeDepart: '',
    villeArrivee: '',
    dateDepart: '',
    dateFin: '',
    typeTransport: '',
    besoinService: false,
    description: '',
    poids: '',
    hauteur: '',
    largeur: '',
    longueur: '',
    volume: '',
    photos: []
  });
  const [suggestions, setSuggestions] = useState({
    depart: [],
    arrivee: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);
  
  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=annonces/create');
      return;
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } 
    else if (type === 'file') {
      handleFileChange(files);
    }
    else if (name === 'villeDepart' || name === 'villeArrivee') {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Filtrer les suggestions
      const filteredCities = villesMarocaines.filter(ville => 
        ville.toLowerCase().startsWith(value.toLowerCase())
      );
      
      if (name === 'villeDepart') {
        setSuggestions(prev => ({ ...prev, depart: filteredCities }));
      } else {
        setSuggestions(prev => ({ ...prev, arrivee: filteredCities }));
      }
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (files) => {
    if (files.length > 0) {
      const newPhotos = [...formData.photos];
      const newPreviews = [...preview];
      
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          newPhotos.push(file);
          
          // Créer URL pour prévisualisation
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviews.push(e.target.result);
            setPreview([...newPreviews]);
          };
          reader.readAsDataURL(file);
        }
      });
      
      setFormData(prev => ({ ...prev, photos: newPhotos }));
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...formData.photos];
    const newPreviews = [...preview];
    
    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFormData(prev => ({ ...prev, photos: newPhotos }));
    setPreview(newPreviews);
  };

  const selectVille = (ville, type) => {
    setFormData(prev => ({ ...prev, [type]: ville }));
    setSuggestions(prev => ({ 
      ...prev, 
      [type === 'villeDepart' ? 'depart' : 'arrivee']: [] 
    }));
  };

  const calculateVolume = () => {
    const { hauteur, largeur, longueur } = formData;
    if (hauteur && largeur && longueur) {
      const volume = (parseFloat(hauteur) * parseFloat(largeur) * parseFloat(longueur) / 1000000).toFixed(2);
      setFormData(prev => ({ ...prev, volume }));
    }
  };

  useEffect(() => {
    calculateVolume();
  }, [formData.hauteur, formData.largeur, formData.longueur]);

  const nextStep = () => {
    // Validation par étape
    if (step === 1) {
      if (!formData.titre || !formData.villeDepart || !formData.villeArrivee || !formData.dateDepart) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
    } else if (step === 2) {
      if (!formData.typeTransport || !formData.description) {
        setError('Veuillez sélectionner un type de transport et ajouter une description');
        return;
      }
    }
    
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Créer FormData pour l'envoi des fichiers
      const data = new FormData();
      
      // Ajouter les champs obligatoires explicitement
      data.append('titre', formData.titre);
      data.append('description', formData.description);
      data.append('villeDepart', formData.villeDepart);
      data.append('villeArrivee', formData.villeArrivee);
      data.append('dateDepart', new Date(formData.dateDepart).toISOString()); // Convertir en format ISO
      data.append('typeTransport', formData.typeTransport);
      
      // Ajouter les autres champs
      if (formData.dateFin) data.append('dateFin', new Date(formData.dateFin).toISOString());
      data.append('besoinService', formData.besoinService.toString());
      if (formData.poids) data.append('poids', formData.poids);
      if (formData.hauteur) data.append('hauteur', formData.hauteur);
      if (formData.largeur) data.append('largeur', formData.largeur);
      if (formData.longueur) data.append('longueur', formData.longueur);
      if (formData.volume) data.append('volume', formData.volume);
      
      // Ajouter les photos
      formData.photos.forEach(photo => {
        data.append('photos', photo);
      });

      const token = localStorage.getItem('token');
      
      // Debug - afficher les données envoyées
      console.log('Données envoyées:', Object.fromEntries(data.entries()));
      
      const response = await fetch('http://localhost:5000/api/annonces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Réponse d\'erreur complète:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la création de l\'annonce');
      }

      router.push('/annonces');
    } catch (error) {
      console.error('Erreur complète:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* En-tête */}
        <div className="p-6 bg-blue-600 text-white">
          <h1 className="text-2xl font-bold">Créer une annonce de transport</h1>
          <p className="mt-2 text-blue-100">Trouvez un transporteur pour votre objet ou marchandise</p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex justify-between px-6 pt-6">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${step >= 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-500'}`}>
              1
            </div>
            <span className={`mt-2 text-sm ${step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Trajet</span>
          </div>
          <div className="flex-1 flex items-center">
            <div className={`flex-1 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${step >= 2 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-500'}`}>
              2
            </div>
            <span className={`mt-2 text-sm ${step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Envoi</span>
          </div>
          <div className="flex-1 flex items-center">
            <div className={`flex-1 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${step >= 3 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-500'}`}>
              3
            </div>
            <span className={`mt-2 text-sm ${step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Détails</span>
          </div>
          <div className="flex-1 flex items-center">
            <div className={`flex-1 h-1 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${step >= 4 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-500'}`}>
              4
            </div>
            <span className={`mt-2 text-sm ${step >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Finaliser</span>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Étape 1: Trajet */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Informations sur le trajet</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Titre de l'annonce*</label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Canapé à transporter de Casablanca à Rabat"
                  required
                />
              </div>

              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-gray-700 font-medium mb-2">Ville de départ*</label>
                  <input
                    type="text"
                    name="villeDepart"
                    value={formData.villeDepart}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Commencez à taper..."
                    required
                  />
                  {suggestions.depart.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {suggestions.depart.map((ville, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectVille(ville, 'villeDepart')}
                        >
                          {ville}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 font-medium mb-2">Ville d'arrivée*</label>
                  <input
                    type="text"
                    name="villeArrivee"
                    value={formData.villeArrivee}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Commencez à taper..."
                    required
                  />
                  {suggestions.arrivee.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {suggestions.arrivee.map((ville, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectVille(ville, 'villeArrivee')}
                        >
                          {ville}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Date de début*</label>
                  <input
                    type="date"
                    name="dateDepart"
                    value={formData.dateDepart}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Date de fin (optionnel)</label>
                  <input
                    type="date"
                    name="dateFin"
                    value={formData.dateFin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={formData.dateDepart || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Informations sur l'envoi */}
          {step === 2 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Informations sur votre envoi</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Type de transport*</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["meuble", "marchandise", "bagage", "palette", "demenagement"].map(type => (
                    <div 
                      key={type}
                      className={`border p-4 rounded-lg cursor-pointer transition-all ${
                        formData.typeTransport === type 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:border-blue-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, typeTransport: type }))}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border ${
                          formData.typeTransport === type 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-400'
                        } mr-3`}>
                          {formData.typeTransport === type && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <span className="capitalize">{type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="besoinService"
                    name="besoinService"
                    checked={formData.besoinService}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600"
                  />
                  <label htmlFor="besoinService" className="ml-2 text-gray-700">
                    Besoin de services de chargement et de déchargement
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Description de l'envoi*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Décrivez votre envoi (type d'objets, quantité, particularités...)"
                  required
                ></textarea>
              </div>
            </div>
          )}

          {/* Étape 3: Détails supplémentaires */}
          {step === 3 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Détails de l'envoi</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Poids approximatif (kg)</label>
                <input
                  type="number"
                  name="poids"
                  value={formData.poids}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 50"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Dimensions (cm)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Hauteur</label>
                    <input
                      type="number"
                      name="hauteur"
                      value={formData.hauteur}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 80"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Largeur</label>
                    <input
                      type="number"
                      name="largeur"
                      value={formData.largeur}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 120"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Longueur</label>
                    <input
                      type="number"
                      name="longueur"
                      value={formData.longueur}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 200"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {formData.volume && (
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      <strong>Volume calculé :</strong> {formData.volume} m³
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Photos de l'envoi</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileChange(e.target.files)}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="mt-2 text-gray-600">Cliquez pour ajouter des photos</span>
                      <span className="mt-1 text-sm text-gray-500">PNG, JPG, GIF jusqu'à 5 MB</span>
                    </div>
                  </label>
                </div>
              </div>

              {preview.length > 0 && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Aperçu des photos</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {preview.map((src, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={src} 
                          alt={`Aperçu ${index + 1}`} 
                          className="h-32 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Étape 4: Récapitulatif */}
          {step === 4 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Récapitulatif de votre annonce</h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{formData.titre}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Trajet</h4>
                    <div className="bg-white rounded p-3 border">
                      <div className="flex items-center text-blue-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">De {formData.villeDepart} à {formData.villeArrivee}</span>
                      </div>
                      <div className="ml-7">
                        <div className="text-gray-600">
                          Disponible du {new Date(formData.dateDepart).toLocaleDateString('fr-FR')}
                          {formData.dateFin && ` au ${new Date(formData.dateFin).toLocaleDateString('fr-FR')}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Type de transport</h4>
                    <div className="bg-white rounded p-3 border">
                      <div className="flex items-center">
                        <span className="capitalize">{formData.typeTransport}</span>
                        {formData.besoinService && (
                          <span className="ml-3 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Besoin de chargement/déchargement
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                  <div className="bg-white rounded p-4 border">
                    <p className="text-gray-700 whitespace-pre-line">{formData.description}</p>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Assurez-vous que les informations fournies sont exactes et complètes. Les transporteurs baseront leurs devis sur ces informations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="p-6 bg-gray-50 border-t flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Précédent
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Publication en cours...' : 'Publier l\'annonce'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}