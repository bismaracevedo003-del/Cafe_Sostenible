// src/pages/Perfil.jsx
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_URL;

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // === CARGAR USUARIO ===
  useEffect(() => {
    fetch(`${API_BASE}/user`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('No autorizado');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setTimeout(() => navigate('/login'), 1500);
      });
  }, [navigate]);

  // === CAMBIAR FOTO ===
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showMessage('Imagen demasiado grande (máx 5MB)', 'error');
      e.target.value = '';
      return;
    }

    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      showMessage('Formato no permitido. Usa PNG, JPG, WEBP o GIF.', 'error');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('foto_perfil', file);

    try {
      const res = await fetch(`${API_BASE}/cambiar-foto`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();

      if (data.status === 'success') {
        const reader = new FileReader();
        reader.onload = () => {
          setUser(prev => ({ ...prev, foto_src: reader.result }));
          showMessage('Foto actualizada', 'success');
        };
        reader.readAsDataURL(file);
      } else {
        throw new Error(data.message || 'Error al subir');
      }
    } catch (err) {
      showMessage(err.message || 'Error de conexión', 'error');
    }
  };

  // === MENSAJE TEMPORAL ===
  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // === LOGOUT ===
  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="coffee-loader">
        <div className="coffee-cup">
          <div className="steam"></div>
          <div className="steam"></div>
          <div className="steam"></div>
        </div>
        <p className="coffee-text">Preparando tu café...</p>
      </div>
    );
  }
  if (!user) return <div className="loading">Redirigiendo...</div>;


  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="logo-section">
          <img src="/img/IMG_6194.PNG" alt="Logo" className="logo-img" />
          <div className="title-group">
            <h1 className="main-title">CAFÉ SOSTENIBLE</h1>
            <p className="subtitle">Café Sostenible Caficultura</p>
          </div>
        </div>
        <a href="#" className="news-link">Noticias</a>
      </header>

      {/* MAIN CONTAINER */}
      <div className="main-container">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <nav className="nav-menu">
            <Link to="/inicio" className="nav-item">
              <img src="/img/icon-home.svg" alt="Inicio" className="nav-icon" />
              <span>Inicio</span>
            </Link>
            <Link to="/calculadora" className="nav-item">
              <img src="/img/icon-calculator.svg" alt="Calculadora" className="nav-icon" />
              <span>Calculadora de huella de carbono</span>
            </Link>
            <Link to="/historial" className="nav-item">
              <img src="/img/icon-history.svg" alt="Historial" className="nav-icon" />
              <span>Historial</span>
            </Link>
            <Link to="/perfil" className="nav-item active">
              <img src="/img/icon-profile.svg" alt="Perfil" className="nav-icon" />
              <span>Perfil</span>
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar sesión
            </button>
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="content">
          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          <div className="profile-grid">
            {/* PERFIL DEL PRODUCTOR */}
            <div className="profile-card">
              <h2>Perfil del productor</h2>
              <div className="producer-info">
                <div className="producer-photo-container">
                  <img
                    src={user.foto_src || "/img/usuarios/default-user.png"}
                    alt="Foto del productor"
                  />
                  <label htmlFor="cambiar-foto" className="change-photo-btn">
                    <span>Cambiar foto</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="cambiar-foto"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="producer-details">
                  <p><strong>Nombre del productor:</strong> <span>{user.nombre} {user.apellido}</span></p>
                  <p><strong>Nombre de usuario:</strong> <span>@{user.username}</span></p>
                  <p><strong>Código de asociado:</strong> <span>{user.codigo_asociado}</span></p>
                </div>
              </div>
            </div>

            {/* PERFIL DE LA FINCA */}
            <div className="profile-card">
              <h2>Perfil de la finca</h2>
              <div className="finca-info">
                <p>
                  <strong>Nombre de la finca:</strong>{' '}
                  <span className="finca-nombre">
                    {user.nombreFinca || 'No asignada'}
                  </span>
                </p>
                {/* Puedes expandir con más datos */}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 18px;
          color: #2d6a4f;
        }
        .message {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          z-index: 1000;
        }
        .message.success { background: #2d6a4f; }
        .message.error { background: #d00000; }
      `}</style>
    </>
  );
}