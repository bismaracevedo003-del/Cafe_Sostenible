from flask import Flask, send_from_directory, request, redirect, url_for, jsonify, session
# Flask: framework web ligero de Python
# send_from_directory: sirve archivos estáticos (HTML, CSS, JS, imágenes)
# request: accede a datos del formulario/files
# redirect/url_for: redirecciones internas
# jsonify: devuelve respuestas JSON (para AJAX)
# session: manejo de sesiones de usuario (login)

from flask_sqlalchemy import SQLAlchemy
# Extensión para usar SQLAlchemy (ORM) con Flask

import os
# Manejo de rutas y sistema operativo

import hashlib
# Para hashear contraseñas y códigos de asociado (SHA-256)

from dotenv import load_dotenv
# Carga variables de entorno desde archivo .env

from werkzeug.utils import secure_filename
# (No se usa actualmente, pero estaba pensado para sanitizar nombres de archivo)

import uuid
# (No usado en esta versión final, pero reservado para IDs únicos)

import base64
# Para convertir la foto de perfil (binario) a base64 y mostrarla en el frontend

# --- CARGAR VARIABLES DE ENTORNO ---
load_dotenv()  # Carga automáticamente el archivo .env en la raíz del backend

# --- INICIALIZACIÓN DE LA APP FLASK ---
app = Flask(__name__, static_folder='../frontend')
# Indica que los archivos estáticos están en la carpeta ../frontend (estructura del proyecto)

# Clave secreta para firmar cookies de sesión (debe ser segura y secreta)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "fallback_secret_key_dev")
app.config['SECRET_KEY'] = os.getenv("FLASK_SECRET_KEY", "super-secret-key-dev")

# Configuración segura de cookies de sesión
app.config['SESSION_COOKIE_HTTPONLY'] = True      # Evita acceso desde JavaScript
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'     # Protege contra CSRF en navegación
app.config['SESSION_COOKIE_SECURE'] = False      # Cambiar a True en producción con HTTPS
app.config['SESSION_COOKIE_PATH'] = '/'           # Disponible en toda la app
app.config['PERMANENT_SESSION_LIFETIME'] = 3600   # Sesión dura 1 hora

# Modo debug controlado por variable de entorno
app.config['DEBUG'] = os.getenv("FLASK_DEBUG", "False") == "True"

# --- DEFINICIÓN DE RUTAS ABSOLUTAS (para servir archivos estáticos) ---
BASE_DIR = os.path.abspath(os.path.dirname(__file__))  # Directorio actual (backend/)
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')
HTML_DIR = os.path.join(FRONTEND_DIR, 'html')
CSS_DIR = os.path.join(FRONTEND_DIR, 'css')
JS_DIR = os.path.join(FRONTEND_DIR, 'js')
IMG_DIR = os.path.join(FRONTEND_DIR, 'img')

# --- CONFIGURACIÓN DE BASE DE DATOS SQL SERVER (desde .env) ---
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

# URI de conexión a SQL Server usando pymssql
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mssql+pymssql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Mejora rendimiento
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,   # Verifica conexiones muertas
    'pool_recycle': 300,     # Recicla conexiones cada 5 minutos
}

# --- IMPORTAR MODELOS (User y Finca) ---
from models import db, User, Finca
db.init_app(app)  # Vincula SQLAlchemy con la app Flask

# --- CREAR TABLAS AUTOMÁTICAMENTE AL INICIAR (solo en desarrollo) ---
with app.app_context():
    try:
        # Prueba rápida de conexión
        db.session.execute(db.text("SELECT 1"))
        db.session.commit()
        print("Conexión a la base de datos exitosa.")
        
        # Crea las tablas si no existen
        db.create_all()
        print("Tablas verificadas/creadas correctamente.")
        
    except Exception as e:
        print(f"No se pudo conectar a la base de datos: {e}")
        print(" → Crea las tablas manualmente en Somee.com o revisa las credenciales.")
        print(" → Asegúrate de que pymssql esté instalado: pip install pymssql")

# --- FUNCIÓN PARA HASHEAR TEXTO (contraseñas y códigos de asociado) ---
def hash_text(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

# --- DECORADOR PARA PROTEGER RUTAS (requiere login) ---
def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:  # Si no hay usuario en sesión
            return jsonify({"status": "error", "message": "Debes iniciar sesión"}), 401
        return f(*args, **kwargs)
    return decorated_function

# --- RUTAS PÚBLICAS (frontend) ---
@app.route('/')
def index():
    """Página principal: si ya está logueado → va al dashboard, sino muestra landing"""
    if 'user_id' in session:
        return redirect(url_for('inicio'))
    return send_from_directory(HTML_DIR, 'index.html')

@app.route('/inicio')
@login_required
def inicio():
    """Dashboard del productor (protegido)"""
    return send_from_directory(HTML_DIR, 'inicio.html')

# --- SERVIR ARCHIVOS ESTÁTICOS ---
@app.route('/css/<path:filename>')
def css(filename):
    return send_from_directory(CSS_DIR, filename)

@app.route('/js/<path:filename>')
def js(filename):
    return send_from_directory(JS_DIR, filename)

@app.route('/img/<path:filename>')
def img(filename):
    return send_from_directory(IMG_DIR, filename)

# --- RUTAS DE AUTENTICACIÓN ---
@app.route('/login')
def login_page():
    """Muestra el formulario de login"""
    return send_from_directory(HTML_DIR, 'login.html')

@app.route('/perfil')
@login_required
def perfil():
    """Página de perfil del usuario"""
    return send_from_directory(HTML_DIR, 'perfil.html')

# --- API: INICIO DE SESIÓN ---
@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    
    if not username or not password:
        return jsonify({"status": "error", "message": "Faltan datos"}), 400
    
    password_hash = hash_text(password)
    user = User.query.filter_by(username=username, password_hash=password_hash).first()
    
    if user:
        session['user_id'] = user.id
        session['username'] = user.username
        print(f"Login exitoso: {user.username} (ID: {user.id})")  # Log de depuración
        return jsonify({"status": "success", "redirect": "/inicio"})
    else:
        return jsonify({"status": "error", "message": "Usuario o contraseña incorrectos"}), 401

# --- API: REGISTRO DE NUEVO PRODUCTOR ---
@app.route('/register', methods=['POST'])
def register():
    # Datos del formulario
    username = request.form.get('username')
    password = request.form.get('password')
    nombre = request.form.get('nombre')
    apellido = request.form.get('apellido')
    codigo_asociado = request.form.get('codigo_asociado')  # Viene en texto plano
    foto = request.files.get('foto_perfil')
    
    # Validación básica
    if not all([username, password, nombre, apellido, codigo_asociado]):
        return jsonify({"status": "error", "message": "Todos los campos son obligatorios"}), 400
    
    # Hashear código de asociado y verificar que exista en tabla fincas
    codigo_hash = hash_text(codigo_asociado)
    finca = Finca.query.filter_by(codigo_hash=codigo_hash).first()
    if not finca:
        return jsonify({"status": "error", "message": "Código de asociado inválido"}), 400
    
    # Verificar que el username no exista
    if User.query.filter_by(username=username).first():
        return jsonify({"status": "error", "message": "El usuario ya existe"}), 400
    
    # Procesar foto de perfil (opcional)
    foto_blob = None
    foto_mime = 'image/png'
    if foto and foto.filename:
        if foto.content_length > 5 * 1024 * 1024:  # Límite 5MB
            return jsonify({"status": "error", "message": "Imagen demasiado grande"}), 400
        if foto.mimetype not in {'image/png', 'image/jpeg', 'image/webp', 'image/gif'}:
            return jsonify({"status": "error", "message": "Formato no permitido"}), 400
        foto_blob = foto.read()
        foto_mime = foto.mimetype
    
    # Crear y guardar nuevo usuario
    new_user = User(
        username=username,
        password_hash=hash_text(password),
        nombre=nombre,
        apellido=apellido,
        codigo_asociado_hash=codigo_hash,
        foto_perfil=foto_blob,
        foto_mime=foto_mime
    )
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"status": "success", "message": "Registro exitoso"})

# --- API: OBTENER DATOS DEL USUARIO LOGUEADO ---
@app.route('/api/user')
@login_required
def api_user():
    user = User.query.get(session['user_id'])
    
    # Buscar el código original (texto plano) desde la tabla fincas
    finca = Finca.query.filter_by(codigo_hash=user.codigo_asociado_hash).first()
    codigo_plano = finca.codigo_original if finca else "Desconocido"
    
    # Convertir foto a base64 para mostrar en frontend
    foto_base64 = None
    if user.foto_perfil:
        foto_base64 = base64.b64encode(user.foto_perfil).decode('utf-8')
    
    return jsonify({
        "username": user.username,
        "nombre": user.nombre,
        "apellido": user.apellido,
        "codigo_asociado": codigo_plano,
        "foto_src": f"data:{user.foto_mime};base64,{foto_base64}" if foto_base64 else "/img/usuarios/default-user.png"
    })

# --- LÍMITE DE TAMAÑO DE ARCHIVO ---
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB máximo

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"status": "error", "message": "Archivo demasiado grande"}), 413

# --- API: CAMBIAR FOTO DE PERFIL ---
@app.route('/api/cambiar-foto', methods=['POST'])
@login_required
def cambiar_foto():
    foto = request.files.get('foto_perfil')
    if not foto or not foto.filename:
        return jsonify({"status": "error", "message": "No se envió foto"}), 400
    
    if foto.mimetype not in {'image/png', 'image/jpeg', 'image/webp', 'image/gif'}:
        return jsonify({"status": "error", "message": "Formato no permitido"}), 400
    
    foto_blob = foto.read()
    user = User.query.get(session['user_id'])
    user.foto_perfil = foto_blob
    user.foto_mime = foto.mimetype
    db.session.commit()
    
    return jsonify({"status": "success", "message": "Foto actualizada"})

# --- CERRAR SESIÓN ---
@app.route('/logout')
def logout():
    session.clear()  # Elimina toda la sesión
    return redirect(url_for('index'))

# --- INICIAR SERVIDOR ---
if __name__ == "__main__":
    print("Servidor iniciado en http://localhost:5000")
    app.run(debug=True, port=5000)
