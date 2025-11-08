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

  const getSliderColor = (value, max) => {
  const ratio = value / max;
  if (ratio < 0.5) {
    return `linear-gradient(to right, #2e7d32 0%, #2e7d32 ${ratio * 200}%, #e0e0e0 ${ratio * 200}%, #e0e0e0 100%)`;
  } else if (ratio < 0.8) {
    return `linear-gradient(to right, #2e7d32 0%, #f9a825 ${ratio * 125}%, #e0e0e0 ${ratio * 125}%, #e0e0e0 100%)`;
  } else {
    return `linear-gradient(to right, #2e7d32 0%, #c62828 ${ratio * 125}%, #e0e0e0 ${ratio * 125}%, #e0e0e0 100%)`;
  }
};

const getUnit = (name) => {
  if (name.includes('ha')) return 'ha';
  if (name.includes('kg')) return 'kg';
  if (name.includes('kWh')) return 'kWh';
  if (name.includes('litros')) return 'L';
  if (name.includes('km')) return 'km';
  if (name.includes('cargas')) return 'cargas';
  return 'm²';
};

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

            {/* ← NUEVO: BARRA DE PROGRESO TIPO LINKEDIN */}
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${((paso + 1) / totalPasos) * 100}%` }}
              />
              <div className="progress-label">
                Paso {paso + 1} de {totalPasos}
              </div>
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
                                {/* ← SLIDER CON COLOR DINÁMICO */}
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
                                      background: getSliderColor(value || 0, max)
                                    }}
                                  />
                                  <span className="slider-value">
                                    {value || 0} {getUnit(campo.name)}
                                  </span>
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
                  </button>
                )}
                {paso < totalPasos - 1 && (
                  <button type="button" className="btn-nav next" onClick={() => setPaso(paso + 1)}>
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
  /* 🎨 Paleta base */
  :root {
    --verde-oscuro: #1b5e20;
    --verde-medio: #2e7d32;
    --verde-claro: #a5d6a7;
    --verde-agua: #b9f6ca;
    --gris-claro: #f1f1f1;
    --sombra: rgba(0, 0, 0, 0.1);
    --transicion: all 0.3s ease;
    --radio: 10px;
  }

  /* 📦 Contenedor principal */
  .wizard-container {
    background: linear-gradient(180deg, #ffffff, #f7fdf7);
    border-radius: var(--radio);
    box-shadow: 0 4px 20px var(--sombra);
    padding: 2.5rem;
    max-width: 800px;
    margin: 40px auto;
    font-family: 'Poppins', sans-serif;
    animation: fadeIn 0.6s ease;
    backdrop-filter: blur(8px);
  }

  /* 🔤 Titulares */
  .wizard-title {
    color: var(--verde-oscuro);
    text-align: center;
    font-size: 2rem;
    margin-bottom: 1.5rem;
    font-weight: 700;
  }

  .wizard-step {
    margin-bottom: 2rem;
    animation: slideIn 0.4s ease;
  }

  /* 🧮 Inputs y Sliders */
  input[type="range"] {
    width: 100%;
    -webkit-appearance: none;
    height: 8px;
    border-radius: 5px;
    background: linear-gradient(90deg, var(--verde-medio), var(--verde-claro));
    outline: none;
    transition: var(--transicion);
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--verde-medio);
    cursor: pointer;
    transition: var(--transicion);
    box-shadow: 0 0 4px rgba(0,0,0,0.3);
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    background: var(--verde-oscuro);
  }

  .range-value {
    text-align: right;
    color: var(--verde-oscuro);
    font-weight: 600;
    margin-top: 0.4rem;
    font-size: 0.9rem;
  }

  /* 🧾 Etiquetas */
  label {
    color: var(--verde-oscuro);
    font-weight: 500;
    display: block;
    margin-bottom: 0.5rem;
  }

  /* 🔘 Botones */
  .wizard-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
  }

  button {
    padding: 0.75rem 1.8rem;
    border-radius: var(--radio);
    border: none;
    cursor: pointer;
    background: var(--verde-medio);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    box-shadow: 0 3px 6px var(--sombra);
    transition: var(--transicion);
  }

  button:hover {
    background: var(--verde-oscuro);
    transform: translateY(-2px);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* 📊 Progreso */
  .progress-container {
    height: 10px;
    background: var(--gris-claro);
    border-radius: 5px;
    margin: 1.5rem 0;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--verde-medio), var(--verde-agua));
    transition: width 0.4s ease;
  }

  /* ✅ Resultado */
  .result-box {
    background: var(--verde-claro);
    color: var(--verde-oscuro);
    border-radius: var(--radio);
    padding: 1.5rem;
    text-align: center;
    font-weight: 600;
    margin-top: 1.5rem;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.05);
  }

  /* 🌍 Responsividad */
  @media (max-width: 768px) {
    .wizard-container {
      padding: 1.5rem;
    }

    .wizard-title {
      font-size: 1.6rem;
    }

    button {
      flex: 1;
      margin: 0 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .wizard-container {
      margin: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }

    input[type="range"] {
      height: 6px;
    }
  }

  /* ✨ Animaciones suaves */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-15px); }
    to { opacity: 1; transform: translateX(0); }
  }
`}</style>

    </>
  );
}