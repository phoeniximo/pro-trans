import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../../services/api';

const CreateAnnonce = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post('/annonces', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Annonce créée:', response.data);
      // Redirection ou mise à jour de la liste
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Créer une annonce</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-2">Titre</label>
          <input
            {...register('title', { required: 'Titre requis' })}
            className="w-full p-2 border rounded"
          />
          {errors.title && <span className="text-red-500">{errors.title.message}</span>}
        </div>

        <div>
          <label className="block mb-2">Description</label>
          <textarea
            {...register('description', { required: 'Description requise' })}
            className="w-full p-2 border rounded h-32"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Poids (kg)</label>
            <input
              type="number"
              {...register('weight', { required: 'Poids requis' })}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2">Type de transport</label>
            <select
              {...register('transportType', { required: 'Type requis' })}
              className="w-full p-2 border rounded"
            >
              <option value="">Sélectionner...</option>
              <option value="express">Express</option>
              <option value="standard">Standard</option>
              <option value="economique">Économique</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Envoi en cours...' : 'Créer l\'annonce'}
        </button>
        
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default CreateAnnonce;