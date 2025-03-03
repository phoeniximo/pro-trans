import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicLayout = () => {
  const { token } = useSelector((state) => state.auth);
  return token ? <Navigate to="/dashboard" /> : <Outlet />;
};

export default PublicLayout;