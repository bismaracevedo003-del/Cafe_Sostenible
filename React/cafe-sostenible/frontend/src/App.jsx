// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import Perfil from './pages/Perfil';
import Calculadora from './pages/Calculadora';
import Noticias from './pages/Noticias';
import './index.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api'; // Usa variable de entorno

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/user`, { 
      method: 'GET', 
      credentials: 'include' 
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('No autorizado');
      })
      .then(data => {
        setIsAuthenticated(true);
        setLoading(false);
      })
      .catch(() => {
        navigate('/login');
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <div className="loading">Cargando...</div>; // Spinner simple

  return isAuthenticated ? children : null;
}

// Componente raíz con verificación
function Root() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/user`, { 
      method: 'GET', 
      credentials: 'include' 
    })
      .then(res => res.ok ? res.json() : Promise.reject('No autorizado'))
      .then(data => navigate('/inicio'))
      .catch(() => {}); // No redirige, renderiza Home
  }, [navigate]);

  return <Home />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inicio" element={<ProtectedRoute><Inicio /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/calculadora" element={<ProtectedRoute><Calculadora /></ProtectedRoute>} />
        <Route path="/noticias" element={<Noticias />} /> {/* Pública */}
        <Route path="*" element={<div>404 - Página no encontrada</div>} /> {/* 404 */}
      </Routes>
    </Router>
  );
}