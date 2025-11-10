// src/pages/Inicio.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_URL;

export default function Inicio() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        setTimeout(() => navigate('/login'), 1000);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
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

  if (!user) return <div className="coffee-text">Redirigiendo...</div>;

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

        {/* CONTENT - MEJORADO VISUALMENTE */}
        <main className="content">
          {/* Bienvenida con foto */}
          <section className="welcome-card">
            <div className="welcome-avatar">
              <img
                src={user.foto_src || "/img/usuarios/default-user.png"}
                alt="Foto de perfil"
                className="avatar-img"
              />
            </div>
            <h2 className="welcome-title">
              ¡Bienvenido, {user.nombre} {user.apellido}!
            </h2>
            <p className="welcome-subtitle">
              Finca: <strong>{user.nombreFinca}</strong>
            </p>
            <Link to="/calculadora" className="btn-calculate">
              Calcular Huella de Carbono
            </Link>
          </section>

          {/* Huella de carbono */}
          <section className="info-card">
            <div className="card-header">
              <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
              <h3 className="info-title">¿Qué es la huella de carbono en el café?</h3>
            </div>
            <p className="info-text">
              La <strong>huella de carbono</strong> mide las emisiones de CO₂eq generadas en todo el ciclo de vida del café: desde el cultivo, fertilización, transporte, procesamiento, hasta el consumo final.
            </p>
            <p className="info-text">
              En promedio, producir <strong>1 kg de café verde</strong> genera entre <strong>3 y 15 kg CO₂eq</strong>, dependiendo del sistema de cultivo y región.
            </p>
            <div className="highlight-box">
              <strong>Meta sostenible:</strong> Reducir a menos de <strong>2 kg CO₂eq/kg</strong> para cumplir con objetivos climáticos.
            </div>
          </section>

          {/* Cómo reducir */}
          <section className="info-card">
            <div className="card-header">
              <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <h3 className="info-title">¿Cómo reducir tu impacto?</h3>
            </div>
            <ul className="tips-list">
              <li>Usa fertilizantes orgánicos o de liberación lenta</li>
              <li>Implementa sombra con árboles nativos</li>
              <li>Optimiza el uso de agua y energía en beneficio</li>
              <li>Transporta en camiones llenos y rutas eficientes</li>
              <li>Certifícate en Rainforest Alliance o Fair Trade</li>
            </ul>
            <p className="info-text">
              Con nuestra <strong>calculadora EUDR</strong>, mide tu huella en <strong>menos de 5 minutos</strong> y obtén recomendaciones personalizadas.
            </p>
          </section>

          {/* Emisiones regionales */}
          <section className="info-card">
            <div className="card-header">
              <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M2 12h20"></path>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <h3 className="info-title">Emisiones de CO₂ en América Latina (2024)</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="flag">NI</span>
                <span className="stat-label">Nicaragua</span>
                <span className="stat-value">4.8 t</span>
              </div>
              <div className="stat-item">
                <span className="flag">CO</span>
                <span className="stat-label">Colombia</span>
                <span className="stat-value">4.2 t</span>
              </div>
              <div className="stat-item">
                <span className="flag">PE</span>
                <span className="stat-label">Perú</span>
                <span className="stat-value">3.9 t</span>
              </div>
              <div className="stat-item">
                <span className="flag">MX</span>
                <span className="stat-label">México</span>
                <span className="stat-value">4.5 t</span>
              </div>
            </div>
            <p className="info-text small">
              Fuente: Estimaciones ONU y Banco Mundial. Promedio per cápita.
            </p>
          </section>
        </main>
      </div>

      {/* ESTILOS */}
      <style jsx>{`
        /* === MAIN CONTAINER === */
        .main-container {
          display: flex;
          min-height: calc(100vh - 80px);
          background: linear-gradient(135deg, #f8f9fa 0%, #e8f5e9 100%);
        }

        /* === SIDEBAR (fijo) === */
        .sidebar {
          width: 280px;
          flex-shrink: 0;
          background: #2d6a4f;
          padding: 30px 20px;
          color: white;
        }

        .nav-menu { display: flex; flex-direction: column; gap: 12px; }
        .nav-item {
          display: flex; align-items: center; gap: 14px; padding: 14px 18px;
          color: white; text-decoration: none; border-radius: 12px;
          transition: all 0.3s ease; font-size: 15px;
        }
        .nav-item:hover { background: #3a7a5f; transform: translateX(4px); }
        .nav-item.active { background: #95d5b2; color: #1b4332; font-weight: 600; }
        .nav-icon { width: 24px; height: 24px; filter: brightness(0) invert(1); }
        .nav-item.active .nav-icon { filter: brightness(0) invert(0); }

        .logout-btn {
          margin-top: 30px; background: #d00000; color: white; padding: 12px 24px;
          border-radius: 50px; font-weight: 600; font-size: 15px; text-align: center;
          transition: all 0.3s ease; border: none; cursor: pointer;
        }
        .logout-btn:hover { background: #9b0000; transform: translateY(-2px); }

        /* === CONTENT === */
        .content {
          flex: 1; padding: 2.5rem; overflow-y: auto; font-family: 'Inter', sans-serif;
        }

        /* === BIENVENIDA CON FOTO === */
        .welcome-card {
          background: white; padding: 2.5rem; border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin-bottom: 2rem;
          text-align: center; position: relative; overflow: hidden;
        }
        .welcome-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px;
          background: linear-gradient(90deg, #2d6a4f, #95d5b2);
        }
        .welcome-avatar {
          width: 90px; height: 90px; margin: 0 auto 1rem;
          border: 4px solid #95d5b2; border-radius: 50%; overflow: hidden;
        }
        .avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .welcome-title { font-size: 1.9rem; color: #1b4332; margin: 0 0 0.5rem; font-weight: 700; }
        .welcome-subtitle { color: #555; font-size: 1rem; margin-bottom: 1.5rem; }

        .btn-calculate {
          display: inline-block; background: #2d6a4f; color: white;
          padding: 0.9rem 2rem; border-radius: 50px; font-weight: 600;
          text-decoration: none; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(45, 106, 79, 0.3);
        }
        .btn-calculate:hover {
          background: #1b4332; transform: translateY(-3px); box-shadow: 0 6px 20px rgba(45, 106, 79, 0.4);
        }

        /* === INFO CARDS === */
        .info-card {
          background: white; padding: 2rem; border-radius: 18px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.06); margin-bottom: 1.8rem;
          transition: transform 0.3s ease;
        }
        .info-card:hover { transform: translateY(-4px); }

        .card-header {
          display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem;
        }
        .icon-svg {
          width: 1.4rem; height: 1.4rem; color: #2d6a4f;
        }
        .info-title { font-size: 1.45rem; color: #1b4332; margin: 0; font-weight: 600; }

        .info-text { color: #444; line-height: 1.7; margin-bottom: 1rem; font-size: 0.95rem; }
        .info-text.small { font-size: 0.8rem; color: #777; font-style: italic; }

        .highlight-box {
          background: linear-gradient(135deg, #e8f5e9, #f1f8e9); padding: 1.2rem;
          border-radius: 14px; border-left: 5px solid #2d6a4f; margin: 1.2rem 0;
          font-weight: 500; color: #1b4332;
        }

.tips-list {
  padding-left: 0; /* Quita el padding del ul */
  margin: 1.2rem 0;
  list-style: none; /* Quita los bullets por defecto */
}

.tips-list li {
  margin-bottom: 0.7rem;
  color: #333;
  padding-left: 1.8rem; /* Espacio para el marcador */
  position: relative;
  text-align: left; /* Asegura alineación izquierda */
}

.tips-list li::before {
  content: "•"; /* Marcador personalizado */
  color: #95d5b2;
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 0;
}
        /* === ESTADÍSTICAS === */
        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 1.2rem; margin: 1.2rem 0;
        }
        .stat-item {
          text-align: center; padding: 1rem; background: linear-gradient(135deg, #f1f8e9, #e8f5e9);
          border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: transform 0.2s ease;
        }
        .stat-item:hover { transform: scale(1.05); }
        .flag {
          display: block; font-weight: bold; font-size: 1.1rem; color: #2d6a4f; margin-bottom: 0.3rem;
        }
        .stat-label { display: block; font-size: 0.9rem; color: #555; }
        .stat-value { display: block; font-size: 1.4rem; font-weight: 700; color: #1b4332; }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
          .main-container { flex-direction: column; }
          .sidebar { width: 100%; padding: 20px; }
          .content { padding: 1.5rem; }
          .welcome-title { font-size: 1.6rem; }
          .welcome-avatar { width: 70px; height: 70px; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .info-card { padding: 1.5rem; }
        }
      `}</style>
    </>
  );
}