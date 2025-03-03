import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../services/api';
import { loginSuccess } from '../../store/slices/authSlice';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/auth/register', data);
      dispatch(loginSuccess({
        user: response.data.user,
        token: response.data.token
      }));
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur d\'inscription');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Inscription</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nom Complet</label>
            <input
              {...register('name', { required: 'Nom requis' })}
              className="w-full p-2 border rounded"
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              {...register('email', { 
                required: 'Email requis',
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              })}
              className="w-full p-2 border rounded"
            />
            {errors.email && <span className="text-red-500 text-sm">Email invalide</span>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Mot de passe</label>
            <input
              {...register('password', { 
                required: 'Mot de passe requis',
                minLength: 6 
              })}
              type="password"
              className="w-full p-2 border rounded"
            />
            {errors.password && <span className="text-red-500 text-sm">Minimum 6 caractères</span>}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Confirmer le mot de passe</label>
            <input
              {...register('confirmPassword', { 
                validate: value => value === password || 'Les mots de passe ne correspondent pas'
              })}
              type="password"
              className="w-full p-2 border rounded"
            />
            {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            S'inscrire
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-gray-600">Déjà inscrit ? </span>
          <Link to="/login" className="text-blue-500 hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;