export default function HowItWorks() {
  const steps = [
    { number: 1, title: "Regístrate", text: "Con tu código de asociado." },
    { number: 2, title: "Ingresa datos", text: "De tu finca y procesos." },
    { number: 3, title: "Obtén resultados", text: "Reporte + recomendaciones." },
  ];

  return (
    <section className="how-it-works">
      <h2>¿Cómo funciona?</h2>
      <div className="steps">
        {steps.map((s) => (
          <div key={s.number} className="step">
            <div className="step-number">{s.number}</div>
            <h4>{s.title}</h4>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}