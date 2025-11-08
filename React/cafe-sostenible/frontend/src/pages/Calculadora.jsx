// src/pages/Calculadora.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
const API_BASE = import.meta.env.VITE_API_URL;
const CATEGORY_COLORS = {
  'Fertilizantes': '#2d6a4f',
  'Energía': '#40916c',
  'Transporte': '#52b788',
  'Procesamiento': '#74c69d',
  'Residuos': '#95d5b2',
  'Deforestación': '#b7e4c7'
};
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
      setTimeout(() => setShowSuccess(false), 3500);
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
      setTimeout(() => setShowError(false), 3500);
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
            {/* ← INDICADOR DE PROGRESO EN BARRA */}
            <div className="progress-indicator">
              <div className="progress-bar" style={{ width: `${((paso + 1) / totalPasos) * 100}%` }}></div>
              <span className="progress-text">{paso + 1} / {totalPasos} ({Math.round(((paso + 1) / totalPasos) * 100)}%)</span>
            </div>
            {/* ← NUEVO: Formulario con sliders */}
            <form onSubmit={calcularHuella} className="wizard-form">
              <div className="form-card-wrapper" style={{ transform: `translateX(-${paso * 100}%)` }}>
                {pasos.map((grupo, index) => (
                  <div className="form-card" key={index}>
                    <div className="form-grid">
                      {grupo.map((campo, i) => {
                        const value = form[campo.name] || '';
                        const isNumber = campo.type === "number";
                        const step = campo.step || "1";
                        const min = 0;
                        const max = campo.name === "areaCultivada" ? 1000 :
                                    campo.name === "produccionVerde" ? 100000 :
                                    campo.name === "fertilizanteTotal" ? 50000 :
                                    campo.name === "energiaElectrica" ? 100000 :
                                    campo.name === "combustibleLitros" ? 10000 :
                                    campo.name === "arbolesSombra" ? 10000 :
                                    campo.name === "areaCopaPromedio" ? 100 :
                                    campo.name === "distanciaKm" ? 1000 :
                                    campo.name === "volumenCargas" ? 1000 :
                                    campo.name === "residuosTotales" ? 50000 :
                                    campo.name === "residuosCompostados" ? 50000 :
                                    campo.name === "bosqueBase" ? 1000 :
                                    campo.name === "bosqueActual" ? 1000 : 1000;
                        return (
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
                              <>
                                <input
                                  type="number"
                                  name={campo.name}
                                  value={value}
                                  onChange={handleInputChange}
                                  step={step}
                                  min={min}
                                  max={max}
                                  placeholder="0"
                                  className="number-input"
                                />
                                {/* ← SLIDER ANIMADO */}
                                <div className="slider-container">
                                  <input
                                    type="range"
                                    name={campo.name}
                                    value={value || 0}
                                    onChange={handleInputChange}
                                    step={step}
                                    min={min}
                                    max={max}
                                    className="range-slider"
                                    style={{
                                      background: `linear-gradient(to right, #2e7d32 0%, #2e7d32 ${((value || 0) / max) * 100}%, #e0e0e0 ${((value || 0) / max) * 100}%, #e0e0e0 100%)`
                                    }}
                                  />
                                  <span className="slider-value">{value || 0} {campo.name.includes('ha') ? 'ha' : campo.name.includes('kg') ? 'kg' : campo.name.includes('kWh') ? 'kWh' : campo.name.includes('litros') ? 'L' : campo.name.includes('km') ? 'km' : campo.name.includes('cargas') ? 'cargas' : 'm²'}</span>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
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
                    <p className="card-title">Huella Total</p><br />
                    <p className="card-value">{resultado.total} kg CO₂e</p>
                  </div>
                  <div className="card">
                    <p className="card-title">Por kg de café</p><br />
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
                            <div className="bar-fill" style={{ width: `${percent}%`, background: CATEGORY_COLORS[d.name] }} />
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
                <button onClick={guardarEnHistorial} disabled={saving} className={`btn-guardar ${saving ? 'saving' : ''}`}>
                  {saving ? 'Guardando' : 'Guardar en Historial'}
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
  /* ← WIZARD CONTAINER */
  .wizard-container {
    max-width: 680px;
    margin: 30px auto;
    padding: 28px;
    background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
    border-radius: 20px;
    box-shadow:
      0 12px 30px rgba(0,0,0,0.08),
      0 0 0 1px rgba(46,125,50,0.08);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }
  .wizard-title {
    text-align: center;
    font-size: 30px;
    font-weight: 700;
    color: #1b5e20;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }
  .wizard-subtitle {
    text-align: center;
    color: #2e7d32;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 32px;
    opacity: 0.9;
  }
  /* ← PROGRESO EN BARRA */
  .progress-indicator {
    position: relative;
    height: 10px;
    background: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 32px;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }
  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #2e7d32, #1b5e20);
    transition: width 0.6s ease-out;
    position: relative;
    overflow: hidden;
  }
  .progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shimmer 2s infinite;
  }
  .progress-text {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 13px;
    font-weight: 600;
    color: #2e7d32;
    margin-top: 8px;
    white-space: nowrap;
  }
  /* ← FORMULARIO */
  .wizard-form {
    overflow: hidden;
    border-radius: 16px;
    background: white;
    box-shadow:
      0 8px 25px rgba(0,0,0,0.08),
      0 0 0 1px rgba(0,0,0,0.05);
    position: relative;
  }
  .form-card-wrapper {
    display: flex;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .form-card {
    min-width: 100%;
    padding: 32px;
    animation: fadeIn 0.5s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 26px;
  }
  .form-group label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
    color: #1b5e20;
    font-size: 15px;
    letter-spacing: -0.2px;
  }
  /* ← INPUT NUMÉRICO */
  .number-input {
    width: 100%;
    padding: 15px 16px;
    border: 2px solid #a5d6a7;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;
    background: #fafafa;
    margin-bottom: 10px;
  }
  .number-input:focus {
    outline: none;
    border-color: #2e7d32;
    background: white;
    box-shadow:
      0 0 0 4px rgba(46,125,50,0.12),
      0 4px 12px rgba(0,0,0,0.08);
    transform: translateY(-1px);
  }
  /* ← SELECT */
  .form-group select {
    width: 100%;
    padding: 15px 16px;
    border: 2px solid #a5d6a7;
    border-radius: 10px;
    font-size: 16px;
    background: #fafafa;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .form-group select:focus {
    outline: none;
    border-color: #2e7d32;
    background: white;
    box-shadow:
      0 0 0 4px rgba(46,125,50,0.12),
      0 4px 12px rgba(0,0,0,0.08);
  }
  /* ← SLIDER ULTRA BONITO */
  .slider-container {
    position: relative;
    margin-top: 10px;
  }
  .range-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 10px;
    border-radius: 6px;
    background: #e0e0e0;
    outline: none;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }
  .range-slider::-webkit-slider-runnable-track {
    height: 10px;
    border-radius: 6px;
  }
  .range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #2e7d32, #1b5e20);
    border-radius: 50%;
    cursor: pointer;
    box-shadow:
      0 3px 8px rgba(46,125,50,0.3),
      0 0 0 6px rgba(46,125,50,0.15),
      0 0 20px rgba(46,125,50,0.2);
    transition: all 0.2s ease;
    margin-top: -7px;
    position: relative;
  }
  .range-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow:
      0 4px 12px rgba(46,125,50,0.4),
      0 0 0 8px rgba(46,125,50,0.2);
  }
  .range-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #2e7d32, #1b5e20);
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow:
      0 3px 8px rgba(46,125,50,0.3),
      0 0 0 6px rgba(46,125,50,0.15);
  }
  .slider-value {
    position: absolute;
    right: 0;
    top: -34px;
    font-size: 13px;
    font-weight: 700;
    color: #1b5e20;
    background: white;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid #a5d6a7;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    min-width: 50px;
    text-align: center;
  }
  /* ← NAVEGACIÓN */
  .nav-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 24px 32px 32px;
    background: white;
    border-top: 1px solid #e0e0e0;
  }
.btn-nav {
  flex: 1; /* ambos crecen igual */
  max-width: 200px; /* límite de ancho opcional */
  text-align: center;
  justify-content: center;

  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #2e7d32, #1b5e20);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(46,125,50,0.25);
}
  .btn-nav:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(46,125,50,0.3);
  }
  .btn-nav.prev {
    background: linear-gradient(135deg, #a5d6a7, #81c784);
    color: #1b5e20;
  }
  .btn-nav.prev:hover {
    box-shadow: 0 8px 20px rgba(129,199,132,0.3);
  }
    
  .arrow-icon {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .btn-calcular {
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, #2e7d32, #1b5e20);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 6px 16px rgba(46,125,50,0.3);
  }
  .btn-calcular:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 25px rgba(46,125,50,0.35);
  }
  /* ← RESULTADOS PREMIUM */
  .resultado-section {
    margin-top: 40px;
    padding: 32px;
    background: white;
    border-radius: 16px;
    box-shadow:
      0 12px 30px rgba(0,0,0,0.08),
      0 0 0 1px rgba(0,0,0,0.05);
    animation: fadeInUp 0.6s ease-out;
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .resultado-section h3 {
    text-align: center;
    color: #1b5e20;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 28px;
    letter-spacing: -0.5px;
  }
  .resultado-cards {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    margin-bottom: 32px;
  }
  .card {
    background: linear-gradient(135deg, #f1f8e9, #e8f5e9);
    padding: 24px;
    border-radius: 14px;
    width: 210px;
    text-align: center;
    border: 1px solid #c8e6c9;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }
  .card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 25px rgba(0,0,0,0.12);
  }
  .card-title {
    font-size: 14px;
    color: #2e7d32;
    margin-bottom: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .card-value {
    font-size: 26px;
    font-weight: 700;
    color: #1b5e20;
    letter-spacing: -0.5px;
  }
  /* ← GRÁFICO ULTRA BONITO */
  .chart-container {
    margin: 38px 0;
    padding: 28px;
    background: linear-gradient(135deg, #f9f9f9, #f5f5f5);
    border-radius: 14px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  .bars-chart {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .bar-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .bar-label {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
    font-weight: 600;
    color: #333;
  }
  .bar-name {
    color: #1b5e20;
    font-weight: 700;
  }
  .bar-value {
    color: #666;
    font-weight: 500;
  }
  .bar-wrapper {
    width: 100%;
    height: 36px;
    background: #e8ecef;
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }
  .bar-fill {
    height: 100%;
    border-radius: 18px;
    background: linear-gradient(90deg, #2e7d32, #1b5e20);
    transition: width 1.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  .bar-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shimmer 2s infinite;
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .total-center {
    text-align: center;
    margin-top: 32px;
    padding: 24px;
    background: linear-gradient(135deg, #f1f8e9, #e8f5e9);
    border-radius: 16px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    border: 1px solid #c8e6c9;
  }
  .total-value {
    font-size: 36px;
    font-weight: 800;
    color: #1b5e20;
    letter-spacing: -1px;
  }
  .total-center small {
    font-size: 15px;
    color: #2e7d32;
    display: block;
    margin-top: 8px;
    font-weight: 600;
  }
  /* ← INDICADORES CON ÍCONOS */
  .eudr-indicators {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 14px;
    margin: 32px 0;
    padding: 22px;
    background: linear-gradient(135deg, #f8f9fa, #f1f8e9);
    border-radius: 14px;
    border: 1px dashed #a5d6a7;
  }
  .indicator {
    font-size: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #c8e6c9;
  }
  .indicator:last-child {
    border-bottom: none;
  }
  .indicator span {
    color: #2e7d32;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .indicator strong {
    color: #1b5e20;
    font-weight: 700;
  }
  .indicator.deforestacion span {
    color: #c62828;
  }
  .indicator.deforestacion strong {
    color: #b71c1c;
  }
  /* ← BOTÓN GUARDAR */
  .btn-guardar {
    margin-top: 24px;
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, #2e7d32, #1b5e20);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    font-size: 17px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 6px 16px rgba(46,125,50,0.3);
    position: relative;
    overflow: hidden;
  }
  .btn-guardar::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.7s ease;
  }
  .btn-guardar:hover:not(:disabled)::before {
    left: 100%;
  }
  .btn-guardar:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 25px rgba(46,125,50,0.35);
  }
  .btn-guardar:disabled {
    background: #a5d6a7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .btn-guardar.saving {
    animation: pulse 1.5s infinite;
  }
  .btn-guardar.saving::after {
    content: '...';
    animation: loading-dots 1s infinite steps(3);
    margin-left: 2px;
  }
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(165,214,167, 0.7);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(165,214,167, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(165,214,167, 0);
    }
  }
  @keyframes loading-dots {
    0% { content: '.'; }
    33% { content: '..'; }
    66% { content: '...'; }
  }
  /* ← TOASTS */
  .success-toast, .error-toast {
    position: fixed;
    bottom: 30px;
    right: 30px;
    padding: 16px 28px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
    box-shadow: 0 12px 30px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1), fadeOut 0.5s 3s forwards;
    backdrop-filter: blur(10px);
  }
  .success-toast { background: linear-gradient(135deg, #2e7d32, #1b5e20); color: white; }
  .error-toast { background: linear-gradient(135deg, #c62828, #b71c1c); color: white; }
  .check-icon, .error-icon {
    width: 26px;
    height: 26px;
    stroke: white;
    stroke-width: 3;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .check-icon polyline {
    stroke-dasharray: 24;
    stroke-dashoffset: 24;
    animation: draw 0.5s ease-in-out forwards 0.2s;
  }
  .error-icon line {
    stroke-dasharray: 18;
    stroke-dashoffset: 18;
    animation: draw 0.5s ease-in-out forwards 0.2s;
  }
  @keyframes draw {
    to { stroke-dashoffset: 0; }
  }
  @keyframes slideIn {
    0% { transform: translateX(100%); opacity: 0; }
    60% { transform: translateX(0); opacity: 1; }
    80% { transform: translateX(-20px); opacity: 1; }
    100% { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeOut {
    0% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(100%); }
  }
  /* ← RESPONSIVE */
  @media (max-width: 768px) {
    .wizard-container { margin: 20px; padding: 20px; }
    .wizard-title { font-size: 26px; }
    .form-card { padding: 24px; }
    .nav-buttons { flex-direction: column; gap: 20px; padding: 20px; }
    .btn-nav, .btn-calcular, .btn-guardar { width: 100%; }
    .resultado-cards { flex-direction: column; align-items: center; }
    .card { width: 100%; max-width: 300px; }
    .eudr-indicators { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .wizard-container { margin: 15px; padding: 16px; }
    .wizard-title { font-size: 24px; }
    .form-card { padding: 20px; }
    .progress-indicator { height: 8px; }
    .progress-text { font-size: 12px; }
  }
`}</style>
    </>
  );
}