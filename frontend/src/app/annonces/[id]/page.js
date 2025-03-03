'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function AnnonceDetail() {
  const params = useParams();
  const router = useRouter();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [avis, setAvis] = useState([]);
  const [newAvis, setNewAvis] = useState({
    note: 5,
    commentaire: ''
  });
  const [avisEnvoye, setAvisEnvoye] = useState(false);
  const [showDevisForm, setShowDevisForm] = useState(false);
  const [devis, setDevis] = useState({
    montant: '',
    description: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
    }
    if (params?.id) {
      fetchAnnonce();
    }
  }, [params?.id]);

  useEffect(() => {
    if (annonce?.transporteur?._id) {
      fetchAvis();
    }
  }, [annonce]);

  const fetchAnnonce = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/annonces/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du chargement de l\'annonce');
      }

      setAnnonce(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvis = async () => {
    try {
      // Charger les avis du transporteur assigné à l'annonce, pas de l'auteur
      const transporteurId = annonce.transporteur._id;
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/avis/utilisateur/${transporteurId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des avis');
      }
      
      const data = await response.json();
      setAvis(Array.isArray(data) ? data : []);
      
      // Vérifier si l'utilisateur courant a déjà donné son avis pour cette annonce
      if (currentUser && data.some(a => 
        a.auteur._id === currentUser.id && 
        a.annonce._id === annonce._id
      )) {
        setAvisEnvoye(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      setAvis([]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destinataire: annonce.auteur._id,
          annonce: annonce._id,
          contenu: message
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      setMessage('');
      alert('Message envoyé avec succès!');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmitDevis = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/devis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          annonce: annonce._id,
          montant: parseFloat(devis.montant),
          description: devis.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi du devis');
      }

      setDevis({ montant: '', description: '' });
      setShowDevisForm(false);
      alert('Devis envoyé avec succès!');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAvisSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // Vérifier que l'utilisateur est l'auteur de l'annonce
    if (currentUser.id !== annonce.auteur._id) {
      setError('Seul l\'annonceur peut donner un avis au transporteur');
      return;
    }

    // Vérifier que le devis a été accepté
    if (!annonce.devisAccepte) {
      setError('Vous ne pouvez donner un avis qu\'après avoir accepté un devis');
      return;
    }

    // Vérifier qu'un transporteur a été assigné
    if (!annonce.transporteur || !annonce.transporteur._id) {
      setError('Aucun transporteur n\'a été assigné à cette annonce');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/avis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destinataire: annonce.transporteur._id,
          annonce: annonce._id,
          note: newAvis.note,
          commentaire: newAvis.commentaire
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi de l\'avis');
      }

      setAvisEnvoye(true);
      fetchAvis();
      setNewAvis({ note: 5, commentaire: '' });
      alert('Avis envoyé avec succès!');
    } catch (error) {
      setError(error.message);
    }
  };

  const renderStars = (note) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`text-2xl ${index < note ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  // Vérifier si l'utilisateur peut donner un avis (annonceur + devis accepté + transport terminé)
  const canGiveRating = () => {
    if (!isLoggedIn || !currentUser || !annonce) return false;
    
    return (
      currentUser.id === annonce.auteur._id &&
      annonce.statut === 'terminee' &&
      annonce.devisAccepte &&
      annonce.transporteur &&
      !annonce.avisDepose
    );
  };

  // Vérifier si l'utilisateur peut proposer un devis (transporteur + annonce active)
  const canSubmitOffer = () => {
    if (!isLoggedIn || !currentUser || !annonce) return false;
    
    return (
      currentUser.type === 'transporteur' &&
      annonce.statut === 'active' &&
      currentUser.id !== annonce.auteur._id
    );
  };
  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!annonce) {
    return <div className="text-center py-8">Annonce non trouvée</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Statut de l'annonce */}
        <div className="p-2 text-center text-white font-medium" 
             style={{ 
               backgroundColor: 
                 annonce.statut === 'active' ? '#4CAF50' : 
                 annonce.statut === 'devis_recu' ? '#2196F3' :
                 annonce.statut === 'devis_accepte' ? '#FF9800' : 
                 '#9E9E9E'
             }}>
          {annonce.statut === 'active' && 'Annonce active'}
          {annonce.statut === 'devis_recu' && 'Devis reçus'}
          {annonce.statut === 'devis_accepte' && 'Transport en cours'}
          {annonce.statut === 'terminee' && 'Transport terminé'}
        </div>

        {/* En-tête */}
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold mb-2">{annonce.titre}</h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div>
              <span className="font-semibold">Type:</span> {annonce.typeTransport}
            </div>
            <div>
              <span className="font-semibold">Date de départ:</span>{' '}
              {new Date(annonce.dateDepart).toLocaleDateString()}
            </div>
            {annonce.budget && (
              <div>
                <span className="font-semibold">Budget:</span> {annonce.budget} DH
              </div>
            )}
          </div>
        </div>

        {/* Trajet */}
        <div className="p-6 bg-blue-50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <div className="text-sm text-gray-600">Départ</div>
              <div className="text-xl font-bold">{annonce.villeDepart}</div>
            </div>
            <div className="my-4 md:my-0">
              <div className="w-20 h-0.5 md:w-32 bg-blue-500"></div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-sm text-gray-600">Arrivée</div>
              <div className="text-xl font-bold">{annonce.villeArrivee}</div>
            </div>
          </div>
        </div>

        {/* Description et détails */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-700 mb-6">{annonce.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {annonce.poids && (
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Poids</div>
                <div className="font-semibold">{annonce.poids} kg</div>
              </div>
            )}
            {annonce.volume && (
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Volume</div>
                <div className="font-semibold">{annonce.volume} m³</div>
              </div>
            )}
          </div>
        </div>

        {/* Informations de contact et messagerie */}
        {annonce.auteur && (
          <div className="p-6 border-t bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <div className="flex items-center space-x-4">
              <div>
                <div className="font-semibold">{annonce.auteur.nom}</div>
                <div className="text-gray-600">{annonce.auteur.ville}</div>
              </div>
            </div>

            {!showContact ? (
              <button
                onClick={() => setShowContact(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Afficher les coordonnées
              </button>
            ) : (
              <>
                <div className="mt-4 space-y-2 mb-6">
                  <div>
                    <span className="font-semibold">Email:</span> {annonce.auteur.email}
                  </div>
                  <div>
                    <span className="font-semibold">Téléphone:</span> {annonce.auteur.telephone}
                  </div>
                </div>

                {isLoggedIn && currentUser?.id !== annonce.auteur._id && (
                  <div className="mt-6 p-4 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3">Envoyer un message</h3>
                    <form onSubmit={sendMessage} className="space-y-4">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                        rows="4"
                        placeholder="Écrivez votre message..."
                        required
                      ></textarea>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Envoyer le message
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Formulaire de devis pour les transporteurs */}
        {canSubmitOffer() && (
          <div className="p-6 border-t">
            {!showDevisForm ? (
              <button
                onClick={() => setShowDevisForm(true)}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Proposer un devis
              </button>
            ) : (
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Proposer un devis</h3>
                <form onSubmit={handleSubmitDevis} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Montant (DH)</label>
                    <input
                      type="number"
                      value={devis.montant}
                      onChange={(e) => setDevis({...devis, montant: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Description</label>
                    <textarea
                      value={devis.description}
                      onChange={(e) => setDevis({...devis, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      rows="4"
                      required
                      placeholder="Décrivez les conditions de votre offre..."
                    ></textarea>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Envoyer le devis
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDevisForm(false)}
                      className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Section des avis (uniquement visible si un transporteur est assigné) */}
        {annonce.transporteur && (
          <div className="p-6 border-t">
            <h2 className="text-xl font-semibold mb-4">
              Avis sur le transporteur
            </h2>

            {/* Formulaire d'avis (uniquement pour l'annonceur après devis accepté) */}
            {canGiveRating() && !avisEnvoye && (
              <form onSubmit={handleAvisSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Évaluer le transporteur</h3>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Note</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((note) => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => setNewAvis(prev => ({ ...prev, note }))}
                        className={`text-2xl focus:outline-none ${
                          note <= newAvis.note ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Commentaire</label>
                  <textarea
                    value={newAvis.commentaire}
                    onChange={(e) => setNewAvis(prev => ({ 
                      ...prev, 
                      commentaire: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    rows="4"
                    minLength="10"
                    maxLength="500"
                    required
                    placeholder="Partagez votre expérience avec ce transporteur (minimum 10 caractères)"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Envoyer l'avis
                </button>
              </form>
            )}

            {/* Liste des avis */}
            <div className="space-y-4">
              {avis.map((a) => (
                <div key={a._id} className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{a.auteur.nom}</div>
                      <div className="text-gray-600 text-sm">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>{renderStars(a.note)}</div>
                  </div>
                  <p className="mt-2 text-gray-700">{a.commentaire}</p>
                </div>
              ))}

              {avis.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Aucun avis pour le moment
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages d'erreur globaux */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Confirmation d'envoi d'avis */}
      {avisEnvoye && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
          Votre avis a été envoyé avec succès !
        </div>
      )}
    </div>
  );
}