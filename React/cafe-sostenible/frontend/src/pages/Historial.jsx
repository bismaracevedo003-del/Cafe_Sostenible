// src/pages/Historial.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_URL;

export default function Historial() {
  const [user, setUser] = useState(null);
  const [historial, setHistorial] = useState([]);
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

  // --- CARGAR HISTORIAL ---
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await fetch(`${API_BASE}/historial`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Error al cargar historial');
        const data = await res.json();
        setHistorial(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistorial();
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

  // --- FORMATEAR FECHA ---
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <p className="coffee-text">Cargando tu historial...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="coffee-text">Redirigiendo al login...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // --- RENDER ---
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
        <Link to="/noticias1" className="news-link">Noticias</Link>
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
            <Link to="/historial" className="nav-item active">
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

        {/* CONTENT - HISTORIAL */}
        <main className="content historial-content">
          <h1 className="page-title">Historial de Cálculos EUDR</h1>

          {historial.length === 0 ? (
            <div className="empty-state">
              <img src="/img/icon-history.svg" alt="Sin historial" className="empty-icon" />
              <p>No tienes cálculos guardados aún.</p>
              <Link to="/calculadora" className="btn-primary">
                Ir a la calculadora
              </Link>
            </div>
          ) : (
            <div className="historial-grid">
              {historial.map((calculo) => (
                <article key={calculo.id} className="historial-card">
                  <div className="historial-header">
                    <h3 className="finca-name">{calculo.nombre_finca}</h3>
                    <span className="calc-date">{formatDate(calculo.fecha)}</span>
                  </div>

                  <div className="historial-stats">
                    <div className="stat">
                      <span className="stat-label">Huella total</span>
                      <span className="stat-value">{calculo.huella_total.toFixed(2)} kg CO₂eq</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Por kg</span>
                      <span className="stat-value">{calculo.huella_por_kg.toFixed(2)} kg CO₂eq/kg</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Rendimiento</span>
                      <span className="stat-value">{calculo.rendimiento?.toFixed(1) || '—'} qq/ha</span>
                    </div>
                  </div>

                  <div className="historial-actions">
                    <Link
                      to={`/historial/${calculo.id}`}
                      className="btn-secondary"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ESTILOS */}
      <style jsx>{`
        .historial-content {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-title {
          font-size: 2rem;
          color: #2e7d32;
          margin-bottom: 2rem;
          text-align: center;
          font-weight: 700;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #666;
        }

        .empty-icon {
          width: 60px;
          height: 60px;
          opacity: 0.5;
          margin-bottom: 1rem;
        }

        .btn-primary,
        .btn-secondary {
          display: inline-block;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .btn-primary {
          background: #2e7d32;
          color: white;
        }

        .btn-primary:hover {
          background: #1b5e20;
          transform: translateY(-2px);
        }

        .historial-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .historial-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
        }

        .historial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }

        .historial-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .finca-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2e7d32;
          margin: 0;
        }

        .calc-date {
          font-size: 0.85rem;
          color: #888;
          white-space: nowrap;
        }

        .historial-stats {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.8rem;
          margin-bottom: 1rem;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px dashed #eee;
        }

        .stat-label {
          color: #555;
          font-size: 0.9rem;
        }

        .stat-value {
          font-weight: 600;
          color: #2e7d32;
          font-size: 0.95rem;
        }

        .historial-actions {
          text-align: right;
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #2e7d32;
          border: 1px solid #2e7d32;
        }

        .btn-secondary:hover {
          background: #2e7d32;
          color: white;
        }

        @media (max-width: 768px) {
          .historial-content {
            padding: 1rem;
          }
          .historial-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .calc-date {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}