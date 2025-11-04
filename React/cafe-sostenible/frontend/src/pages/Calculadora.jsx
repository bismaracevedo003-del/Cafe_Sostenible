// src/pages/Calculadora.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_URL;

const COLORS = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'];

export default function Calculadora() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Formulario
  const [form, setForm] = useState({
    nombreFinca: '',
    hectareas: '',
    fertilizanteN: '',
    fertilizanteP: '',
    fertilizanteK: '',
    dieselMaquinaria: '',
    gasolinaTransporte: '',
    electricidad: '',
    residuosOrganicos: '',
  });

  const [resultado, setResultado] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/user`, { credentials: 'include' });
        if (!res.ok) throw new Error('No autorizado');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        navigate('/index');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const calcularHuella = (e) => {
    e.preventDefault();

    const {
      hectareas,
      fertilizanteN,
      fertilizanteP,
      fertilizanteK,
      dieselMaquinaria,
      gasolinaTransporte,
      electricidad,
      residuosOrganicos,
    } = form;

    const h = parseFloat(hectareas) || 0;
    const n = parseFloat(fertilizanteN) || 0;
    const p = parseFloat(fertilizanteP) || 0;
    const k = parseFloat(fertilizanteK) || 0;
    const diesel = parseFloat(dieselMaquinaria) || 0;
    const gasolina = parseFloat(gasolinaTransporte) || 0;
    const kwh = parseFloat(electricidad) || 0;
    const residuos = parseFloat(residuosOrganicos) || 0;

    // Factores de emisión (kg CO₂e por unidad)
    const emisiones = {
      fertilizanteN: n * 5.5,
      fertilizanteP: p * 1.2,
      fertilizanteK: k * 0.7,
      diesel: diesel * 2.68,
      gasolina: gasolina * 2.31,
      electricidad: kwh * 0.45,
      residuos: residuos * 0.02,
    };

    const total =
      emisiones.fertilizanteN +
      emisiones.fertilizanteP +
      emisiones.fertilizanteK +
      emisiones.diesel +
      emisiones.gasolina +
      emisiones.electricidad +
      emisiones.residuos;

    const porHectarea = h > 0 ? total / h : 0;

    const data = [
      { name: 'Fertilizantes N', value: emisiones.fertilizanteN },
      { name: 'Fertilizantes P', value: emisiones.fertilizanteP },
      { name: 'Fertilizantes K', value: emisiones.fertilizanteK },
      { name: 'Maquinaria (Diésel)', value: emisiones.diesel },
      { name: 'Transporte (Gasolina)', value: emisiones.gasolina },
      { name: 'Electricidad', value: emisiones.electricidad },
      { name: 'Residuos', value: emisiones.residuos },
    ].filter((item) => item.value > 0);

    setChartData(data);
    setResultado({ total: total.toFixed(2), porHectarea: porHectarea.toFixed(2) });
  };

  const guardarEnHistorial = async () => {
    if (!resultado) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/historial`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreFinca: form.nombreFinca || 'Cálculo sin nombre',
          hectareas: parseFloat(form.hectareas) || 0,
          ...Object.fromEntries(
            Object.entries(form).filter(([k, v]) => k !== 'nombreFinca' && k !== 'hectareas' && v)
          ),
          totalCO2: parseFloat(resultado.total),
          fecha: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Error al guardar');
      alert('Cálculo guardado en tu historial');
      setForm({
        nombreFinca: '',
        hectareas: '',
        fertilizanteN: '',
        fertilizanteP: '',
        fertilizanteK: '',
        dieselMaquinaria: '',
        gasolinaTransporte: '',
        electricidad: '',
        residuosOrganicos: '',
      });
      setResultado(null);
      setChartData([]);
    } catch (err) {
      console.error(err);
      alert('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error(err);
    }
    navigate('/login');
  };

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

  if (!user) return null;

  // Generar gráfico SVG
  const generateSVG = () => {
    if (!resultado || chartData.length === 0) return null;

    const total = parseFloat(resultado.total);
    let cumulative = 0;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;

    return (
      <svg width="200" height="200" viewBox="0 0 200 200" className="pie-chart-svg">
        <g transform="translate(100,100)">
          {/* Fondo gris */}
          <circle r={radius} fill="none" stroke="#e0e0e0" strokeWidth="36" />

          {/* Segmentos */}
          {chartData.map((item, index) => {
            const percent = (item.value / total) * 100;
            const dashOffset = circumference - (cumulative / total) * circumference;
            cumulative += item.value;

            return (
              <circle
                key={index}
                r={radius}
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth="36"
                strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
                strokeDashoffset={-dashOffset}
                transform="rotate(-90)"
                className="pie-segment"
                style={{
                  transition: 'stroke-dasharray 0.8s ease',
                }}
              />
            );
          })}
        </g>

        {/* Centro con total */}
        <text x="100" y="95" textAnchor="middle" className="pie-center-total">
          {resultado.total}
        </text>
        <text x="100" y="115" textAnchor="middle" className="pie-center-label">
          kg CO₂e
        </text>
      </svg>
    );
  };

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
            <Link to="/inicio" className="nav-item">
              <img src="/img/icon-home.svg" alt="Inicio" className="nav-icon" />
              <span>Inicio</span>
            </Link>
            <Link to="/calculadora" className="nav-item active">
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
          <div className="calculadora-container">
            <h2 className="section-title">Calculadora de Huella de Carbono</h2>

            <form onSubmit={calcularHuella} className="calculadora-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre de la finca (opcional)</label>
                  <input
                    type="text"
                    name="nombreFinca"
                    value={form.nombreFinca}
                    onChange={handleInputChange}
                    placeholder="Ej: Finca El Paraíso"
                  />
                </div>

                <div className="form-group">
                  <label>Hectáreas cultivadas</label>
                  <input
                    type="number"
                    name="hectareas"
                    value={form.hectareas}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    placeholder="Ej: 5.5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fertilizante Nitrogenado (kg N)</label>
                  <input
                    type="number"
                    name="fertilizanteN"
                    value={form.fertilizanteN}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    placeholder="Ej: 120"
                  />
                </div>

                <div className="form-group">
                  <label>Fertilizante Fosfatado (kg P)</label>
                  <input
                    type="number"
                    name="fertilizanteP"
                    value={form.fertilizanteP}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    placeholder="Ej: 80"
                  />
                </div>

                <div className="form-group">
                  <label>Fertilizante Potásico (kg K)</label>
                  <input
                    type="number"
                    name="fertilizanteK"
                    value={form.fertilizanteK}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    placeholder="Ej: 100"
                  />
                </div>

                <div className="form-group">
                  <label>Diésel en maquinaria (litros)</label>
                  <input
                    type="number"
                    name="dieselMaquinaria"
                    value={form.dieselMaquinaria}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    placeholder="Ej: 250"
                  />
                </div>

                <div className="form-group">
                  <label>Gasolina en transporte (litros)</label>
                  <input
                    type="number"
                    name="gasolinaTransporte"
                    value={form.gasolinaTransporte}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    placeholder="Ej: 180"
                  />
                </div>

                <div className="form-group">
                  <label>Energía eléctrica (kWh)</label>
                  <input
                    type="number"
                    name="electricidad"
                    value={form.electricidad}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    placeholder="Ej: 800"
                  />
                </div>

                <div className="form-group">
                  <label>Residuos orgánicos (toneladas)</label>
                  <input
                    type="number"
                    name="residuosOrganicos"
                    value={form.residuosOrganicos}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    placeholder="Ej: 2.5"
                  />
                </div>
              </div>

              <button type="submit" className="btn-calcular">
                Calcular Huella de Carbono
              </button>
            </form>

            {resultado && (
              <div className="resultado-section">
                <h3>Resultado de la Huella de Carbono</h3>
                <div className="resultado-cards">
                  <div className="card">
                    <p className="card-title">Total</p>
                    <p className="card-value">{resultado.total} kg CO₂e</p>
                  </div>
                  <div className="card">
                    <p className="card-title">Por hectárea</p>
                    <p className="card-value">{resultado.porHectarea} kg CO₂e/ha</p>
                  </div>
                </div>

                {chartData.length > 0 && (
                  <div className="chart-container">
                    <div className="chart-wrapper">
                      {generateSVG()}
                    </div>
                    <div className="legend">
                      {chartData.map((item, index) => (
                        <div key={index} className="legend-item">
                          <span
                            className="legend-color"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></span>
                          <span className="legend-label">
                            {item.name}: {item.value.toFixed(1)} kg ({((item.value / parseFloat(resultado.total)) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={guardarEnHistorial}
                  disabled={saving}
                  className="btn-guardar"
                >
                  {saving ? 'Guardando...' : 'Guardar en Historial'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        .calculadora-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .section-title {
          text-align: center;
          color: #2d6a4f;
          margin-bottom: 30px;
          font-size: 24px;
        }

        .calculadora-form {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 18px;
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #2d6a4f;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #95d5b2;
          border-radius: 8px;
          font-size: 15px;
          transition: border 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #2d6a4f;
          box-shadow: 0 0 0 2px rgba(45, 106, 79, 0.2);
        }

        .btn-calcular {
          width: 100%;
          padding: 14px;
          background: #2d6a4f;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }

        .btn-calcular:hover {
          background: #1f4d38;
        }

        .resultado-section {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-align: center;
        }

        .resultado-section h3 {
          color: #2d6a4f;
          margin-bottom: 20px;
        }

        .resultado-cards {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }

        .card {
          background: #f1f8f5;
          padding: 20px;
          border-radius: 12px;
          min-width: 180px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .card-title {
          font-size: 14px;
          color: #555;
          margin-bottom: 8px;
        }

        .card-value {
          font-size: 24px;
          font-weight: 700;
          color: #2d6a4f;
        }

        .chart-container {
          margin: 30px 0;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 12px;
        }

        .chart-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .pie-chart-svg {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .pie-center-total {
          font-size: 28px;
          font-weight: 700;
          fill: #2d6a4f;
        }

        .pie-center-label {
          font-size: 14px;
          fill: #555;
        }

        .legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 300px;
          margin: 0 auto;
        }

        .legend-item {
          display: flex;
          align-items: center;
          font-size: 14px;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          display: inline-block;
          margin-right: 10px;
        }

        .legend-label {
          color: #444;
        }

        .btn-guardar {
          margin-top: 20px;
          padding: 12px 30px;
          background: #40916c;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }

        .btn-guardar:hover:not(:disabled) {
          background: #2d6a4f;
        }

        .btn-guardar:disabled {
          background: #95d5b2;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .resultado-cards {
            flex-direction: column;
            align-items: center;
          }
          .legend {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}