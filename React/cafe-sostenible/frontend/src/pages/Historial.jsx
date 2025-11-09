// src/pages/Historial.jsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 6;

export default function Historial() {
  const [user, setUser] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // --- AUTENTICACIÓN ---
  useEffect(() => {
    const justLoggedIn = localStorage.getItem('justLoggedIn') === 'true';
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/user`, { credentials: 'include' });
        if (!res.ok) {
          if (justLoggedIn) { setTimeout(checkAuth, 1000); return; }
          throw new Error('No autorizado');
        }
        const data = await res.json();
        setUser(data);
        localStorage.removeItem('justLoggedIn');
      } catch (err) {
        localStorage.removeItem('justLoggedIn');
        setTimeout(() => navigate('/login'), 800);
      }
    };
    checkAuth();
  }, [navigate]);

// --- CARGAR HISTORIAL ---
useEffect(() => {
  if (!user) return;
  const fetchHistorial = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/historial`, { credentials: 'include' });
      if (!res.ok) throw new Error('No se pudo cargar el historial');
      
      const data = await res.json();

      // AQUÍ ESTÁ LA CLAVE
      const items = Array.isArray(data) ? data : (data.items || []);
      setHistorial(items); // ← siempre un array
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchHistorial();
}, [user]);

  // --- LOGOUT ---
  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem('justLoggedIn');
    navigate('/login');
  };

  // --- DATOS PARA GRÁFICO ---
const chartData = useMemo(() => {
  if (!Array.isArray(historial) || historial.length === 0) return [];

  const grouped = {};
  historial.forEach(c => {
    const date = new Date(c.fecha);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[monthKey]) {
      grouped[monthKey] = { total: 0, count: 0, rendimiento: 0, porKg: 0 };
    }
    grouped[monthKey].total += c.huella_total || 0;
    grouped[monthKey].count += 1;
    grouped[monthKey].rendimiento += c.rendimiento || 0;
    grouped[monthKey].porKg += c.huella_por_kg || 0;
  });

  return Object.entries(grouped)
    .map(([month, data]) => ({
      mes: new Date(month + '-01').toLocaleDateString('es-NI', { year: 'numeric', month: 'short' }),
      huellaTotal: data.total.toFixed(1),
      huellaPorKg: data.count > 0 ? (data.porKg / data.count).toFixed(2) : '0',
      rendimiento: data.count > 0 ? (data.rendimiento / data.count).toFixed(1) : '0',
    }))
    .sort((a, b) => new Date(a.mes) - new Date(b.mes));
}, [historial]);

  // --- FILTROS Y PAGINACIÓN ---
  const filtered = useMemo(() => {
    return historial.filter(c =>
      c.nombre_finca.toLowerCase().includes(search.toLowerCase())
    );
  }, [historial, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- LOADER ---
  if (loading) {
    return (
      <div className="coffee-loader" aria-label="Cargando historial">
        <div className="coffee-cup">
          <div className="steam"></div>
          <div className="steam"></div>
          <div className="steam"></div>
        </div>
        <p className="coffee-text">Cargando tu historial...</p>
      </div>
    );
  }

  if (!user) return <div className="coffee-text">Redirigiendo...</div>;
  if (error) return <div className="error" role="alert">Error: {error}</div>;

  // --- RENDER ---
  return (
    <>
      {/* HEADER */}
      <header className="header" role="banner">
        <div className="logo-section">
          <Link to="/inicio"><img src="/img/IMG_6194.PNG" alt="Logo Café Sostenible" className="logo-img" /></Link>
          <div className="title-group">
            <h1 className="main-title">CAFÉ SOSTENIBLE</h1>
            <p className="subtitle">Café Sostenible Caficultura</p>
          </div>
        </div>
        <Link to="/noticias1" className="news-link">Noticias</Link>
      </header>

      <div className="main-container">
        {/* SIDEBAR */}
        <aside className="sidebar" aria-label="Menú de navegación">
          <nav className="nav-menu">
            <Link to="/inicio" className="nav-item"><img src="/img/icon-home.svg" alt="" /> <span>Inicio</span></Link>
            <Link to="/calculadora" className="nav-item"><img src="/img/icon-calculator.svg" alt="" /> <span>Calculadora</span></Link>
            <Link to="/historial" className="nav-item active"><img src="/img/icon-history.svg" alt="" /> <span>Historial</span></Link>
            <Link to="/perfil" className="nav-item"><img src="/img/icon-profile.svg" alt="" /> <span>Perfil</span></Link>
            <button onClick={handleLogout} className="logout-btn" aria-label="Cerrar sesión">Cerrar sesión</button>
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="content historial-content" aria-labelledby="historial-title">
          <h1 id="historial-title" className="page-title">Historial de Cálculos EUDR</h1>

          {/* GRÁFICO */}
          {chartData.length > 0 && (
            <div className="chart-container">
              <h2 className="chart-title">Evolución de tu Huella de Carbono</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: '1px solid #ccc', borderRadius: 8 }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="huellaTotal" stroke="#2e7d32" name="Huella Total (kg CO₂eq)" strokeWidth={3} dot={{ fill: '#2e7d32' }} />
                  <Line yAxisId="right" type="monotone" dataKey="huellaPorKg" stroke="#f59e0b" name="Huella por kg" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                  <Line yAxisId="right" type="monotone" dataKey="rendimiento" stroke="#10b981" name="Rendimiento (qq/ha)" strokeWidth={2} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* BUSCADOR */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por nombre de finca..."
              value={search}
              onChange={handleSearch}
              className="search-input"
              aria-label="Buscar en historial"
            />
          </div>

          {/* ESTADO VACÍO */}
          {filtered.length === 0 && !loading && (
            <div className="empty-state" role="status">
              <img src="/img/icon-history.svg" alt="" className="empty-icon" />
              <p>{search ? 'No se encontraron resultados.' : 'Aún no tienes cálculos.'}</p>
              <Link to="/calculadora" className="btn-primary">Ir a la calculadora</Link>
            </div>
          )}

          {/* LISTADO */}
          {paginated.length > 0 && (
            <>
              <div className="historial-grid" role="list">
                {paginated.map((calculo) => (
                  <article key={calculo.id} className="historial-card" role="listitem">
                    <div className="historial-header">
                      <h3 className="finca-name">{calculo.nombre_finca}</h3>
                      <time className="calc-date" dateTime={calculo.fecha}>
                        {formatDate(calculo.fecha)}
                      </time>
                    </div>

                    <dl className="historial-stats">
                      <div className="stat">
                        <dt className="stat-label">Huella total</dt>
                        <dd className="stat-value">{calculo.huella_total.toFixed(2)} kg CO₂eq</dd>
                      </div>
                      <div className="stat">
                        <dt className="stat-label">Por kg</dt>
                        <dd className="stat-value">{calculo.huella_por_kg.toFixed(2)} kg CO₂eq/kg</dd>
                      </div>
                      <div className="stat">
                        <dt className="stat-label">Rendimiento</dt>
                        <dd className="stat-value">{calculo.rendimiento?.toFixed(1) || '—'} qq/ha</dd>
                      </div>
                    </dl>

                    <div className="historial-actions">
                      <Link to={`/historial/${calculo.id}`} className="btn-secondary">
                        Ver detalle
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <nav className="pagination" aria-label="Paginación">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="page-btn">Anterior</button>
                  <span className="page-info">Página {page} de {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="page-btn">Siguiente</button>
                </nav>
              )}
            </>
          )}
        </main>
      </div>

      {/* ESTILOS */}
     
    </>
  );
}