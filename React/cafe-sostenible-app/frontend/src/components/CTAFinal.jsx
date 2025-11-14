// src/components/CTAFinal.jsx
import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL;

export default function CTAFinal() {
  const [totalUsuarios, setTotalUsuarios] = useState(null);
  const [displayCount, setDisplayCount] = useState(0); // ← para animación
  const [loading, setLoading] = useState(true);

  // 1. Cargar número real desde API
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await fetch(`${API_BASE}/total-usuarios`);
        if (!res.ok) throw new Error('Error de red');
        const data = await res.json();
        setTotalUsuarios(data.total);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setTotalUsuarios(200); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchTotal();
  }, []);

  // 2. Animación del contador cuando cambia totalUsuarios
  useEffect(() => {
    if (totalUsuarios === null || loading) return;

    let start = 0;
    const end = totalUsuarios;
    const duration = 1200; // 1.2 segundos
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing suave (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * (end - start) + start);

      setDisplayCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [totalUsuarios, loading]);

  return (
    <section className="cta-final">
      <h2>Únete al cambio</h2>
      <p>
        {loading ? (
          "Cargando..."
        ) : (
          <>
            Más de <strong>{displayCount}</strong> caficultores ya miden su huella.
          </>
        )}
      </p>
      <a href="/home" className="btn-primary">
        Comenzar Ahora
      </a>
    </section>
  );
}