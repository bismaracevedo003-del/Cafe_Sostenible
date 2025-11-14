export default function Stats() {
  const stats = [
    { value: "1.2 kg", label: "CO₂ por kg de café verde" },
    { value: "70%", label: "de emisiones en finca" },
    { value: "35%", label: "reducible con buenas prácticas" },
  ];

  return (
    <section className="stats">
      <div className="stats-container">
        {stats.map((s, i) => (
          <div key={i} className="stat">
            <span className="number">{s.value}</span> {s.label}
          </div>
        ))}
      </div>
    </section>
  );
}