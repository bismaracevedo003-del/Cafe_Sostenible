// src/pages/Calculadora.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';
import jsPDF from 'jspdf';
import logoEUDR from '../assets/IMG_6194.PNG';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const CATEGORY_COLORS = {
  'Fertilizantes': '#2d6a4f',
  'Energía': '#40916c',
  'Transporte': '#52b788',
  'Procesamiento': '#74c69d',
  'Residuos': '#95d5b2',
  'Deforestación': '#b7e4c7'
};

export default function Calculadora() {
  const [form, setForm] = useState({
    nombreProductor: '',
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
  const [paso, setPaso] = useState(0);
  const totalPasos = 9;
  const sections = [
    {
      title: "Información Básica",
      bg: "",
      fields: [
        { label: "Nombre del Productor", name: "nombreProductor", type: "text" },
        { label: "Nombre de la Finca", name: "nombreFinca", type: "text" },
      ]
    },
    {
      title: "Datos Generales",
      bg: "",
      fields: [
        { label: "Área cultivada (ha)", name: "areaCultivada", type: "number", step: "0.1" },
        { label: "Producción café verde (kg)", name: "produccionVerde", type: "number" },
      ]
    },
    {
      title: "Fertilizantes",
      bg: "",
      fields: [
        { label: "Fertilizante total (kg)", name: "fertilizanteTotal", type: "number" },
        { label: "Tipo de fertilizante", name: "tipoFertilizante", type: "select", options: ["sintetico", "organico"] },
      ]
    },
    {
      title: "Energía",
      bg: "",
      fields: [
        { label: "Energía eléctrica (kWh)", name: "energiaElectrica", type: "number" },
        { label: "Combustible (litros)", name: "combustibleLitros", type: "number", step: "0.1" },
        { label: "Tipo de combustible", name: "tipoCombustible", type: "select", options: ["diesel", "gas", "otro"] },
      ]
    },
    {
      title: "Árboles de Sombra",
      bg: "",
      fields: [
        { label: "Número de árboles de sombra", name: "arbolesSombra", type: "number" },
        { label: "Área promedio de copa (m²/árbol)", name: "areaCopaPromedio", type: "number", step: "0.1" },
      ]
    },
    {
      title: "Transporte",
      bg: "",
      fields: [
        { label: "Distancia promedio (km)", name: "distanciaKm", type: "number", step: "0.1" },
        { label: "Volumen total (cargas)", name: "volumenCargas", type: "number" },
      ]
    },
    {
      title: "Procesamiento",
      bg: "",
      fields: [
        { label: "Tipo de procesamiento", name: "tipoProcesamiento", type: "select", options: ["lavado", "miel", "natural"] },
      ]
    },
    {
      title: "Residuos",
      bg: "",
      fields: [
        { label: "Residuos totales (kg)", name: "residuosTotales", type: "number" },
        { label: "Residuos compostados (kg)", name: "residuosCompostados", type: "number" },
      ]
    },
    {
      title: "Deforestación",
      bg: "",
      fields: [
        { label: "Bosque base 2020 (ha)", name: "bosqueBase", type: "number", step: "0.1" },
        { label: "Bosque actual (ha)", name: "bosqueActual", type: "number", step: "0.1" },
      ]
    },
  ];

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

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const addArc = (doc, cx, cy, radius, startAngle, endAngle) => {
    const numSegments = Math.ceil((endAngle - startAngle) / 5); // Segmento cada 5 grados para suavidad
    const theta = (endAngle - startAngle) / numSegments;
    let currentAngle = startAngle;

    for (let i = 0; i < numSegments; i++) {
      currentAngle += theta;
      const rad = currentAngle * Math.PI / 180;
      doc.lineTo(cx + radius * Math.cos(rad), cy + radius * Math.sin(rad));
    }
  };

  const drawPieChart = (doc, data, x, y, radius) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let startAngle = 0;

    data.forEach((d) => {
      const angle = (d.value / total) * 360;
      const endAngle = startAngle + angle;

      const color = hexToRgb(CATEGORY_COLORS[d.name] || '#000000');
      doc.setFillColor(color.r, color.g, color.b);

      const startRad = startAngle * Math.PI / 180;
      const startX = x + radius * Math.cos(startRad);
      const startY = y + radius * Math.sin(startRad);

      doc.moveTo(x, y);
      doc.lineTo(startX, startY);
      addArc(doc, x, y, radius, startAngle, endAngle);
      doc.lineTo(x, y);
      doc.fill();

      startAngle = endAngle;
    });
/*
    // Leyenda
    let legendY = y - radius - 20;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Desglose de Emisiones', x - radius, legendY);
    legendY += 10;

    data.forEach((d) => {
      const color = hexToRgb(CATEGORY_COLORS[d.name] || '#000000');
      doc.setFillColor(color.r, color.g, color.b);
      doc.rect(x - radius, legendY, 10, 10, 'F');
      doc.setTextColor(0);
      doc.text(`${d.name} (${((d.value / total) * 100).toFixed(0)}%)`, x - radius + 15, legendY + 8);
      legendY += 15;
    });*/
  };

const guardarEnHistorial = async () => {
  if (!resultado) return;

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ESTILOS
    const COLOR_PRIMARIO = "#1b4332";
    const COLOR_SUAVE = "#e9ecef";

    const drawSeparator = (y) => {
      doc.setDrawColor(180);
      doc.setLineWidth(0.3);
      doc.line(15, y, pageWidth - 15, y);
    };

    const addPageFooter = () => {
      doc.setFontSize(9);
      doc.setTextColor("#555");
      doc.text("Generado por EUDR Calculator App", 15, pageHeight - 8);
      doc.text(`Página ${doc.getCurrentPageInfo().pageNumber} de 4`, pageWidth - 40, pageHeight - 8);
    };

    // =============================
    //   PÁGINA 1: PORTADA
    // =============================
    doc.setFillColor("#f8f9fa");
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.addImage(logoEUDR, "PNG", (pageWidth - 80) / 2, 40, 80, 80);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(COLOR_PRIMARIO);
    doc.text("Reporte de Huella de Carbono", pageWidth / 2, 140, { align: "center" });

    doc.setFontSize(18);
    doc.text("Reglamento EUDR", pageWidth / 2, 155, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor("#222222");
    let y = 180;
    doc.text(`Productor: ${form.nombreProductor || "N/A"}`, pageWidth / 2, y, { align: "center" }); y += 10;
    doc.text(`Finca: ${form.nombreFinca || "N/A"}`, pageWidth / 2, y, { align: "center" }); y += 10;
    doc.text(`Área Cultivada: ${form.areaCultivada || "0"} ha`, pageWidth / 2, y, { align: "center" }); y += 10;
    doc.text(`Producción: ${form.produccionVerde || "0"} kg café verde`, pageWidth / 2, y, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor("#555");
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, pageWidth / 2, y + 20, { align: "center" });

    doc.setFontSize(9);
    doc.text("Generado por EUDR Calculator App", pageWidth / 2, pageHeight - 20, { align: "center" });
    addPageFooter();

    // =============================
    //   PÁGINA 2: INSUMOS Y PROCESOS
    // =============================
    doc.addPage();
    y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(COLOR_PRIMARIO);
    doc.text("Insumos y Procesos", 15, y);
    y += 15;
    drawSeparator(y);
    y += 10;

    const sectionTitle = (title) => {
      doc.setFillColor(COLOR_SUAVE);
      doc.rect(15, y - 5, pageWidth - 30, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(COLOR_PRIMARIO);
      doc.text(title, 18, y + 2);
      y += 14;
    };

    const addLine = (label, value) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor("#222222");
      doc.text(label, 18, y);
      doc.text(String(value), 95, y);
      y += 7;
    };

    sectionTitle("Insumos y Procesos");
    addLine("Fertilizante Total (kg)", form.fertilizanteTotal || "0");
    addLine("Tipo de Fertilizante", form.tipoFertilizante.charAt(0).toUpperCase() + form.tipoFertilizante.slice(1));
    addLine("Energía Eléctrica (kWh)", form.energiaElectrica || "0");
    addLine("Combustible (litros)", form.combustibleLitros || "0");
    addLine("Tipo de Combustible", form.tipoCombustible.charAt(0).toUpperCase() + form.tipoCombustible.slice(1));
    addLine("Árboles de Sombra", form.arbolesSombra || "0");
    addLine("Área de Copa (m²/árbol)", form.areaCopaPromedio || "0");
    addLine("Distancia de Transporte (km)", form.distanciaKm || "0");
    addLine("Volumen (cargas)", form.volumenCargas || "0");
    addLine("Tipo de Procesamiento", form.tipoProcesamiento.charAt(0).toUpperCase() + form.tipoProcesamiento.slice(1));
    addLine("Residuos Totales (kg)", form.residuosTotales || "0");
    addLine("Residuos Compostados (kg)", form.residuosCompostados || "0");
    addLine("Bosque Base 2020 (ha)", form.bosqueBase || "0");
    addLine("Bosque Actual (ha)", form.bosqueActual || "0");

    addPageFooter();

    // =============================
    //   PÁGINA 3: RESULTADOS (CON COLORES Y ESTILO)
    // =============================
    doc.addPage();
    y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(COLOR_PRIMARIO);
    doc.text("Resultados", 15, y);
    y += 18;
    drawSeparator(y);
    y += 15;

    // === RESULTADOS PRINCIPALES (GRANDES Y DESTACADOS) ===
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");

    // Huella Total - Color rojo oscuro si es alta, verde si es baja
    const huellaTotal = parseFloat(resultado.total);
    doc.setTextColor(huellaTotal > 3000 ? "#9b2226" : huellaTotal > 1500 ? "#bb3e03" : "#2d6a4f");
    doc.text(`${resultado.total} kg CO₂e`, 15, y);
    doc.setFontSize(12);
    doc.setTextColor("#333");
    doc.text("Huella de Carbono Total", 15, y + 8);
    y += 28;

    // Huella por kg - El indicador más importante
    doc.setFontSize(20);
    doc.setTextColor(parseFloat(resultado.porKg) > 1.5 ? "#9b2226" : parseFloat(resultado.porKg) > 1.0 ? "#bb3e03" : "#2d6a4f");
    doc.text(`${resultado.porKg} kg CO₂e/kg`, 15, y);
    doc.setFontSize(12);
    doc.setTextColor("#333");
    doc.text("Huella por kg de café verde", 15, y + 8);
    y += 28;

    // Rendimiento - Siempre verde (positivo)
    doc.setFontSize(18);
    doc.setTextColor("#2d6a4f");
    doc.text(`${resultado.rendimiento} kg/ha`, 15, y);
    doc.setFontSize(11);
    doc.setTextColor("#444");
    doc.text("Rendimiento promedio", 15, y + 7);
    y += 35;

    // === RESULTADOS SECUNDARIOS (EN DOS COLUMNAS CON COLORES) ===
    const leftX = 20;
    const rightX = pageWidth / 2 + 10;
    let rowY = y;

    const indicadores = [
      { label: "Fertilizante por ha", value: `${resultado.fertPorHa} kg/ha`, color: "#8B4513" },
      { label: "Árboles por ha", value: resultado.arbolesPorHa, color: "#2d6a4f" },
      { label: "Cobertura de copa", value: `${resultado.coberturaPorc}%`, color: "#1b4332" },
      { label: "Distancia promedio", value: `${resultado.distanciaProm} km`, color: "#40916c" },
      { label: "Fracción compostada", value: `${resultado.fraccionCompost}%`, color: "#52b788" },
      { label: "Deforestación", value: `${resultado.deforestacionPorc}%`, color: resultado.deforestacionPorc === "0.0" ? "#2d6a4f" : "#9b2226" },
    ];

    indicadores.forEach((item, index) => {
      const isLeft = index % 2 === 0;
      const x = isLeft ? leftX : rightX;
      const currentY = rowY + Math.floor(index / 2) * 15;

      doc.setFontSize(11);
      doc.setTextColor("#555");
      doc.text("• " + item.label + ":", x, currentY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(item.color);
      doc.text(item.value, x + 55, currentY);
    });

    // Ajustar y para el pie de página
    y = rowY + Math.ceil(indicadores.length / 2) * 15 + 20;

    addPageFooter();

       // =============================
    //   PÁGINA 4: DESGLOSE + GRÁFICO CON LEYENDA
    // =============================
    doc.addPage();
    y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(COLOR_PRIMARIO);
    doc.text("Desglose de Emisiones", 15, y);
    y += 15;
    drawSeparator(y);
    y += 10;

    sectionTitle("Desglose de Emisiones");

    // --- Lista con colores ---
    chartData.forEach((d) => {
      const color = hexToRgb(CATEGORY_COLORS[d.name]);
      doc.setTextColor(color.r, color.g, color.b);
      const percent = ((d.value / parseFloat(resultado.total)) * 100).toFixed(1);
      addLine(d.name, `${d.value.toFixed(1)} kg CO₂e (${percent}%)`);
    });
    doc.setTextColor("#222222");

    y += 10;

    // --- Título del gráfico ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(COLOR_PRIMARIO);
    doc.text("Distribución de Emisiones", 15, y);
    y += 8;
    drawSeparator(y);
    y += 20;

    // --- GRÁFICO + LEYENDA AL LADO ---
    const chartCenterX = 80;        // Gráfico a la izquierda
    const chartCenterY = y + 50;
    const radius = 55;

    // Dibujar el gráfico (sin leyenda interna)
    drawPieChart(doc, chartData, chartCenterX, chartCenterY, radius);

    // Leyenda a la derecha del gráfico
    let legendX = 135;
    let legendY = chartCenterY - (chartData.length * 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor("#222");
    doc.text("Leyenda:", legendX, legendY);
    legendY += 10;

    chartData.forEach((d) => {
      const color = hexToRgb(CATEGORY_COLORS[d.name]);
      const percent = ((d.value / parseFloat(resultado.total)) * 100).toFixed(1);

      // Cuadro de color
      doc.setFillColor(color.r, color.g, color.b);
      doc.rect(legendX, legendY - 6, 8, 8, "F");

      // Texto
      doc.setTextColor("#000");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`${d.name}: ${percent}%`, legendX + 12, legendY);

      legendY += 12;
    });

    // Pie de página
    addPageFooter();
    addPageFooter();

    // === GUARDADO ===
    const pdfOutput = doc.output("blob");
    const reader = new FileReader();

    reader.onload = async () => {
      const base64data = reader.result.split(",")[1];
      const fileName = `huella_carbono_${form.nombreFinca || "eudr"}_${Date.now()}.pdf`;

      try {
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64data,
          directory: Directory.Documents,
        });

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3500);

        await Share.share({
          title: "Reporte EUDR",
          text: "Huella de carbono generada",
          url: savedFile.uri,
        });
      } catch (err) {
        setShowError(true);
        setTimeout(() => setShowError(false), 3500);
      }
    };

    reader.readAsDataURL(pdfOutput);

  } catch (err) {
    console.error(err);
    setShowError(true);
  }
};

  return (
    <>
      <header className="header">
        <div className="logo-section">
          <Link to="/home"><img src="/img/IMG_6194.PNG" alt="Logo" className="logo-img" /></Link>
          <div className="title-group">
            <h1 className="main-title">CAFÉ SOSTENIBLE</h1>
            <p className="subtitle">Cumplimiento EUDR</p>
          </div>
        </div>
      </header>
      <div className="main-container">
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
                {sections.map((grupo, index) => (
                  <div 
                    className="form-card" 
                    key={index} 
                    style={{ 
                      backgroundImage: `url(${grupo.bg})`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center' 
                    }}
                  >
                    <h2 className="section-title">{grupo.title}</h2>
                    <div className="form-grid">
                      {grupo.fields.map((campo, i) => {
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
                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                  </option>
                                ))}
                              </select>
                            ) : campo.type === "text" ? (
                              <input
                                type="text"
                                name={campo.name}
                                value={value}
                                onChange={handleInputChange}
                                placeholder="Ingrese nombre"
                                className="text-input"
                              />
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
                                      background: `linear-gradient(to right,
                                        hsl(${120 - ((value / max) * 120)}, 75%, 45%) 0%,
                                        hsl(${120 - ((value / max) * 120)}, 75%, 45%) ${(value / max) * 100}%,
                                        #e0e0e0 ${(value / max) * 100}%,
                                        #e0e0e0 100%)`
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
                <button onClick={guardarEnHistorial} className="btn-guardar">
                  Guardar en PDF
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
          <span>PDF generado exitosamente</span>
        </div>
      )}
      {showError && (
        <div className="error-toast">
          <svg className="error-icon" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span>Error al generar PDF</span>
        </div>
      )}
<style jsx>{`
  /* ← WIZARD CONTAINER */
  .wizard-container {
    max-width: 880px;
    min-height: 320px;
    margin: 0px auto;
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
    position: relative;
    background-color: rgba(255, 255, 255, 0.85); /* Opacidad para legibilidad sobre fondo */
    border-radius: 16px;
  }
  .form-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: inherit; /* Hereda el backgroundImage del style inline */
    background-size: cover;
    background-position: center;
    filter: blur(2px); /* Suavizado opcional */
    z-index: -1;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .section-title {
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    color: #1b5e20;
    margin-bottom: 24px;
    letter-spacing: -0.3px;
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
  /* ← INPUT TEXT */
  .text-input {
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
  .text-input:focus {
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
    background: linear-gradient(135deg, #000000ff, #000000ff);
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
    gap: 28px;
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
    .wizard-container {
    margin: 0;
    border-radius: 20px 20px 0 0;
    min-height: 100vh;
    padding: 28px 20px;
  }
    .wizard-title { font-size: 24px; }
    .form-card { padding: 20px; }
    .progress-indicator { height: 8px; }
    .progress-text { font-size: 12px; }
  }
`}</style>
    </>
  );
}