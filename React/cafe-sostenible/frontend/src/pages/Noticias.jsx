import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_URL;

export default function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/noticias`)
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar noticias');
        return res.json();
      })
      .then(data => {
        setNoticias(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

    if (loading) {
    return (
      <div className="coffee-loader">
        <div className="coffee-cup">
          <div className="steam"></div>
          <div className="steam"></div>
          <div className="steam"></div>
        </div>
        <p className="coffee-text">Cargando tus noticias...</p>
      </div>
    );
  }
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
      <Header />
      <main className="news-main">
        <h1 className="news-title">Noticias sobre Café Sostenible y EUDR</h1>
        <div className="news-grid">
          {noticias.map((noticia) => (
            <article key={noticia.url} className="news-card">
              {/* Imagen destacada */}
              {noticia.image ? (
                <a href={noticia.url} target="_blank" rel="noopener noreferrer" className="news-card-img-link">
                  <img
                    src={noticia.image}
                    alt={noticia.title}
                    className="news-card-img"
                    loading="lazy"
                  />
                </a>
              ) : (
                <div className="news-card-img-placeholder">
                  <span>Sin imagen</span>
                </div>
              )}

              {/* Contenido */}
              <div className="news-card-content">
                <h2 className="news-card-title">
                  <a href={noticia.url} target="_blank" rel="noopener noreferrer">
                    {noticia.title}
                  </a>
                </h2>
                <p className="news-card-date">{noticia.date}</p>
                <p className="news-card-snippet">{noticia.snippet}</p>
                <a href={noticia.url} className="news-card-link" target="_blank" rel="noopener noreferrer">
                  Leer más
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}