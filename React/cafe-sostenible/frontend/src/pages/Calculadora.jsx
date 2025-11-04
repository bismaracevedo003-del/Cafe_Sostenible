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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/user`, { credentials: 'include' });
        if (!res.ok) throw new Error('No autorizado');
        const data = await res.json();
        setUser(data);

        // Llenar automáticamente el nombre de la finca
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

    // 1. Fertilizante (kg/ha)
    const fertPorHa = fert / ha;
    const fertEmision = fertPorHa * (f.tipoFertilizante === 'sintetico' ? 4.5 : 1.2);

    // 2. Rendimiento
    const rendimiento = prod / ha;

    // 3. Energía
    const poderCalorifico = f.tipoCombustible === 'diesel' ? 36 : f.tipoCombustible === 'gas' ? 38 : 45;
    const energiaComb = (comb * poderCalorifico) / 3.6;
    const energiaTotal = elec + energiaComb;

    // 4. Cobertura arbórea
    const arbolesPorHa = parseFloat(f.arbolesSombra) / ha || 0;
    const coberturaPorc = (parseFloat(f.areaCopaPromedio) * parseFloat(f.arbolesSombra)) / (ha * 10000) * 100 || 0;

    // 5. Transporte
    const distanciaProm = (dist * vol) / vol || 0;
    const transpEmision = distanciaProm * 0.12;

    // 6. Procesamiento
    const coefProcesamiento = { lavado: 0.30, miel: 0.20, natural: 0.10 };
    const procEmision = prod * coefProcesamiento[f.tipoProcesamiento];

    // 7. Residuos
    const fraccionCompost = residuosTot > 0 ? compost / residuosTot : 0;
    const residuosEmision = (residuosTot - compost) * 0.5;

    // 8. Deforestación
    const deforestacionPorc = bosqueBase > 0 ? ((bosqueBase - bosqueAct) / ha) * 100 : 0;
    const deforestacionEmision = deforestacionPorc > 0 ? deforestacionPorc * 1500 : 0;

    // Total
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
          fecha: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      alert('Cálculo EUDR guardado');
      setForm(prev => ({
        ...prev,
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
      alert('Error al guardar');
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

  const generateSVG = () => {
    if (!resultado || chartData.length === 0) return null;
    const total = parseFloat(resultado.total);
    let cumulative = 0;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;

    return (
      <svg width="200" height="200" viewBox="0 0 200 200" className="pie-chart-svg">
        <g transform="translate(100,100)">
          <circle r={radius} fill="none" stroke="#e0e0e0" strokeWidth="36" />
          {chartData.map((item, i) => {
            const percent = (item.value / total) * 100;
            const dashOffset = circumference - (cumulative / total) * circumference;
            cumulative += item.value;
            return (
              <circle
                key={i}
                r={radius}
                fill="none"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth="36"
                strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
                strokeDashoffset={-dashOffset}
                transform="rotate(-90)"
                className="pie-segment"
              />
            );
          })}
        </g>
        <text x="100" y="95" textAnchor="middle" className="pie-center-total">
          {resultado.porKg}
        </text>
        <text x="100" y="115" textAnchor="middle" className="pie-center-label">
          kg CO₂e/kg
        </text>
      </svg>
    );
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
          <div className="calculadora-container">
            <h2 className="section-title">Calculadora de Huella de Carbono – EUDR</h2>

            <form onSubmit={calcularHuella} className="calculadora-form">
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
                {/* Resto de campos... */}
                <div className="form-group">
                  <label>Área cultivada (ha)</label>
                  <input type="number" name="areaCultivada" value={form.areaCultivada} onChange={handleInputChange} min="0" step="0.1" required />
                </div>
                <div className="form-group">
                  <label>Producción café verde (kg)</label>
                  <input type="number" name="produccionVerde" value={form.produccionVerde} onChange={handleInputChange} min="0" step="1" required />
                </div>
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
                <div className="form-group">
                  <label>Número de árboles de sombra</label>
                  <input type="number" name="arbolesSombra" value={form.arbolesSombra} onChange={handleInputChange} min="0" step="1" />
                </div>
                <div className="form-group">
                  <label>Área promedio de copa (m²/árbol)</label>
                  <input type="number" name="areaCopaPromedio" value={form.areaCopaPromedio} onChange={handleInputChange} min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label>Distancia promedio (km)</label>
                  <input type="number" name="distanciaKm" value={form.distanciaKm} onChange={handleInputChange} min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label>Volumen total (cargas)</label>
                  <input type="number" name="volumenCargas" value={form.volumenCargas} onChange={handleInputChange} min="0" step="1" />
                </div>
                <div className="form-group">
                  <label>Tipo de procesamiento</label>
                  <select name="tipoProcesamiento" value={form.tipoProcesamiento} onChange={handleInputChange}>
                    <option value="lavado">Lavado</option>
                    <option value="miel">Miel</option>
                    <option value="natural">Natural</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Residuos totales (kg)</label>
                  <input type="number" name="residuosTotales" value={form.residuosTotales} onChange={handleInputChange} min="0" step="1" />
                </div>
                <div className="form-group">
                  <label>Residuos compostados (kg)</label>
                  <input type="number" name="residuosCompostados" value={form.residuosCompostados} onChange={handleInputChange} min="0" step="1" />
                </div>
                <div className="form-group">
                  <label>Bosque base 2020 (ha)</label>
                  <input type="number" name="bosqueBase" value={form.bosqueBase} onChange={handleInputChange} min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label>Bosque actual (ha)</label>
                  <input type="number" name="bosqueActual" value={form.bosqueActual} onChange={handleInputChange} min="0" step="0.1" />
                </div>
              </div>

              <button type="submit" className="btn-calcular">Calcular Huella EUDR</button>
            </form>

            {resultado && (
              <div className="resultado-section">
                <h3>Resultados EUDR – {form.nombreFinca}</h3>
                {/* ... resto del resultado ... */}
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
                  <div className="chart-wrapper">{generateSVG()}</div>
                  <div className="legend">
                    {chartData.map((d, i) => (
                      <div key={i} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                        <span className="legend-label">
                          {d.name}: {d.value.toFixed(1)} kg ({((d.value / parseFloat(resultado.total)) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
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

      <style jsx>{`
        .calculadora-container { max-width: 1000px; margin: 0 auto; padding: 20px; }
        .section-title { text-align: center; color: #2d6a4f; margin-bottom: 30px; font-size: 24px; }
        .calculadora-form { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 6px; font-weight: 600; color: #2d6a4f; font-size: 14px; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #95d5b2; border-radius: 8px; font-size: 15px; }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: #2d6a4f; box-shadow: 0 0 0 2px rgba(45,106,79,0.2); }
        .btn-calcular { width: 100%; padding: 14px; background: #2d6a4f; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
        .btn-calcular:hover { background: #1f4d38; }
        .resultado-section { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
        .resultado-section h3 { color: #2d6a4f; margin-bottom: 20px; }
        .resultado-cards { display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; margin-bottom: 30px; }
        .card { background: #f1f8f5; padding: 20px; border-radius: 12px; min-width: 160px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .card-title { font-size: 14px; color: #555; margin-bottom: 8px; }
        .card-value { font-size: 24px; font-weight: 700; color: #2d6a4f; }
        .chart-container { margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 12px; }
        .chart-wrapper { display: flex; justify-content: center; margin-bottom: 20px; }
        .pie-chart-svg { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
        .pie-center-total { font-size: 28px; font-weight: 700; fill: #2d6a4f; }
        .pie-center-label { font-size: 14px; fill: #555; }
        .legend { display: flex; flex-direction: column; gap: 8px; max-width: 320px; margin: 0 auto; }
        .legend-item { display: flex; align-items: center; font-size: 14px; }
        .legend-color { width: 16px; height: 16px; border-radius: 4px; display: inline-block; margin-right: 10px; }
        .legend-label { color: #444; }
        .eudr-indicators { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 25px 0; padding: 15px; background: #f8f9fa; border-radius: 10px; }
        .indicator { font-size: 15px; display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .indicator:last-child { border-bottom: none; }
        .btn-guardar { margin-top: 20px; padding: 12px 30px; background: #40916c; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-guardar:hover:not(:disabled) { background: #2d6a4f; }
        .btn-guardar:disabled { background: #95d5b2; cursor: not-allowed; }
        @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .eudr-indicators { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}