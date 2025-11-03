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
      {/* HEADER */}
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

      {/* MAIN CONTAINER */}
      <div className="main-container">
        {/* SIDEBAR */}
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

        {/* CONTENT */}
        <main className="content">
          <div className="user-profile">
            <img
              id="user-photo"
              src={user.foto_src || "/img/usuarios/default-user.png"}
              alt="Foto de perfil"
            />
            <div>
              <h3 id="fullname">{user.nombre} {user.apellido}</h3>
              <p id="username">@{user.username}</p>
            </div>
          </div>

          <div className="cards-grid">
            <Link to="/calculadora" className="card">
              <img src="/img/icon-calculator.svg" alt="Calculadora" />
            </Link>
            <Link to="/historial" className="card">
              <img src="/img/icon-history.svg" alt="Historial" />
            </Link>
            <Link to="/perfil" className="card">
              <img src="/img/icon-profile.svg" alt="Perfil" />
            </Link>
          </div>
        </main>
      </div>

      <style jsx>{`
        .loading-screen {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 18px;
          color: #2d6a4f;
        }
      `}</style>
    </>
  );
}