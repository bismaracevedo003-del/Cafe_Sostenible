export default function Header() {
  return (
    <header className="header">
      <div className="logo-section">
        <img src="/img/IMG_6194.PNG" alt="Logo" className="logo-img" />
        <div className="title-group">
          <h1 className="main-title">CAFÉ SOSTENIBLE</h1>
          <p className="subtitle">Café Sostenible Caficultura</p>
        </div>
      </div>
      <Link to="/noticias" className="news-link">Noticias</Link>
    </header>
  );
}