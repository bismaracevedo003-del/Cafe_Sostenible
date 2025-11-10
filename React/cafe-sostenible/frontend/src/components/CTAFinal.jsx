// src/components/CTAFinal.jsx
import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL;

export default function CTAFinal() {
  const [totalUsuarios, setTotalUsuarios] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/total-usuarios`);
        if (!res.ok) throw new Error('Error de red');
        const data = await res.json();
        setTotalUsuarios(data.total);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setTotalUsuarios(200); // fallback si falla
      } finally {
        setLoading(false);
      }
    };

    fetchTotal();
  }, []);

  return (
    <section className="cta-final">
      <h2>Únete al cambio</h2>
      <p>
        {loading ? (
          "Cargando..."
        ) : (
          <>
            Más de <strong>{totalUsuarios}</strong> caficultores ya miden su huella.
          </>
        )}
      </p>
      <a href="/calculadora" className="btn-primary">
        Comenzar Ahora
      </a>

      {/* ESTILOS INTEGRADOS */}
      <style jsx>{`
        .cta-final {
          background: linear-gradient(135deg, #2d6a4f, #1b4332);
          color: white;
          padding: 3rem 2rem;
          text-align: center;
          border-radius: 20px;
          margin: 2.5rem auto;
          max-width: 800px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.22);
          font-family: 'Inter', sans-serif;
        }

        .cta-final h2 {
          font-size: 2.1rem;
          margin: 0 0 1rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .cta-final p {
          font-size: 1.22rem;
          margin: 0 0 1.8rem;
          opacity: 0.95;
          line-height: 1.5;
        }

        .cta-final p strong {
          color: #95d5b2;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .btn-primary {
          display: inline-block;
          background: #95d5b2;
          color: #1b4332;
          padding: 0.95rem 2.2rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.1rem;
          text-decoration: none;
          transition: all 0.35s ease;
          box-shadow: 0 5px 18px rgba(0, 0, 0, 0.25);
          border: 2px solid transparent;
        }

        .btn-primary:hover {
          background: white;
          color: #1b4332;
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          border: 2px solid #95d5b2;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .cta-final {
            padding: 2.5rem 1.5rem;
            margin: 2rem 1rem;
          }
          .cta-final h2 {
            font-size: 1.8rem;
          }
          .cta-final p {
            font-size: 1.1rem;
          }
          .btn-primary {
            padding: 0.8rem 1.8rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
}