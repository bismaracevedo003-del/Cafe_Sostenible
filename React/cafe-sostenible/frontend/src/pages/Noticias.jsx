import Header from '../components/Header';
import Footer from '../components/Footer';
import '../index.css';

export default function Noticias() {
  const noticias = [
    {
      title: "La nueva Ley Europea de Deforestación (EUDR) y su impacto en el café sostenible",
      date: "Sep 11, 2025",
      snippet: "“La EUDR refuerza algo que ya forma parte de nuestra esencia: ofrecer café con calidad y responsabilidad”, explica Álvaro Marco, Director...",
      url: "https://cafesorus.es/2025/09/eudr/"
    },
    {
      title: "Lo que los tostadores deben saber sobre el café apto para la EUDR",
      date: "Sep 16, 2025",
      snippet: "Mientras la industria se prepara para la EUDR, los tostadores están reconociendo el empaque del café como una herramienta estratégica.",
      url: "https://perfectdailygrind.com/es/2025/09/16/empaque-tostadores-apto-para-eudr/"
    },
    {
      title: "Café y deforestación: cómo el EUDR está sacudiendo la industria cafetera",
      date: "Aug 4, 2025",
      snippet: "El EUDR busca frenar esta tendencia mediante exigencias estrictas de trazabilidad y evaluación de riesgos. Las empresas deben demostrar que el...",
      url: "https://osapiens.com/es/blog/eudr-y-cafe/"
    },
    {
      title: "Camino a la EUDR: Perú afina esfuerzos para mantener al café en el mercado europeo",
      date: "Aug 15, 2025",
      snippet: "El reglamento EUDR busca asegurar que ciertos productos comercializados en la UE no provengan de tierras deforestadas o degradadas después del...",
      url: "https://produccionsostenible.org.pe/actualidad/camino-a-la-eudr-peru-afina-esfuerzos-para-mantener-al-cafe-en-el-mercado-europeo/"
    },
    {
      title: "Café y cacao sostenible y competitivo hacia la Unión Europea",
      date: "Sep 24, 2025",
      snippet: "Este acuerdo de dos años permitirá: Capacitación y asistencia técnica a productores y exportadores de cacao, café y palma aceitera.",
      url: "https://agraria.pe/noticias/cafe-y-cacao-sostenible-y-competitivo-hacia-la-union-europea-40793"
    },
    {
      title: "MIDAGRI beneficia a 400 mil productores de café y cacao con nueva aplicación digital",
      date: "Oct 10, 2025",
      snippet: "AgroDigital permitirá a los agricultores acceder a... (noticias EUDR - PPA)",
      url: "https://ppa.midagri.gob.pe/index.php/component/content/category/88-noticiaseudr?Itemid=437"
    },
    {
      title: "Día Internacional del Café 2025: La OIC lanza la campaña global",
      date: "Sep 19, 2025",
      snippet: "“Abrazando la colaboración más que nunca”. 19 de septiembre de 2025, Londres...",
      url: "https://ico.org/es/press-releases/"
    },
    {
      title: "EUDR - Pacto Verde Europeo - Federación Nacional de Cafeteros",
      date: "Aug 30, 2024",
      snippet: "A partir del viernes, 30 de agosto de 2024 la Federación Nacional de Cafeteros habilitó el servicio para consultar la información de...",
      url: "https://federaciondecafeteros.org/wp/eudr-pacto-verde-europeo/"
    },
    {
      title: "Café costarricense: reputación verde frente a una regulación exigente",
      date: "Aug 8, 2025",
      snippet: "El café de Costa Rica goza de una sólida reputación internacional por su calidad, prácticas sostenibles y producción en armonía con el medio...",
      url: "https://certiffy.net/es/noticias/caf%25C3%25A9-costarricense-reputaci%25C3%25B3n-verde-frente-a-una-regulaci%25C3%25B3n-exigente/"
    },
    {
      title: "KOLTIVA en la 27.ª Convención Nacional del Café y Cacao del Perú",
      date: "May 29, 2025",
      snippet: "Las exportaciones de café y cacao del Perú superaron los USD 2.200 millones en 2024, involucrando a más de 350 empresas y cerca de 600.000...",
      url: "https://www.koltiva.com/es/post/post-koltiva-en-la-27-convencion-nacional-del-cafe-y-cacao-del-peru-trazabilidad-del-caf%25C3%25A9"
    }
  ];

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