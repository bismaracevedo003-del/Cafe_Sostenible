export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h2>Calcula tu huella de carbono</h2>
        <p className="hero-text">
          Únete a la caficultura sostenible. Regístrate, mide tu impacto y mejora tu finca.
        </p>
        <a href="/calculadora" className="btn-login">Iniciar Sesión</a>
      </div>
      <div className="hero-image">
        <img src="/img/fondo_cafe.jpg" alt="Café Sostenible" className="hero-img" />
      </div>
    </section>
  );
}