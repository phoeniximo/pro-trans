import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart } from '../../store/slices/authSlice';
import axios from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      dispatch(loginStart());
      const response = await axios.post('/auth/login', data);
      dispatch(loginSuccess({
        user: response.data.user,
        token: response.data.token
      }));
      navigate('/dashboard');
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Erreur de connexion'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              {...register('email', { required: 'Email requis' })}
              type="email"
              className="w-full p-2 border rounded"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Mot de passe</label>
            <input
              {...register('password', { required: 'Mot de passe requis' })}
              type="password"
              className="w-full p-2 border rounded"
            />
            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
          </div>

          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Chargement...' : 'Se connecter'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link to="/register" className="text-blue-500 hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;