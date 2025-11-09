// src/pages/Noticias.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_URL;

export default function Noticias() {
  const [user, setUser] = useState(null);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- AUTENTICACIÓN ---
  useEffect(() => {
    const justLoggedIn = localStorage.getItem('justLoggedIn') === 'true';

    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/user`, {
          credentials: 'include',
        });

        if (!res.ok) {
          if (justLoggedIn) {
            console.log('Cookie en camino... reintentando en 1s');
            setTimeout(checkAuth, 1000);
            return;
          }
          throw new Error('No autorizado');
        }

        const data = await res.json();
        setUser(data);
        localStorage.removeItem('justLoggedIn');
      } catch (err) {
        console.error('Auth falló:', err);
        localStorage.removeItem('justLoggedIn');
        setTimeout(() => navigate('/login'), 800);
      }
    };

    checkAuth();
  }, [navigate]);

  // --- CARGAR NOTICIAS ---
  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const res = await fetch(`${API_BASE}/noticias`);
        if (!res.ok) throw new Error('Error al cargar noticias');
        const data = await res.json();
        setNoticias(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNoticias();
    }
  }, [user]);

  // --- LOGOUT ---
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    localStorage.removeItem('justLoggedIn');
    navigate('/login');
  };

  // --- LOADER ---
  if (loading) {
    return (
      <div className="coffee-loader">
        <div className="coffee-cup">
          <div className="steam"></div>
          <div className="steam"></div>
          <div className="steam"></div>
        </div>
        <p className="coffee-text">Cargando tus noticias...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="coffee-text">Redirigiendo al login...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // --- FUNCIÓN PARA LIMPIAR SNIPPET ---
  const formatSnippet = (text) => {
    if (!text) return "Sin resumen disponible.";
    const loremPattern = /lorem|sed ut perspiciatis|suspendisse/i;
    if (loremPattern.test(text)) {
      return "Explora esta noticia sobre café sostenible y EUDR.";
    }
    return text.length > 130 ? text.substring(0, 127) + "..." : text;
  };

  // --- RENDER FINAL ---
  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="logo-section">
          <Link to="/inicio">
            <img src="/img/IMG_6194.PNG" alt="Logo" className="logo-img" />
          </Link>
          <div className="title-group">
            <h1 className="main-title">CAFÉ SOSTENIBLE</h1>
            <p className="subtitle">Café Sostenible Caficultura</p>
          </div>
        </div>
        <Link to="/noticias" className="news-link active">Noticias</Link>
      </header>

      {/* MAIN CONTAINER */}
      <div className="main-container">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <nav className="nav-menu">
            <Link to="/inicio" className="nav-item">
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

        {/* CONTENT - NOTICIAS */}
        <main className="content news-content">
          <h1 className="page-title">Noticias sobre Café Sostenible y EUDR</h1>
          <div className="news-grid">
            {noticias.map((noticia) => (
              <article key={noticia.url} className="news-card">
                {/* Imagen */}
                {noticia.image ? (
                  <a href={noticia.url} target="_blank" rel="noopener noreferrer" className="news-card-img-link">
                    <img
                      src={noticia.image}
                      alt={noticia.title}
                      className="news-card-img"
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <div className="news-card-img-placeholder">
                    <span>Sin imagen</span>
                  </div>
                )}

                {/* Texto */}
                <div className="news-card-content">
                  <h2 className="news-card-title">
                    <a href={noticia.url} target="_blank" rel="noopener noreferrer">
                      {noticia.title}
                    </a>
                  </h2>
                  <p className="news-card-date">{noticia.date}</p>
                  <p className="news-card-snippet">{formatSnippet(noticia.snippet)}</p>
                  <a href={noticia.url} className="news-card-link" target="_blank" rel="noopener noreferrer">
                    Leer más
                  </a>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>

      {/* ESTILOS GLOBALES (puedes mover a index.css) */}
      <style jsx>{`
        .news-content {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-title {
          font-size: 2rem;
          color: #2e7d32;
          margin-bottom: 1.5rem;
          text-align: center;
          font-weight: 700;
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .news-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .news-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }

        .news-card-img-link {
          display: block;
          height: 180px;
          overflow: hidden;
        }

        .news-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .news-card-img-link:hover .news-card-img {
          transform: scale(1.05);
        }

        .news-card-img-placeholder {
          height: 180px;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-style: italic;
        }

        .news-card-content {
          padding: 1rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .news-card-title a {
          color: #2e7d32;
          font-size: 1.1rem;
          font-weight: 600;
          text-decoration: none;
          line-height: 1.4;
          margin-bottom: 0.5rem;
          display: block;
        }

        .news-card-title a:hover {
          color: #1b5e20;
          text-decoration: underline;
        }

        .news-card-date {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .news-card-snippet {
          font-size: 0.95rem;
          color: #444;
          margin: 0 0 1rem 0;
          flex-grow: 1;
          line-height: 1.5;
        }

        .news-card-link {
          align-self: flex-start;
          padding: 0.5rem 1rem;
          background: #2e7d32;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: background 0.3s ease;
        }

        .news-card-link:hover {
          background: #1b5e20;
        }

        @media (max-width: 768px) {
          .news-grid {
            grid-template-columns: 1fr;
          }
          .news-content {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
}