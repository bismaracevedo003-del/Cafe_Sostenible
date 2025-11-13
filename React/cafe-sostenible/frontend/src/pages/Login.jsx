// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_URL;

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [previewUrl, setPreviewUrl] = useState('');
  const navigate = useNavigate();

  // === MOSTRAR MENSAJE TEMPORAL ===
  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // === FUNCIÓN GENÉRICA PARA BOTÓN LOADING ===
  const setButtonLoading = (btn, loading) => {
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? (isRegistering ? 'Registrando...' : 'Entrando...') : (isRegistering ? 'Registrar' : 'Entrar');
  };

  // === VALIDACIÓN PARA LOGIN ===
  const validateLogin = (username, password) => {
    if (!username.trim()) return 'El usuario es requerido';
    if (!password) return 'La contraseña es requerida';
    if (username.length < 3) return 'El usuario debe tener al menos 3 caracteres';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
  };

  // === LOGIN ===
  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username').trim();
    const password = formData.get('password');

    const validationError = validateLogin(username, password);
    if (validationError) {
      showMessage(validationError, 'error');
      return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    setButtonLoading(btn, true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        showMessage('¡Bienvenido!', 'success');
        setTimeout(() => navigate('/inicio'), 800);
      } else {
        showMessage(data.message || 'Usuario o contraseña inválida', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('Error de conexión. Revisa el backend.', 'error');
    } finally {
      setButtonLoading(btn, false);
      btn.textContent = originalText;
    }
  };

  // === VALIDACIÓN PARA REGISTRO ===
  const validateRegister = (nombre, apellido, username, password, codigo_asociado) => {
    if (!nombre.trim()) return 'El nombre es requerido';
    if (!apellido.trim()) return 'El apellido es requerido';
    if (!username.trim()) return 'El usuario es requerido';
    if (username.length < 3) return 'El usuario debe tener al menos 3 caracteres';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'El usuario solo puede contener letras, números y guiones bajos';
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (!codigo_asociado.trim()) return 'El código de asociado es requerido';
    if (!/^\d{4}$/.test(codigo_asociado)) return 'El código de asociado debe tener exactamente 4 dígitos numéricos';
    return null;
  };

  // === REGISTRO ===
  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nombre = formData.get('nombre').trim();
    const apellido = formData.get('apellido').trim();
    const username = formData.get('username').trim();
    const password = formData.get('password');
    const codigo_asociado = formData.get('codigo_asociado').trim();

    const validationError = validateRegister(nombre, apellido, username, password, codigo_asociado);
    if (validationError) {
      showMessage(validationError, 'error');
      return;
    }

    // Limpia foto si está vacía
    const foto = formData.get('foto_perfil');
    if (foto && foto.size === 0) formData.delete('foto_perfil');

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    setButtonLoading(btn, true);

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        showMessage('¡Registro exitoso! Inicia sesión.', 'success');
        e.target.reset();
        setPreviewUrl('');
        setTimeout(() => setIsRegistering(false), 1500);
      } else {
        showMessage(data.message || 'Error en el registro', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('Error de conexión con el servidor.', 'error');
    } finally {
      setButtonLoading(btn, false);
      btn.textContent = originalText;
    }
  };

  // === VISTA PREVIA DE FOTO ===
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPreviewUrl('');
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

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  // === TOGGLE REGISTRO (limpia mensaje y preview) ===
  const toggleRegister = (value) => {
    setIsRegistering(value);
    setMessage({ text: '', type: '' });
    setPreviewUrl('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* PANEL IZQUIERDO */}
        <div className="logo-panel">
          <div className="logo">
            <Link to="/home">
              <img src="/img/IMG_6194.PNG" alt="Logo Café Sostenible" />
            </Link>
          </div>
          <div className="divider"></div>
          <div className="brand-title">CAFÉ SOSTENIBLE</div>
          <div className="brand-subtitle">Café Sostenible Caficultura</div>
        </div>

        {/* PANEL DERECHO */}
        <div className="form-panel">
          <div id="message-box" className={`message ${message.type}`}>
            {message.text}
          </div>

          {/* LOGIN FORM */}
          <form id="login-form" onSubmit={handleLogin} className={!isRegistering ? '' : 'hidden'}>
            <h1>Iniciar Sesión</h1>
            <labeled-input>
              <label htmlFor="username">Usuario</label>
              <input type="text" id="username" name="username" placeholder="Ingrese su usuario" required />
            </labeled-input>
            <labeled-input>
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" name="password" placeholder="Ingrese su contraseña" required minLength="6" />
            </labeled-input>
            <button type="submit">Entrar</button>
          </form>

          {/* ENLACE A REGISTRO */}
          <p className={`toggle-register ${isRegistering ? 'hidden' : ''}`} id="register-toggle">
            ¿No tienes cuenta? <a href="#" id="show-register" onClick={(e) => { e.preventDefault(); toggleRegister(true); }}>Regístrate aquí</a>
          </p>

          {/* REGISTRO */}
          <div className={`register-section ${isRegistering ? 'active' : ''}`}>
            <h2>Registrarse</h2><br />
            <form id="register-form" onSubmit={handleRegister} encType="multipart/form-data">
              <labeled-input>
                <label htmlFor="reg_nombre">Nombre</label>
                <input type="text" id="reg_nombre" name="nombre" placeholder="Ingresa tu nombre" required />
              </labeled-input>
              <labeled-input>
                <label htmlFor="reg_apellido">Apellido</label>
                <input type="text" id="reg_apellido" name="apellido" placeholder="Ingresa tu apellido" required />
              </labeled-input>
              <labeled-input>
                <label htmlFor="reg_username">Usuario</label>
                <input type="text" id="reg_username" name="username" placeholder="Ingresa tu usuario" required minLength="3" pattern="[a-zA-Z0-9_]+" />
              </labeled-input>
              <labeled-input>
                <label htmlFor="reg_password">Contraseña</label>
                <input type="password" id="reg_password" name="password" placeholder="Mínimo 6 caracteres" minLength="6" required />
              </labeled-input>
              <labeled-input>
                <label htmlFor="reg_code">Código de Asociado</label>
                <input type="text" id="reg_code" name="codigo_asociado" placeholder="Ej: ASOC-1234" required pattern="\d{4}"/>
              </labeled-input>
              <labeled-input>
                <label htmlFor="reg_foto">Foto de Perfil</label>
                <input type="file" id="reg_foto" name="foto_perfil" accept="image/*" onChange={handleFileChange} />
                <small>Opcional. Máx 5MB. PNG, JPG, WEBP, GIF</small>
              </labeled-input>
              {previewUrl && (
                <div id="foto-preview-container">
                  <img id="foto-preview" src={previewUrl} alt="Vista previa" />
                  <p>Vista previa</p>
                </div>
              )}
              <button type="submit">Registrar</button>
            </form>
            <p className="toggle-register">
              <a href="#" id="show-login" onClick={(e) => { e.preventDefault(); toggleRegister(false); }}> Volver al inicio de sesión </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}