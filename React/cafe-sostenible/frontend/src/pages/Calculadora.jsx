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
  const [step, setStep] = useState(0);
  const COLORS = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'];

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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const calcularHuella = (e) => {
    e.preventDefault();

    const f = form;
    const ha = parseFloat(f.areaCultivada) || 0;
    const prod = parseFloat(f.produccionVerde) || 0;
    const fert = parseFloat(f.fertilizanteTotal) || 0;
    const elec = parseFloat(f.energiaElectrica) || 0;
    const comb = parseFloat(f.combustibleLitros) || 0;
    const dist = parseFloat(f.distanciaKm) || 0;
    const vol = parseFloat(f.volumenCargas) || 0;
    const residuosTot = parseFloat(f.residuosTotales) || 0;
    const compost = parseFloat(f.residuosCompostados) || 0;
    const bosqueBase = parseFloat(f.bosqueBase) || 0;
    const bosqueAct = parseFloat(f.bosqueActual) || 0;

    if (ha <= 0 || prod <= 0) {
      alert('Área cultivada y producción deben ser mayores a 0');
      return;
    }

    const fertPorHa = fert / ha;
    const fertEmision = fertPorHa * (f.tipoFertilizante === 'sintetico' ? 4.5 : 1.2);
    const rendimiento = prod / ha;
    const poderCalorifico = f.tipoCombustible === 'diesel' ? 36 : f.tipoCombustible === 'gas' ? 38 : 45;
    const energiaComb = (comb * poderCalorifico) / 3.6;
    const energiaTotal = elec + energiaComb;
    const arbolesPorHa = parseFloat(f.arbolesSombra) / ha || 0;
    const coberturaPorc = (parseFloat(f.areaCopaPromedio) * parseFloat(f.arbolesSombra)) / (ha * 10000) * 100 || 0;
    const distanciaProm = (dist * vol) / vol || 0;
    const transpEmision = distanciaProm * 0.12;
    const coefProcesamiento = { lavado: 0.30, miel: 0.20, natural: 0.10 };
    const procEmision = prod * coefProcesamiento[f.tipoProcesamiento];
    const fraccionCompost = residuosTot > 0 ? compost / residuosTot : 0;
    const residuosEmision = (residuosTot - compost) * 0.5;
    const deforestacionPorc = bosqueBase > 0 ? ((bosqueBase - bosqueAct) / ha) * 100 : 0;
    const deforestacionEmision = deforestacionPorc > 0 ? deforestacionPorc * 1500 : 0;

    const total =
      (fertEmision * ha) +
      (energiaTotal * 0.45) +
      transpEmision +
      procEmision +
      residuosEmision +
      deforestacionEmision;

    const porKg = prod > 0 ? total / prod : 0;

    const data = [
      { name: 'Fertilizantes', value: fertEmision * ha },
      { name: 'Energía', value: energiaTotal * 0.45 },
      { name: 'Transporte', value: transpEmision },
      { name: 'Procesamiento', value: procEmision },
      { name: 'Residuos', value: residuosEmision },
      { name: 'Deforestación', value: deforestacionEmision },
    ].filter((d) => d.value > 0);

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
        body: JSON.stringify({
          nombreFinca: form.nombreFinca || 'Cálculo EUDR',
          ...form,
          ...resultado,
        }),
      });
      if (!res.ok) throw new Error('Error al guardar');

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setForm(prev => ({
        ...prev,
        nombreFinca: prev.nombreFinca,
        areaCultivada: '',
        produccionVerde: '',
        fertilizanteTotal: '',
        energiaElectrica: '',
        combustibleLitros: '',
        arbolesSombra: '',
        areaCopaPromedio: '',
        distanciaKm: '',
        volumenCargas: '',
        residuosTotales: '',
        residuosCompostados: '',
        bosqueBase: '',
        bosqueActual: '',
      }));
      setResultado(null);
      setChartData([]);
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
        <div className="coffee-cup">
          <div className="steam"></div>
          <div className="steam"></div>
          <div className="steam"></div>
        </div>
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
          <div className="calculadora-container">
            <h2 className="section-title">Calculadora de Huella de Carbono – EUDR</h2>

          <div className="progress-container">

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(step+1) * (100/8)}%` }}></div>
            </div>

            <p className="progress-text">Paso {step+1} de 8</p>
            
            <div className="steps-indicators">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className={`indicator ${step === i ? "active" : step > i ? "done" : ""}`}></span>
              ))}
            </div>

          </div>

<form onSubmit={calcularHuella} className="calculadora-form">
  <div
    className="form-steps"
    style={{ transform: `translateX(-${step * 100}%)` }}
  >
    {/* Paso 1 */}
    <div className="form-step">
      <h4 className="section-title">1. Información de la Finca</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>Nombre de la finca</label>
          <input
            type="text"
            name="nombreFinca"
            value={form.nombreFinca}
            onChange={handleInputChange}
            placeholder="Cargando finca..."
            readOnly
            style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
          />
        </div>
        <div className="form-group">
          <label>Área cultivada (ha)</label>
          <input type="number" name="areaCultivada" value={form.areaCultivada} onChange={handleInputChange} min="0" step="0.1" required />
        </div>
        <div className="form-group">
          <label>Producción café verde (kg)</label>
          <input type="number" name="produccionVerde" value={form.produccionVerde} onChange={handleInputChange} min="0" step="1" required />
        </div>
      </div>
    </div>

    {/* Paso 2 */}
    <div className="form-step">
      <h4 className="section-title">2. Fertilización</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>Fertilizante total (kg)</label>
          <input type="number" name="fertilizanteTotal" value={form.fertilizanteTotal} onChange={handleInputChange} min="0" step="1" />
        </div>
        <div className="form-group">
          <label>Tipo de fertilizante</label>
          <select name="tipoFertilizante" value={form.tipoFertilizante} onChange={handleInputChange}>
            <option value="sintetico">Sintético</option>
            <option value="organico">Orgánico</option>
          </select>
        </div>
      </div>
    </div>

    {/* Paso 3 */}
    <div className="form-step">
      <h4 className="section-title">3. Energía en Beneficiado y Secado</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>Energía eléctrica (kWh)</label>
          <input type="number" name="energiaElectrica" value={form.energiaElectrica} onChange={handleInputChange} min="0" step="1" />
        </div>
        <div className="form-group">
          <label>Combustible (litros)</label>
          <input type="number" name="combustibleLitros" value={form.combustibleLitros} onChange={handleInputChange} min="0" step="0.1" />
        </div>
        <div className="form-group">
          <label>Tipo de combustible</label>
          <select name="tipoCombustible" value={form.tipoCombustible} onChange={handleInputChange}>
            <option value="diesel">Diésel</option>
            <option value="gas">Gasolina</option>
            <option value="leña">Leña</option>
          </select>
        </div>
      </div>
    </div>

    {/* Paso 4 */}
    <div className="form-step">
      <h4 className="section-title">4. Cobertura Arbórea / Sombra</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>Número de árboles de sombra</label>
          <input type="number" name="arbolesSombra" value={form.arbolesSombra} onChange={handleInputChange} min="0" step="1" />
        </div>
        <div className="form-group">
          <label>Área promedio de copa (m²/árbol)</label>
          <input type="number" name="areaCopaPromedio" value={form.areaCopaPromedio} onChange={handleInputChange} min="0" step="0.1" />
        </div>
      </div>
    </div>

    {/* Paso 5 */}
    <div className="form-step">
      <h4 className="section-title">5. Transporte del Café</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>Distancia promedio (km)</label>
          <input type="number" name="distanciaKm" value={form.distanciaKm} onChange={handleInputChange} min="0" step="0.1" />
        </div>
        <div className="form-group">
          <label>Volumen total (cargas)</label>
          <input type="number" name="volumenCargas" value={form.volumenCargas} onChange={handleInputChange} min="0" step="1" />
        </div>
      </div>
    </div>

    {/* Paso 6 */}
    <div className="form-step">
      <h4 className="section-title">6. Tipo de Procesamiento</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>Tipo de procesamiento</label>
          <select name="tipoProcesamiento" value={form.tipoProcesamiento} onChange={handleInputChange}>
            <option value="lavado">Lavado</option>
            <option value="miel">Miel</option>
            <option value="natural">Natural</option>
          </select>
        </div>
      </div>
    </div>

    {/* Paso 7 */}
    <div className="form-step">
      <h4 className="section-title">7. Residuos y Compostaje</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>Residuos totales (kg)</label>
          <input type="number" name="residuosTotales" value={form.residuosTotales} onChange={handleInputChange} min="0" step="1" />
        </div>
        <div className="form-group">
          <label>Residuos compostados (kg)</label>
          <input type="number" name="residuosCompostados" value={form.residuosCompostados} onChange={handleInputChange} min="0" step="1" />
        </div>
      </div>
    </div>

    {/* Paso 8 */}
    <div className="form-step">
      <h4 className="section-title">8. Verificación EUDR - No Deforestación</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>Bosque base 2020 (ha)</label>
          <input type="number" name="bosqueBase" value={form.bosqueBase} onChange={handleInputChange} min="0" step="0.1" />
        </div>
        <div className="form-group">
          <label>Bosque actual (ha)</label>
          <input type="number" name="bosqueActual" value={form.bosqueActual} onChange={handleInputChange} min="0" step="0.1" />
        </div>
      </div>
    </div>
  </div>

  {/* Navegación */}
  <div className="form-nav">
    {step > 0 && <button type="button" onClick={() => setStep(step - 1)}>Anterior</button>}
    {step < 7 && <button type="button" onClick={() => setStep(step + 1)}>Siguiente</button>}
    {step === 7 && <button type="submit" className="btn-calcular">Calcular Huella EUDR</button>}
  </div>
</form>


            {resultado && (
              <div className="resultado-section">
                <h3>Resultados EUDR – {form.nombreFinca}</h3>
                <div className="resultado-cards">
                  <div className="card">
                    <p className="card-title">Huella Total </p>
                    <p className="card-value">{resultado.total} kg CO₂e</p>
                  </div>
                  <div className="card">
                    <p className="card-title">Por kg de café </p>
                    <p className="card-value">{resultado.porKg} kg CO₂e/kg</p>
                  </div>
                </div>

                {/* ← GRÁFICO DE BARRAS HORIZONTALES */}
                {/* ← GRÁFICO DE BARRAS PROPORCIONALES AL PORCENTAJE */}
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
                            <div
                              className="bar-fill"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: COLORS[i % COLORS.length],
                              }}
                            />
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

      {showSuccess && (
        <div className="success-toast">
          <svg className="check-icon" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
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
  /* === CONTENEDOR PRINCIPAL === */
  .calculadora-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .section-title {
    text-align: center;
    color: #2d6a4f;
    margin-bottom: 30px;
    font-size: 1.8rem;
    font-weight: 600;
  }

  /* === PROGRESS CONTAINER === */
  .progress-container {
    margin-bottom: 2rem;
    text-align: center;
  }

  .progress-bar {
    width: 100%;
    height: 10px;
    background: #e7e7e7;
    border-radius: 50px;
    overflow: hidden;
    margin-bottom: 12px;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #2d6a4f, #40916c);
    border-radius: 50px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-text {
    font-size: 1rem;
    font-weight: 600;
    color: #2d6a4f;
    margin-bottom: 12px;
  }

  .steps-indicators {
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  .indicator {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #bfbfbf;
    transition: all 0.3s ease;
  }

  .indicator.active {
    background: #2d6a4f;
    transform: scale(1.4);
    box-shadow: 0 0 0 4px rgba(45, 106, 79, 0.2);
  }

  .indicator.done {
    background: #74c69d;
    transform: scale(1.1);
  }

  /* === WIZARD DESLIZANTE === */
  .calculadora-form {
    background: white;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    overflow: hidden;
    margin-bottom: 30px;
  }

  .form-steps {
    display: flex;
    width: 800%;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .form-step {
    width: 12.5%;
    flex-shrink: 0;
    padding: 0 12px;
    box-sizing: border-box;
  }

  .form-step h4.section-title {
    text-align: center;
    font-size: 1.35rem;
    color: #2d6a4f;
    margin: 0 0 22px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid #95d5b2;
    font-weight: 600;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 18px;
    margin-bottom: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    margin-bottom: 8px;
    font-weight: 600;
    color: #2d6a4f;
    font-size: 0.95rem;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #95d5b2;
    border-radius: 10px;
    font-size: 1rem;
    background-color: #fdfdfd;
    transition: all 0.3s ease;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #2d6a4f;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.15);
    transform: translateY(-1px);
  }

  .form-group input[readOnly] {
    background-color: #f8f9fa !important;
    cursor: not-allowed;
    color: #6c757d;
  }

  /* === BOTONES DE NAVEGACIÓN === */
  .form-nav {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 30px;
    flex-wrap: wrap;
  }

  .form-nav button {
    flex: 1;
    min-width: 120px;
    padding: 14px 20px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  }

  .form-nav button:first-child {
    background: #95d5b2;
    color: #2d6a4f;
  }

  .form-nav button:first-child:hover {
    background: #74c69d;
    transform: translateY(-2px);
  }

  .form-nav button:last-child,
  .btn-calcular {
    background: linear-gradient(135deg, #2d6a4f, #40916c);
    color: white;
  }

  .form-nav button:last-child:hover,
  .btn-calcular:hover {
    background: linear-gradient(135deg, #1f4d38, #2d6a4f);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(45, 106, 79, 0.3);
  }

  /* === RESULTADOS === */
  .resultado-section {
    margin-top: 2.5rem;
    padding: 2rem;
    border-radius: 16px;
    background: #f8f9fa;
    border: 1px solid #e3e3e3;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .resultado-section h3 {
    text-align: center;
    margin-bottom: 1.8rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d6a4f;
  }

  .resultado-cards {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .card {
    background: white;
    padding: 1.5rem 2rem;
    border-radius: 12px;
    border: 1px solid #dedede;
    width: 260px;
    text-align: center;
    box-shadow: 0 3px 10px rgba(0,0,0,0.06);
    transition: all 0.3s ease;
  }

  .card:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.12);
  }

  .card-title {
    font-size: 1rem;
    font-weight: 500;
    color: #555;
    margin-bottom: 0.6rem;
  }

  .card-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2d6a4f;
  }

  /* === GRÁFICO DE BARRAS === */
  .chart-container {
    margin: 2rem 0;
    padding: 1.5rem;
    background: #f9f9f9;
    border-radius: 14px;
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.05);
  }

  .bars-chart {
    display: flex;
    flex-direction: column;
    gap: 18px;
    max-width: 700px;
    margin: 0 auto;
  }

  .bar-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bar-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
    font-weight: 600;
    color: #444;
  }

  .bar-name {
    color: #2d6a4f;
  }

  .bar-value {
    color: #666;
    font-weight: normal;
  }

  .bar-wrapper {
    width: 100%;
    height: 36px;
    background: #e8ecef;
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  }

  .bar-fill {
    height: 100%;
    border-radius: 18px;
    transition: width 1.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .total-center {
    text-align: center;
    margin-top: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  }

  .total-value {
    font-size: 2.2rem;
    font-weight: 700;
    color: #2d6a4f;
  }

  .total-center small {
    font-size: 0.9rem;
    color: #666;
    display: block;
    margin-top: 6px;
  }

  /* === INDICADORES EUDR === */
  .eudr-indicators {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin: 2rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 12px;
  }

  .eudr-indicators .indicator {
    font-size: 0.95rem;
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px dashed #ddd;
  }

  .eudr-indicators .indicator:last-child {
    border-bottom: none;
  }

  .btn-guardar {
    display: block;
    margin: 1.5rem auto 0;
    padding: 14px 36px;
    background: #40916c;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 10px rgba(64, 145, 108, 0.3);
  }

  .btn-guardar:hover:not(:disabled) {
    background: #2d6a4f;
    transform: translateY(-2px);
  }

  .btn-guardar:disabled {
    background: #95d5b2;
    cursor: not-allowed;
    transform: none;
  }

  /* === TOASTS === */
  .success-toast, .error-toast {
    position: fixed;
    bottom: 30px;
    right: 30px;
    padding: 16px 28px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    gap: 14px;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.4s ease-out, fadeOut 0.5s 2.5s forwards;
  }

  .success-toast {
    background: #2d6a4f;
    color: white;
  }

  .error-toast {
    background: #c62828;
    color: white;
  }

  .check-icon, .error-icon {
    width: 26px;
    height: 26px;
    stroke: white;
    stroke-width: 3;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .check-icon polyline, .error-icon line {
    stroke-dasharray: 22;
    stroke-dashoffset: 66;
    animation: drawCheck 0.6s ease-out 0.3s forwards;
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

  /* === RESPONSIVE === */
  @media (max-width: 768px) {
    .calculadora-container {
      padding: 15px;
    }

    .section-title {
      font-size: 1.5rem;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .form-step {
      padding: 0 5px;
    }

    .form-nav {
      flex-direction: column;
    }

    .form-nav button {
      margin: 8px 0;
    }

    .resultado-cards {
      flex-direction: column;
      align-items: center;
    }

    .card {
      width: 100%;
      max-width: 300px;
    }

    .bars-chart {
      max-width: 100%;
    }

    .eudr-indicators {
      grid-template-columns: 1fr;
    }
  }
`}</style>
    </>
  );
}