# backend/models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    codigo_asociado_hash = db.Column(db.String(255), nullable=False)
    foto_perfil = db.Column(db.LargeBinary, nullable=True)
    foto_mime = db.Column(db.String(50), default='image/png')

    # Relación con cálculos
    calculos = db.relationship('CalculoEUDR', backref='user', lazy=True)

    def __repr__(self):
        return f"<User {self.username}>"

class Finca(db.Model):
    __tablename__ = 'fincas'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    codigo_hash = db.Column(db.String(255), nullable=False, unique=True)
    codigo_original = db.Column(db.String(50), nullable=False, default='ASOC-0000')

    def __repr__(self):
        return f"<Finca {self.nombre}>"

# === NUEVO MODELO: CÁLCULO EUDR ===
class CalculoEUDR(db.Model):
    __tablename__ = 'calculos_eudr'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Información básica
    nombre_finca = db.Column(db.String(100), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Parámetros EUDR
    area_cultivada = db.Column(db.Float, nullable=False)  # ha
    produccion_verde = db.Column(db.Float, nullable=False)  # kg
    
    fertilizante_total = db.Column(db.Float, nullable=True)  # kg
    tipo_fertilizante = db.Column(db.String(20), nullable=True)  # sintetico/organico
    
    energia_electrica = db.Column(db.Float, nullable=True)  # kWh
    combustible_litros = db.Column(db.Float, nullable=True)  # L
    tipo_combustible = db.Column(db.String(20), nullable=True)  # diesel/gasolina/leña
    
    arboles_sombra = db.Column(db.Integer, nullable=True)
    area_copa_promedio = db.Column(db.Float, nullable=True)  # m²/árbol
    
    distancia_km = db.Column(db.Float, nullable=True)  # km
    volumen_cargas = db.Column(db.Float, nullable=True)  # cargas
    
    tipo_procesamiento = db.Column(db.String(20), nullable=True)  # lavado/miel/natural
    
    residuos_totales = db.Column(db.Float, nullable=True)  # kg
    residuos_compostados = db.Column(db.Float, nullable=True)  # kg
    
    bosque_base = db.Column(db.Float, nullable=True)  # ha (2020)
    bosque_actual = db.Column(db.Float, nullable=True)  # ha
    
    # Resultados calculados
    huella_total = db.Column(db.Float, nullable=False)  # kg CO₂e
    huella_por_kg = db.Column(db.Float, nullable=False)  # kg CO₂e/kg
    
    # Indicadores clave
    fert_por_ha = db.Column(db.Float, nullable=True)
    rendimiento = db.Column(db.Float, nullable=True)
    energia_total = db.Column(db.Float, nullable=True)
    arboles_por_ha = db.Column(db.Float, nullable=True)
    cobertura_porc = db.Column(db.Float, nullable=True)
    distancia_prom = db.Column(db.Float, nullable=True)
    fraccion_compost = db.Column(db.Float, nullable=True)
    deforestacion_porc = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre_finca": self.nombre_finca,
            "fecha": self.fecha.isoformat(),
            "area_cultivada": self.area_cultivada,
            "produccion_verde": self.produccion_verde,
            "fertilizante_total": self.fertilizante_total,
            "tipo_fertilizante": self.tipo_fertilizante,
            "energia_electrica": self.energia_electrica,
            "combustible_litros": self.combustible_litros,
            "tipo_combustible": self.tipo_combustible,
            "arboles_sombra": self.arboles_sombra,
            "area_copa_promedio": self.area_copa_promedio,
            "distancia_km": self.distancia_km,
            "volumen_cargas": self.volumen_cargas,
            "tipo_procesamiento": self.tipo_procesamiento,
            "residuos_totales": self.residuos_totales,
            "residuos_compostados": self.residuos_compostados,
            "bosque_base": self.bosque_base,
            "bosque_actual": self.bosque_actual,
            "huella_total": self.huella_total,
            "huella_por_kg": self.huella_por_kg,
            "fert_por_ha": self.fert_por_ha,
            "rendimiento": self.rendimiento,
            "energia_total": self.energia_total,
            "arboles_por_ha": self.arboles_por_ha,
            "cobertura_porc": self.cobertura_porc,
            "distancia_prom": self.distancia_prom,
            "fraccion_compost": self.fraccion_compost,
            "deforestacion_porc": self.deforestacion_porc,
        }

    def __repr__(self):
        return f"<CalculoEUDR {self.nombre_finca} - {self.huella_por_kg} kg CO₂e/kg>"