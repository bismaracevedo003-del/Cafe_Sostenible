# backend/app.py
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import hashlib
from dotenv import load_dotenv
import base64
import requests
from bs4 import BeautifulSoup

# --- CARGAR .env ---
load_dotenv()

# --- INICIALIZACIÓN ---
app = Flask(__name__)
CORS(app, 
     supports_credentials=True,
     origins=[
         "https://cafe-sostenible-1.onrender.com",  # Tu frontend en producción
         "http://localhost:5173",                    # Desarrollo local (Vite)
         "https://localhost:5173"                    # Si usas HTTPS local
     ],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  # Explícito: permite OPTIONS
     allow_headers=['Content-Type', 'Authorization']        # Headers comunes
)

app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True  # True en producción
app.config['PERMANENT_SESSION_LIFETIME'] = 3600

# --- BASE DE DATOS ---
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mssql+pymssql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
}

# --- IMPORTAR MODELOS ---
from models import db, User, Finca, CalculoEUDR
db.init_app(app)

# --- CREAR TABLAS (SEGURO Y COMPATIBLE) ---
with app.app_context():
    try:
        # Verifica conexión con una consulta simple
        db.session.execute(db.text("SELECT 1"))
        db.session.commit()
        print("Conexión a la base de datos exitosa.")
        
        # Crea tablas si no existen
        db.create_all()
        print("Tablas verificadas/creadas correctamente.")
        
    except Exception as e:
        print(f"No se pudo conectar a la base de datos: {e}")
        print("   → Crea las tablas manualmente en Somee.com o revisa las credenciales.")
        print("   → Asegúrate de que pymssql esté instalado: pip install pymssql")

# --- UTILIDADES ---
def hash_text(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"status": "error", "message": "No autorizado"}), 401
        return f(*args, **kwargs)
    return decorated

# --- API REST ---
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.form
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"status": "error", "message": "Faltan datos"}), 400

    user = User.query.filter_by(
        username=username,
        password_hash=hash_text(password)
    ).first()

    if user:
        session['user_id'] = user.id
        session['username'] = user.username
        return jsonify({"status": "success", "message": "Login exitoso"})
    
    return jsonify({"status": "error", "message": "Credenciales inválidas"}), 401

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.form
    foto = request.files.get('foto_perfil')

    required = ['username', 'password', 'nombre', 'apellido', 'codigo_asociado']
    if not all(data.get(field) for field in required):
        return jsonify({"status": "error", "message": "Faltan campos"}), 400

    # Verificar código de asociado
    codigo_hash = hash_text(data['codigo_asociado'])
    finca = Finca.query.filter_by(codigo_hash=codigo_hash).first()
    if not finca:
        return jsonify({"status": "error", "message": "Código inválido"}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"status": "error", "message": "Usuario existe"}), 400

    # Procesar foto
    foto_blob = None
    foto_mime = 'image/png'
    if foto and foto.filename:
        if foto.content_length > 5 * 1024 * 1024:
            return jsonify({"status": "error", "message": "Imagen > 5MB"}), 400
        if foto.mimetype not in {'image/png', 'image/jpeg', 'image/webp', 'image/gif'}:
            return jsonify({"status": "error", "message": "Formato no permitido"}), 400
        foto_blob = foto.read()
        foto_mime = foto.mimetype

    # Crear usuario
    user = User(
        username=data['username'],
        password_hash=hash_text(data['password']),
        nombre=data['nombre'],
        apellido=data['apellido'],
        codigo_asociado_hash=codigo_hash,
        foto_perfil=foto_blob,
        foto_mime=foto_mime
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"status": "success", "message": "Registro exitoso"})

@app.route('/api/user')
@login_required
def api_user():
    user = User.query.get(session['user_id'])
    finca = Finca.query.filter_by(codigo_hash=user.codigo_asociado_hash).first()
    codigo_plano = finca.codigo_original if finca else "Desconocido"

    foto_src = "/img/usuarios/default-user.png"
    if user.foto_perfil:
        foto_base64 = base64.b64encode(user.foto_perfil).decode()
        foto_src = f"data:{user.foto_mime};base64,{foto_base64}"

    # NUEVO: nombre de la finca (para la calculadora)
    nombre_finca = finca.nombre if finca else "Sin finca"

    return jsonify({
        "username": user.username,
        "nombre": user.nombre,
        "apellido": user.apellido,
        "codigo_asociado": codigo_plano,
        "nombreFinca": nombre_finca,          # <-- campo añadido
        "foto_src": foto_src
    })

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

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({"status": "success", "message": "Sesión cerrada"})

# === GUARDAR CÁLCULO EUDR ===
@app.route('/api/historial', methods=['POST'])
@login_required
def guardar_historial():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "Datos JSON requeridos"}), 400

    try:
        calculo = CalculoEUDR(
            user_id=session['user_id'],
            nombre_finca=data.get('nombreFinca', 'Cálculo sin nombre'),
            area_cultivada=float(data['areaCultivada']),
            produccion_verde=float(data['produccionVerde']),
            fertilizante_total=float(data.get('fertilizanteTotal', 0)) if data.get('fertilizanteTotal') else None,
            tipo_fertilizante=data.get('tipoFertilizante'),
            energia_electrica=float(data.get('energiaElectrica', 0)) if data.get('energiaElectrica') else None,
            combustible_litros=float(data.get('combustibleLitros', 0)) if data.get('combustibleLitros') else None,
            tipo_combustible=data.get('tipoCombustible'),
            arboles_sombra=int(data.get('arbolesSombra', 0)) if data.get('arbolesSombra') else None,
            area_copa_promedio=float(data.get('areaCopaPromedio', 0)) if data.get('areaCopaPromedio') else None,
            distancia_km=float(data.get('distanciaKm', 0)) if data.get('distanciaKm') else None,
            volumen_cargas=float(data.get('volumenCargas', 0)) if data.get('volumenCargas') else None,
            tipo_procesamiento=data.get('tipoProcesamiento'),
            residuos_totales=float(data.get('residuosTotales', 0)) if data.get('residuosTotales') else None,
            residuos_compostados=float(data.get('residuosCompostados', 0)) if data.get('residuosCompostados') else None,
            bosque_base=float(data.get('bosqueBase', 0)) if data.get('bosqueBase') else None,
            bosque_actual=float(data.get('bosqueActual', 0)) if data.get('bosqueActual') else None,
            huella_total=float(data['total']),
            huella_por_kg=float(data['porKg']),
            fert_por_ha=float(data.get('fertPorHa', 0)) if data.get('fertPorHa') else None,
            rendimiento=float(data.get('rendimiento', 0)) if data.get('rendimiento') else None,
            energia_total=float(data.get('energiaTotal', 0)) if data.get('energiaTotal') else None,
            arboles_por_ha=float(data.get('arbolesPorHa', 0)) if data.get('arbolesPorHa') else None,
            cobertura_porc=float(data.get('coberturaPorc', 0)) if data.get('coberturaPorc') else None,
            distancia_prom=float(data.get('distanciaProm', 0)) if data.get('distanciaProm') else None,
            fraccion_compost=float(data.get('fraccionCompost', 0)) if data.get('fraccionCompost') else None,
            deforestacion_porc=float(data.get('deforestacionPorc', 0)) if data.get('deforestacionPorc') else None,
        )
        db.session.add(calculo)
        db.session.commit()
        return jsonify({"status": "success", "message": "Cálculo guardado"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 400

# === OBTENER HISTORIAL ===
@app.route('/api/historial', methods=['GET'])
@login_required
def obtener_historial():
    from sqlalchemy import func
    from datetime import datetime

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '').strip()

    query = CalculoEUDR.query.filter_by(user_id=session['user_id'])

    # Filtro por fecha: si viene una fecha ISO (YYYY-MM-DD), filtrar por ese día
    if search:
        try:
            # Validar formato YYYY-MM-DD
            search_date = datetime.strptime(search, '%Y-%m-%d').date()
            # Filtrar por la fecha completa (sin hora)
            query = query.filter(func.date(CalculoEUDR.fecha) == search_date)
        except ValueError:
            # Si no es una fecha válida, no aplicar filtro
            pass

    paginated = query.order_by(CalculoEUDR.fecha.desc()) \
                    .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'items': [c.to_dict() for c in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page
    })

@app.route('/api/noticias', methods=['GET'])
def api_noticias():
    try:
        url = "https://soppexcca.org.ni/noticias"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
        }

        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        noticias = []
        articles = soup.find_all('article', class_='post')

        if not articles:
            print("No se encontraron artículos.")
            return jsonify([]), 200

        for article in articles:
            # Título y enlace
            title_tag = article.select_one('.entry-title a')
            title = title_tag.get_text(strip=True) if title_tag else "Sin título"
            link = title_tag['href'] if title_tag else ""

            # Fecha
            date_tag = article.select_one('time.entry-date')
            date = date_tag.get_text(strip=True) if date_tag else "Sin fecha"

            # Snippet
            snippet_tag = article.select_one('.entry-content p')
            snippet = snippet_tag.get_text(strip=True) if snippet_tag else ""

            # Imagen destacada
            img_tag = article.select_one('.post-thumbnail img')
            image = ""
            if img_tag and img_tag.get('src'):
                image = img_tag['src']
                # Opcional: usar srcset para mejor calidad
                if img_tag.get('srcset'):
                    # Tomar la última (más grande)
                    srcset = img_tag['srcset'].split(',')[-1].strip().split(' ')[0]
                    image = srcset
            else:
                image = ""

            noticias.append({
                "title": title,
                "date": date,
                "snippet": snippet,
                "url": link,
                "image": image  # Aquí va la URL de la imagen
            })

        return jsonify(noticias), 200

    except requests.RequestException as e:
        print("Error de red:", e)
        return jsonify({"error": "No se pudo conectar al sitio"}), 502

    except Exception as e:
        print("Error inesperado:", e)
        return jsonify({"error": "Error al procesar los datos"}), 500

@app.route('/')
def home():
    return jsonify({"mensaje": "API funcionando correctamente"})

# --- INICIAR ---
if __name__ == '__main__':
    print("API corriendo en http://localhost:5000")
    app.run(debug=True, port=5000)