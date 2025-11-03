// src/pages/Inicio.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_URL;

export default function Inicio() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
console.log('API_BASE:', import.meta.env.VITE_API_URL);

  useEffect(() => {
    const justLoggedIn = localStorage.getItem('justLoggedIn') === 'true';

    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/user`, {
          credentials: 'include',
        });

        if (!res.ok) {
          // Si no OK, pero acabas de loguear → espera un poco (cookie en camino)
          if (justLoggedIn) {
            console.log('Cookie en camino... reintentando en 1s');
            setTimeout(checkAuth, 1000);  // Reintenta una vez
            return;
          }
          throw new Error('No autorizado');
        }

        const data = await res.json();
        setUser(data);
        localStorage.removeItem('justLoggedIn');  // Limpia flag
      } catch (err) {
        console.error('Auth falló:', err);
        localStorage.removeItem('justLoggedIn');
        if (!justLoggedIn) {
          setTimeout(() => navigate('/index'), 800);
        } else {
          // Si falló incluso después de login → fuerza redirección
          setTimeout(() => navigate('/index'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('justLoggedIn');
    navigate('/login');
  };

  // Loader
  if (loading) {
    return (
      <div className="coffee-loader">
        <div className="coffee-cup">
          <div className="steam"></div>
          <div className="steam"></div>
          <div className="steam"></div>
        </div>
        <p className="coffee-text">Preparando tu café...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="coffee-text">Redirigiendo...</div>;
  }

  return (
    <>
      <header className="header">
        <div className="logo-section">
          <img src="/img/IMG_6194.PNG" alt="Logo" className="logo-img" />
          <div className="title-group">
            <h1 className="main-title">CAFÉ SOSTENIBLE</h1>
            <p className="subtitle">Café Sostenible Caficultura</p>
          </div>
        </div>
        <a href="#" className="news-link">Noticias</a>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <nav className="nav-menu">
            <Link to="/inicio" className="nav-item active">
              <img src="/img/icon-home.svg" alt="Inicio" className="nav-icon" />
              <span>Inicio</span>
            </Link>
            <Link to="/calculadora" className="nav-item">
              <img src="/img/icon-calculator.svg" alt="Calculadora" className="nav-icon" />
              <span>Calculadora de huella de carbono</span>
            </Link>
            <Link to="/historial" className="nav-item">
              <img src="/img/icon-history.svg" alt="Historial" className="nav-icon" />
              <span>Historial</span>
            </Link>
            <Link to="/perfil" className="nav-item">
              <img src="/img/icon-profile.svg" alt="Perfil" className="nav-icon" />
              <span>Perfil</span>
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar sesión
            </button>
          </nav>
        </aside>

        <main className="content">
          <div className="welcome-card">
            <h2>¡Bienvenido, {user.username || 'Caficultor'}! ☕</h2>
            <p>Explora las herramientas para una caficultura más sostenible.</p>
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <h3>Huella de Carbono</h3>
              <p>Calcula el impacto ambiental de tu finca.</p>
              <Link to="/calculadora" className="btn-primary">Ir a calculadora</Link>
            </div>
            <div className="card">
              <h3>Historial</h3>
              <p>Revisa tus cálculos anteriores.</p>
              <Link to="/historial" className="btn-primary">Ver historial</Link>
            </div>
            <div className="card">
              <h3>Perfil</h3>
              <p>Actualiza tu información personal.</p>
              <Link to="/perfil" className="btn-primary">Editar perfil</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}