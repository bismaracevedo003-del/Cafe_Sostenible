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

  const [form, setForm] = useState({
    nombreFinca: '',
    areaCultivada: '',
    produccionVerde: '',
    fertilizanteTotal: '',
    tipoFertilizante: 'sintetico',
    energiaElectrica: '',
    combustibleLitros: '',
    tipoCombustible: 'diesel',
    arbolesSombra: '',
    areaCopaPromedio: '',
    distanciaKm: '',
    volumenCargas: '',
    tipoProcesamiento: 'lavado',
    residuosTotales: '',
    residuosCompostados: '',
    bosqueBase: '',
    bosqueActual: '',
  });

  const [resultado, setResultado] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // ← WIZARD
  const [paso, setPaso] = useState(0);
  const totalPasos = 8;

  const pasos = [
    [
      { label: "Área cultivada (ha)", name: "areaCultivada", type: "number", step: "0.1" },
      { label: "Producción café verde (kg)", name: "produccionVerde", type: "number" },
    ],
    [
      { label: "Fertilizante total (kg)", name: "fertilizanteTotal", type: "number" },
      { label: "Tipo de fertilizante", name: "tipoFertilizante", type: "select", options: ["sintetico", "organico"] },
    ],
    [
      { label: "Energía eléctrica (kWh)", name: "energiaElectrica", type: "number" },
      { label: "Combustible (litros)", name: "combustibleLitros", type: "number", step: "0.1" },
    ],
    [
      { label: "Número de árboles de sombra", name: "arbolesSombra", type: "number" },
      { label: "Área promedio de copa (m²/árbol)", name: "areaCopaPromedio", type: "number", step: "0.1" },
    ],
    [
      { label: "Distancia promedio (km)", name: "distanciaKm", type: "number", step: "0.1" },
      { label: "Volumen total (cargas)", name: "volumenCargas", type: "number" },
    ],
    [
      { label: "Tipo de procesamiento", name: "tipoProcesamiento", type: "select", options: ["lavado", "miel", "natural"] },
    ],
    [
      { label: "Residuos totales (kg)", name: "residuosTotales", type: "number" },
      { label: "Residuos compostados (kg)", name: "residuosCompostados", type: "number" },
    ],
    [
      { label: "Bosque base 2020 (ha)", name: "bosqueBase", type: "number", step: "0.1" },
      { label: "Bosque actual (ha)", name: "bosqueActual", type: "number", step: "0.1" },
    ],
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/user`, { credentials: 'include' });
        if (!res.ok) throw new Error('No autorizado');
        const data = await res.json();
        setUser(data);
        if (data.nombreFinca) {
          setForm(prev => ({ ...prev, nombreFinca: data.nombreFinca }));
        }
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
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const calcularHuella = (e) => {
    e.preventDefault();
    const f = form;
    const ha = parseFloat(f.areaCultivada) || 0;
    const prod = parseFloat(f.produccionVerde) || 0;
    if (ha <= 0 || prod <= 0) {
      alert('Área cultivada y producción deben ser mayores a 0');
      return;
    }

    // ← CÁLCULO SIN CAMBIOS
    const fertPorHa = (parseFloat(f.fertilizanteTotal) || 0) / ha;
    const fertEmision = fertPorHa * (f.tipoFertilizante === 'sintetico' ? 4.5 : 1.2);
    const rendimiento = prod / ha;
    const poderCalorifico = f.tipoCombustible === 'diesel' ? 36 : f.tipoCombustible === 'gas' ? 38 : 45;
    const energiaComb = (parseFloat(f.combustibleLitros) || 0) * poderCalorifico / 3.6;
    const energiaTotal = (parseFloat(f.energiaElectrica) || 0) + energiaComb;
    const arbolesPorHa = parseFloat(f.arbolesSombra) / ha || 0;
    const coberturaPorc = (parseFloat(f.areaCopaPromedio) * parseFloat(f.arbolesSombra)) / (ha * 10000) * 100 || 0;
    const distanciaProm = (parseFloat(f.distanciaKm) * parseFloat(f.volumenCargas)) / (parseFloat(f.volumenCargas) || 1) || 0;
    const transpEmision = distanciaProm * 0.12;
    const coefProcesamiento = { lavado: 0.30, miel: 0.20, natural: 0.10 };
    const procEmision = prod * coefProcesamiento[f.tipoProcesamiento];
    const fraccionCompost = (parseFloat(f.residuosTotales) || 0) > 0 ? (parseFloat(f.residuosCompostados) || 0) / (parseFloat(f.residuosTotales) || 0) : 0;
    const residuosEmision = ((parseFloat(f.residuosTotales) || 0) - (parseFloat(f.residuosCompostados) || 0)) * 0.5;
    const deforestacionPorc = (parseFloat(f.bosqueBase) || 0) > 0 ? Math.max(0, ((parseFloat(f.bosqueBase) || 0) - (parseFloat(f.bosqueActual) || 0)) / ha) * 100 : 0;
    const deforestacionEmision = deforestacionPorc > 0 ? deforestacionPorc * 1500 : 0;

    const total = (fertEmision * ha) + (energiaTotal * 0.45) + transpEmision + procEmision + residuosEmision + deforestacionEmision;
    const porKg = prod > 0 ? total / prod : 0;

    const data = [
      { name: 'Fertilizantes', value: fertEmision * ha },
      { name: 'Energía', value: energiaTotal * 0.45 },
      { name: 'Transporte', value: transpEmision },
      { name: 'Procesamiento', value: procEmision },
      { name: 'Residuos', value: residuosEmision },
      { name: 'Deforestación', value: deforestacionEmision },
    ].filter(d => d.value > 0);

    setChartData(data);
    setResultado({
      total: total.toFixed(2),
      porKg: porKg.toFixed(3),
      fertPorHa: fertPorHa.toFixed(1),
      rendimiento: rendimiento.toFixed(0),
      energiaTotal: energiaTotal.toFixed(1),
      arbolesPorHa: arbolesPorHa.toFixed(0),
      coberturaPorc: coberturaPorc.toFixed(1),
      distanciaProm: distanciaProm.toFixed(1),
      fraccionCompost: (fraccionCompost * 100).toFixed(0),
      deforestacionPorc: deforestacionPorc.toFixed(1),
    });
  };

  const guardarEnHistorial = async () => {
    if (!resultado) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/historial`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreFinca: form.nombreFinca || 'Cálculo EUDR', ...form, ...resultado }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setForm(prev => ({
        ...prev,
        nombreFinca: prev.nombreFinca,
        areaCultivada: '', produccionVerde: '', fertilizanteTotal: '', energiaElectrica: '',
        combustibleLitros: '', arbolesSombra: '', areaCopaPromedio: '', distanciaKm: '',
        volumenCargas: '', residuosTotales: '', residuosCompostados: '', bosqueBase: '', bosqueActual: '',
      }));
      setResultado(null);
      setChartData([]);
      setPaso(0);
    } catch (err) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="coffee-loader">
        <div className="coffee-cup"><div className="steam"></div><div className="steam"></div><div className="steam"></div></div>
        <p className="coffee-text">Cargando EUDR...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <header className="header">
        <div className="logo-section">
          <img src="/img/IMG_6194.PNG" alt="Logo" className="logo-img" />
          <div className="title-group">
            <h1 className="main-title">CAFÉ SOSTENIBLE</h1>
            <p className="subtitle">Cumplimiento EUDR</p>
          </div>
        </div>
        <a href="#" className="news-link">Noticias</a>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <nav className="nav-menu">
            <Link to="/inicio" className="nav-item"><img src="/img/icon-home.svg" alt="" className="nav-icon" /><span>Inicio</span></Link>
            <Link to="/calculadora" className="nav-item active"><img src="/img/icon-calculator.svg" alt="" className="nav-icon" /><span>Calculadora EUDR</span></Link>
            <Link to="/historial" className="nav-item"><img src="/img/icon-history.svg" alt="" className="nav-icon" /><span>Historial</span></Link>
            <Link to="/perfil" className="nav-item"><img src="/img/icon-profile.svg" alt="" className="nav-icon" /><span>Perfil</span></Link>
            <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
          </nav>
        </aside>

        <main className="content">
          <div className="wizard-container">
            <h1 className="wizard-title">Calcula tu huella de carbono</h1>
            <p className="wizard-subtitle">Responde paso a paso para conocer el impacto ambiental de tu finca</p>

            {/* ← INDICADOR DE PASOS */}
            <div className="steps-indicator">
              {Array.from({ length: totalPasos }, (_, i) => (
                <div key={i} className={`step-circle ${i === paso ? 'active' : ''}`}>
                  {i + 1}
                </div>
              ))}
            </div>

            <form onSubmit={calcularHuella} className="wizard-form">
              <div className="form-card-wrapper" style={{ transform: `translateX(-${paso * 100}%)` }}>
                {pasos.map((grupo, index) => (
                  <div className="form-card" key={index}>
                    <div className="form-grid">
                      {grupo.map((campo, i) => (
                        <div className="form-group" key={i}>
                          <label>{campo.label}</label>
                          {campo.type === "select" ? (
                            <select name={campo.name} value={form[campo.name]} onChange={handleInputChange}>
                              {campo.options.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt === 'sintetico' ? 'Sintético' : opt === 'organico' ? 'Orgánico' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="number"
                              name={campo.name}
                              value={form[campo.name]}
                              onChange={handleInputChange}
                              step={campo.step || "1"}
                              min="0"
                              placeholder="0"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* ← NAVEGACIÓN */}
              <div className="nav-buttons">
                {paso > 0 && (
                  <button type="button" className="btn-nav prev" onClick={() => setPaso(paso - 1)}>
                    <svg viewBox="0 0 24 24" className="arrow-icon"><path d="M15 18l-6-6 6-6" /></svg>
                    Anterior
                  </button>
                )}
                {paso < totalPasos - 1 && (
                  <button type="button" className="btn-nav next" onClick={() => setPaso(paso + 1)}>
                    Siguiente
                    <svg viewBox="0 0 24 24" className="arrow-icon"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                )}
                {paso === totalPasos - 1 && (
                  <button type="submit" className="btn-calcular">
                    Calcular Huella EUDR
                  </button>
                )}
              </div>
            </form>

            {/* ← RESULTADOS (igual que antes) */}
            {resultado && (
              <div className="resultado-section">
                <h3>Resultados EUDR – {form.nombreFinca}</h3>
                <div className="resultado-cards">
                  <div className="card">
                    <p className="card-title">Huella Total</p>
                    <p className="card-value">{resultado.total} kg CO₂e</p>
                  </div>
                  <div className="card">
                    <p className="card-title">Por kg de café</p>
                    <p className="card-value">{resultado.porKg} kg CO₂e/kg</p>
                  </div>
                </div>

                <div className="chart-container">
                  <div className="bars-chart">
                    {chartData.map((d, i) => {
                      const percent = (d.value / parseFloat(resultado.total)) * 100;
                      return (
                        <div key={i} className="bar-item">
                          <div className="bar-label">
                            <span className="bar-name">{d.name}</span>
                            <span className="bar-value">{d.value.toFixed(1)} kg ({percent.toFixed(0)}%)</span>
                          </div>
                          <div className="bar-wrapper">
                            <div className="bar-fill" style={{ width: `${percent}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="total-center">
                    <div className="total-value">{resultado.porKg}</div>
                    <small>kg CO₂e/kg</small>
                  </div>
                </div>

                <div className="eudr-indicators">
                  <div className="indicator"><span>Fertilizante:</span> <strong>{resultado.fertPorHa} kg/ha</strong></div>
                  <div className="indicator"><span>Rendimiento:</span> <strong>{resultado.rendimiento} kg/ha</strong></div>
                  <div className="indicator"><span>Energía:</span> <strong>{resultado.energiaTotal} kWh</strong></div>
                  <div className="indicator"><span>Árboles sombra:</span> <strong>{resultado.arbolesPorHa}/ha</strong></div>
                  <div className="indicator"><span>Cobertura:</span> <strong>{resultado.coberturaPorc}%</strong></div>
                  <div className="indicator"><span>Distancia:</span> <strong>{resultado.distanciaProm} km</strong></div>
                  <div className="indicator"><span>Compostaje:</span> <strong>{resultado.fraccionCompost}%</strong></div>
                  <div className="indicator deforestacion" style={{ color: parseFloat(resultado.deforestacionPorc) > 0 ? '#d32f2f' : '#2d6a4f' }}>
                    <span>Deforestación:</span> <strong>{resultado.deforestacionPorc}%</strong>
                  </div>
                </div>

                <button onClick={guardarEnHistorial} disabled={saving} className="btn-guardar">
                  {saving ? 'Guardando...' : 'Guardar en Historial'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ← TOASTS */}
      {showSuccess && (
        <div className="success-toast">
          <svg className="check-icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
          <span>Cálculo EUDR guardado</span>
        </div>
      )}
      {showError && (
        <div className="error-toast">
          <svg className="error-icon" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span>Error al guardar</span>
        </div>
      )}

      <style jsx>{`
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

* {
  font-family: 'Roboto', sans-serif;
  box-sizing: border-box;
}

/* ← CONTENEDOR PRINCIPAL */
.calculadora-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  background: #e8f5e9;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.section-title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #1b5e20;
  margin-bottom: 8px;
}

.wizard-subtitle {
  text-align: center;
  color: #2e7d32;
  font-size: 16px;
  margin-bottom: 30px;
}

/* ← INDICADOR DE PASOS */
.steps-indicator {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #c8e6c9;
  color: #2e7d32;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.step-circle.active {
  background: #2e7d32;
  color: white;
  transform: scale(1.1);
}

/* ← WIZARD FORM */
.wizard-form {
  overflow: hidden;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.form-card-wrapper {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.form-card {
  min-width: 100%;
  padding: 30px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1b5e20;
  font-size: 15px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 14px;
  border: 2px solid #a5d6a7;
  border-radius: 8px;
  font-size: 16px;
  transition: border 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

/* ← NAVEGACIÓN */
.nav-buttons {
  display: flex;
  justify-content: space-between;
  padding: 20px 30px 30px;
  background: white;
  gap: 12px;
}

.btn-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-nav:hover {
  background: #1b5e20;
}

.btn-nav.prev {
  background: #a5d6a7;
  color: #1b5e20;
}

.btn-nav.prev:hover {
  background: #81c784;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ← BOTÓN CALCULAR */
.btn-calcular {
  width: 100%;
  padding: 16px;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-calcular:hover {
  background: #1b5e20;
}

/* ← RESULTADOS */
.resultado-section {
  margin-top: 40px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.resultado-section h3 {
  text-align: center;
  color: #1b5e20;
  font-size: 22px;
  margin-bottom: 20px;
  font-weight: 600;
}

.resultado-cards {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.card {
  background: #f1f8e9;
  padding: 20px;
  border-radius: 12px;
  width: 200px;
  text-align: center;
  border: 1px solid #c8e6c9;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.12);
}

.card-title {
  font-size: 14px;
  color: #2e7d32;
  margin-bottom: 8px;
  font-weight: 500;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #1b5e20;
}

/* ← GRÁFICO DE BARRAS */
.chart-container {
  margin: 30px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
}

.bars-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 14.5px;
  font-weight: 600;
  color: #444;
}

.bar-name {
  color: #2e7d32;
}

.bar-value {
  color: #666;
  font-weight: normal;
}

.bar-wrapper {
  width: 100%;
  height: 32px;
  background: #e8ecef;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.bar-fill {
  height: 100%;
  background: #2e7d32;
  border-radius: 16px;
  transition: width 1.2s ease-out;
}

/* ← TOTAL */
.total-center {
  text-align: center;
  margin-top: 28px;
  padding: 18px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.total-value {
  font-size: 30px;
  font-weight: 700;
  color: #1b5e20;
}

.total-center small {
  font-size: 14px;
  color: #555;
  display: block;
  margin-top: 6px;
}

/* ← INDICADORES EUDR */
.eudr-indicators {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin: 25px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.indicator {
  font-size: 15px;
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.indicator:last-child {
  border-bottom: none;
}

/* ← BOTÓN GUARDAR */
.btn-guardar {
  margin-top: 20px;
  padding: 12px 30px;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-guardar:hover:not(:disabled) {
  background: #1b5e20;
}

.btn-guardar:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
  color: #1b5e20;
}

/* ← TOASTS */
.success-toast,
.error-toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 14px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  animation: slideIn 0.4s ease-out, fadeOut 0.5s 2.5s forwards;
}

.success-toast {
  background: #2e7d32;
  color: white;
}

.error-toast {
  background: #c62828;
  color: white;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.check-icon,
.error-icon {
  width: 24px;
  height: 24px;
  stroke: white;
  stroke-width: 3;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.check-icon polyline {
  stroke-dasharray: 22;
  stroke-dashoffset: 66;
  animation: drawCheck 0.6s ease-out 0.3s forwards;
}

.error-icon line {
  stroke-dasharray: 18;
  stroke-dashoffset: 36;
  animation: drawX 0.6s ease-out 0.3s forwards;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeOut {
  to { opacity: 0; transform: translateY(20px); }
}

@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}

@keyframes drawX {
  to { stroke-dashoffset: 0; }
}

/* ← RESPONSIVE */
@media (max-width: 768px) {
  .calculadora-container {
    margin: 20px;
    padding: 15px;
  }

  .form-card {
    padding: 20px;
  }

  .nav-buttons {
    flex-direction: column;
  }

  .btn-nav,
  .btn-calcular {
    width: 100%;
  }

  .bars-chart {
    max-width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .section-title {
    font-size: 24px;
  }

  .card {
    width: 100%;
    max-width: 280px;
  }
}
      `}</style>
    </>
  );
}