export default function Benefits() {
  const benefits = [
    { icon: "icon-leaf.svg", title: "Sostenible", text: "Reduce emisiones y mejora tu suelo." },
    { icon: "icon-graph.svg", title: "Datos Reales", text: "Calculadora basada en normas internacionales." },
    { icon: "icon-certificate.svg", title: "Certificación", text: "Obtén sello de café carbono neutro." },
  ];

  return (
    <section className="benefits">
      <h2>Nuestra Propuesta</h2>
      <div className="benefits-grid">
        {benefits.map((b, i) => (
          <div key={i} className="benefit-card">
            <img src={`/img/${b.icon}`} alt={b.title} />
            <h3>{b.title}</h3>
            <p>{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}