// src/pages/Historial.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

// --- GRÁFICO ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_URL;

export default function Historial() {
  const [user, setUser] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- PAGINACIÓN & BÚSQUEDA ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

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

  // --- CARGAR HISTORIAL CON PAGINACIÓN ---
  useEffect(() => {
    if (!user) return;

    const fetchHistorial = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page,
          per_page: perPage,
          search,
        });
        const res = await fetch(`${API_BASE}/historial?${params}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('No se pudo cargar el historial');
        const data = await res.json();
        setHistorial(data.items || []);
        setTotal(data.total || 0);
        setPages(data.pages || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [user, page, perPage, search]);

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

  // --- GRÁFICO: solo datos de la página actual ---
  const sortedByDate = [...historial].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const chartData = {
    labels: sortedByDate.map((c) => {
      const date = new Date(c.fecha);
      return date.toLocaleDateString('es-NI', { day: 'numeric', month: 'short' });
    }),
    datasets: [
      {
        label: 'Huella Total (kg CO₂eq)',
        data: sortedByDate.map((c) => c.huella_total),
        backgroundColor: sortedByDate.map((_, i) => {
          const opacity = 0.85 - (i * 0.05);
          return `rgba(46, 125, 50, ${opacity})`;
        }),
        borderColor: '#2e7d32',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: '#1b5e20',
        hoverBorderColor: '#2e7d32',
        hoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: 'easeOutQuart' },
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14 } } },
      title: {
        display: true,
        text: 'Huella de Carbono (Página actual)',
        font: { size: 18, weight: 'bold' },
        color: '#2e7d32',
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const idx = items[0].dataIndex;
            const calc = sortedByDate[idx];
            return `${calc.nombre_finca || 'Sin nombre'} - ${formatDate(calc.fecha)}`;
          },
          label: (ctx) => {
            const calc = sortedByDate[ctx.dataIndex];
            return [
              `Total: ${calc.huella_total.toFixed(2)} kg CO₂eq`,
              `Por kg: ${calc.huella_por_kg.toFixed(2)} kg CO₂eq/kg`,
            ];
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'kg CO₂eq' } },
      x: { ticks: { maxRotation: 0 }, title: { display: true, text: 'Fecha' } },
    },
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

  if (!user) return <div className="coffee-text">Redirigiendo al login...</div>;
  if (error) return <div className="error">Error: {error}</div>;

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

          {/* CONTROLES: BÚSQUEDA + PER PAGE */}
          <div className="controls-bar">
            <input
              type="text"
              placeholder="Buscar por finca..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="search-input"
            />
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="per-page-select"
            >
              <option value={6}>6 por página</option>
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>

          {historial.length === 0 ? (
            <div className="empty-state">
              <img src="/img/icon-history.svg" alt="Sin historial" className="empty-icon" />
              <p>No tienes cálculos guardados aún.</p>
              <Link to="/calculadora" className="btn-primary">
                Ir a la calculadora
              </Link>
            </div>
          ) : (
            <>
              {/* GRÁFICO */}
              <div className="chart-wrapper">
                <div className="chart-container">
                  <Bar data={chartData} options={chartOptions} height={320} />
                </div>
              </div>

              {/* RESULTADOS */}
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
                      <Link to={`/historial/${calculo.id}`} className="btn-secondary">
                        Ver detalle
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* PAGINACIÓN */}
              {pages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="pagination-btn text-btn"
                  >
                    Anterior
                  </button>

                  {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                    const startPage = page > 3 ? page - 2 : 1;
                    const adjustedStart = Math.max(1, Math.min(startPage, pages - 4));
                    const pageNum = adjustedStart + i;
                    if (pageNum > pages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  }).filter(Boolean)}

                  {page < pages - 2 && pages > 5 && (
                    <>
                      <span className="pagination-dots">...</span>
                      <button
                        onClick={() => setPage(pages)}
                        className={`pagination-btn ${page === pages ? 'active' : ''}`}
                      >
                        {pages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pages}
                    className="pagination-btn text-btn"
                  >
                    Siguiente
                  </button>
                </div>
              )}

              <p className="results-info">
                Mostrando {historial.length} de {total} cálculos
              </p>
            </>
          )}
        </main>
      </div>

      {/* ESTILOS (sin tocar los originales) */}
      <style jsx>{`
        /* --- ESTILOS ORIGINALES (intactos) --- */
        .historial-content { padding: 2rem; max-width: 1200px; margin: 0 auto; }
        .page-title { font-size: 2rem; color: #2e7d32; margin-bottom: 2rem; text-align: center; font-weight: 700; }
        .empty-state { text-align: center; padding: 3rem 1rem; color: #666; }
        .empty-icon { width: 60px; height: 60px; opacity: 0.5; margin-bottom: 1rem; }
        .btn-primary, .btn-secondary { display: inline-block; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 0.95rem; transition: all 0.3s ease; margin-top: 1rem; }
        .btn-primary { background: #2e7d32; color: white; }
        .btn-primary:hover { background: #1b5e20; transform: translateY(-2px); }
        .historial-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .historial-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.3s ease; border: 1px solid #e0e0e0; }
        .historial-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
        .historial-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
        .finca-name { font-size: 1.2rem; font-weight: 600; color: #2e7d32; margin: 0; }
        .calc-date { font-size: 0.85rem; color: #888; white-space: nowrap; }
        .historial-stats { display: grid; grid-template-columns: 1fr; gap: 0.8rem; margin-bottom: 1rem; }
        .stat { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px dashed #eee; }
        .stat-label { color: #555; font-size: 0.9rem; }
        .stat-value { font-weight: 600; color: #2e7d32; font-size: 0.95rem; }
        .historial-actions { text-align: right; }
        .btn-secondary { background: #f8f9fa; color: #2e7d32; border: 1px solid #2e7d32; }
        .btn-secondary:hover { background: #2e7d32; color: white; }

        /* --- GRÁFICO --- */
        .chart-wrapper { margin: 2rem 0; padding: 0 0.5rem; }
        .chart-container { background: white; padding: 1.8rem; border-radius: 16px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; max-width: 100%; overflow: hidden; position: relative; }
        .chart-container::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #2e7d32, #81c784); border-radius: 16px 16px 0 0; }

        /* --- NUEVOS ESTILOS (paginación, búsqueda, etc) --- */
        .controls-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-input {
          padding: 0.6rem 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 0.95rem;
          flex: 1;
          min-width: 200px;
        }

        .per-page-select {
          padding: 0.6rem 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          background: white;
          font-size: 0.95rem;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin: 2rem 0;
          flex-wrap: wrap;
        }

        .pagination-btn {
          border: 1px solid #2e7d32;
          background: white;
          color: #2e7d32;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pagination-btn:not(.text-btn) {
          width: 32px;
          height: 32px;
          padding: 0;
          border-radius: 50%;
        }

        .pagination-btn.text-btn {
          padding: 0.3rem 0.6rem; /* antes 0.5rem 1rem */
          border-radius: 6px;
          font-size: 0.85rem; /* antes 1rem o 0.9rem */
        }


        .pagination-btn:hover:not(:disabled) {
          background: #2e7d32;
          color: white;
        }

        .pagination-btn.active {
          background: #2e7d32;
          color: white;
          font-weight: 600;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-dots {
          color: #888;
          font-size: 1.2rem;
        }

        .results-info {
          text-align: center;
          color: #666;
          font-size: 0.9rem;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .historial-content { padding: 1rem; }
          .controls-bar { flex-direction: column; }
          .search-input, .per-page-select { width: 100%; }
          .chart-container { padding: 1.2rem; }
          .chart-container::before { height: 3px; }
        }
      `}</style>
    </>
  );
}