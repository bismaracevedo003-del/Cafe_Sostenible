// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import Perfil from './pages/Perfil';
import Calculadora from './pages/Calculadora';
import Noticias from './pages/Noticias';
import './index.css';


// Componente que verifica sesión y redirige
function Root() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/user', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        console.log('Sesión activa:', data.username);
        navigate('/inicio');
      })
      .catch(() => {
        console.log('Sin sesión');
      });
  }, [navigate]);

  return <Home />; // Usa el componente Home importado
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/home" element={<Home />} />
        <Route path="/calculadora" element={<Calculadora />} />
        <Route path="/noticias" element={<Noticias />} />
      </Routes>
    </Router>
  );
}