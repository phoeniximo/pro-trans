import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';
import Home from './features/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/Dashboard';
import CreateAnnonce from './features/annonces/CreateAnnonce';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PrivateLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-annonce" element={<CreateAnnonce />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;