
import { useNavigate, Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="logo-section">
        <Link to="/home"><img src="/img/IMG_6194.PNG" alt="Logo" className="logo-img" /></Link>

        <div className="title-group">
          <h1 className="main-title">CAFÉ SOSTENIBLE</h1>
          <p className="subtitle">Café Sostenible Caficultura</p>
        </div>
      </div>
      <Link to="/noticias" className="news-link">Noticias</Link>
    </header>
  );
}