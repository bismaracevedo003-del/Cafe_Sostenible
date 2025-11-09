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

  if (loading) return <div className="loading">Cargando noticias...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
      <Header />
      <main className="news-main">
        <h1 className="news-title">Noticias sobre Café Sostenible y EUDR</h1>
        <div className="news-grid">
          {noticias.map((noticia, index) => (
            <div key={index} className="news-card">
              <h2 className="news-card-title">{noticia.title}</h2>
              <p className="news-card-date">{noticia.date}</p>
              <p className="news-card-snippet">{noticia.snippet}</p>
              <a href={noticia.url} className="news-card-link" target="_blank" rel="noopener noreferrer">Leer más</a>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}