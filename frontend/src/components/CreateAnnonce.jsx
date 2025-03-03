import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CreateAnnonce = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [error, setError] = React.useState('');

  const onSubmit = async (data) => {
    try {
      const annonceData = {
        titre: data.titre,
        description: data.description,
        villeDepart: data.villeDepart,
        villeArrivee: data.villeArrivee,
        dateDepart: new Date(data.dateDepart).toISOString(),
        typeTransport: data.typeTransport,
        poids: Number(data.poids)
      };

      const response = await axios.post('http://localhost:5000/api/annonces', annonceData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      navigate('/mes-annonces');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Créer une annonce de transport</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-3">
          {/* Colonne Gauche */}
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Titre de l'annonce *</label>
              <input
                type="text"
                {...register('titre', { required: 'Ce champ est obligatoire' })}
                className={`form-control ${errors.titre ? 'is-invalid' : ''}`}
              />
              {errors.titre && <div className="invalid-feedback">{errors.titre.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Description détaillée *</label>
              <textarea
                {...register('description', { 
                  required: 'Ce champ est obligatoire',
                  minLength: {
                    value: 20,
                    message: 'Minimum 20 caractères'
                  }
                })}
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                rows="4"
              />
              {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
            </div>
          </div>

          {/* Colonne Droite */}
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Ville de départ *</label>
              <input
                type="text"
                {...register('villeDepart', { required: 'Ce champ est obligatoire' })}
                className={`form-control ${errors.villeDepart ? 'is-invalid' : ''}`}
              />
              {errors.villeDepart && <div className="invalid-feedback">{errors.villeDepart.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Ville d'arrivée *</label>
              <input
                type="text"
                {...register('villeArrivee', { required: 'Ce champ est obligatoire' })}
                className={`form-control ${errors.villeArrivee ? 'is-invalid' : ''}`}
              />
              {errors.villeArrivee && <div className="invalid-feedback">{errors.villeArrivee.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Date de départ *</label>
              <input
                type="datetime-local"
                {...register('dateDepart', { required: 'Ce champ est obligatoire' })}
                className={`form-control ${errors.dateDepart ? 'is-invalid' : ''}`}
              />
              {errors.dateDepart && <div className="invalid-feedback">{errors.dateDepart.message}</div>}
            </div>

            <div className="row g-2">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Type de transport *</label>
                  <select
                    {...register('typeTransport', { required: 'Ce champ est obligatoire' })}
                    className={`form-select ${errors.typeTransport ? 'is-invalid' : ''}`}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="express">Express</option>
                    <option value="standard">Standard</option>
                    <option value="economique">Économique</option>
                  </select>
                  {errors.typeTransport && <div className="invalid-feedback">{errors.typeTransport.message}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Poids (kg) *</label>
                  <input
                    type="number"
                    {...register('poids', { 
                      required: 'Ce champ est obligatoire',
                      min: { value: 1, message: 'Minimum 1 kg' }
                    })}
                    className={`form-control ${errors.poids ? 'is-invalid' : ''}`}
                  />
                  {errors.poids && <div className="invalid-feedback">{errors.poids.message}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" className="btn btn-primary w-100">
            Publier l'annonce
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnonce;