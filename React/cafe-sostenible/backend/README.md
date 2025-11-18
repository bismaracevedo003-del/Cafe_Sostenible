# **Backend – Café Sostenible (Flask + SQL Server)**

Versión 2.0 – Noviembre 2025

Este directorio contiene el backend actualizado de la versión React del proyecto Calculadora de Huella de Carbono para SOPPEXCCA. Incluye funcionalidades avanzadas como almacenamiento de cálculos EUDR, scraping de noticias y paginación.

## **Estructura del directorio**

```text
backend/
├── app.py              ← Servidor Flask principal + rutas API
├── models.py           ← Modelos SQLAlchemy (User, Finca, CalculoEUDR)
├── requirements.txt    ← Dependencias del proyecto
├── .env                ← Variables de entorno (¡NO subir al repo!)
├── .gitignore
└── __pycache__/        ← Generado automáticamente
```

## **Tecnologías utilizadas**

| Tecnología   | Uso               |
|--------------|-------------------|
| Python 3.10+ | Lenguaje principal|
| Flask         | Framework web ligero|
| Flask-SQLAlchemy | ORM para base de datos|
| pymssql | Driver para SQL Server|
| flask_cors | Manejo de CORS (cross-origin)|
| python-dotenv | Carga de .env|
| requests + bs4 | Scraping de noticias de soppexcca.org| 
| hashlib (SHA-256) | Hash de contraseñas y códigos|

## **Endpoints disponibles**

| Método | Ruta                    | Descripción                               | Autenticación |
|--------|--------------------------|---------------------------------------------|---------------|
| POST   | /api/login               | Iniciar sesión                              | No            |
| POST   | /api/register            | Registrar nuevo productor                   | No            |
| GET    | /api/user                | Obtener datos del usuario                   | Sí            |
| POST   | /api/cambiar-foto        | Cambiar foto de perfil                      | Sí            |
| POST   | /api/logout              | Cerrar sesión                               | Sí            |
| POST   | /api/historial           | Guardar cálculo EUDR                        | Sí            |
| GET    | /api/historial           | Obtener historial paginado                  | Sí            |
| GET    | /api/v1/historial        | Historial v1 con paginación mejorada        | Sí            |
| GET    | /api/noticias            | Scraping de noticias de soppexcca.org       | No            |
| GET    | /api/total-usuarios      | Total de usuarios registrados               | No            |
| GET    | /                        | Mensaje de bienvenida (home)                | No            |

## **Modelos de base de datos**

### Tabla *users*

- id, username, password_hash, nombre, apellido, codigo_asociado_hash, foto_perfil (binario), foto_mime

### Tabla *fincas*

- id, nombre, codigo_hash, codigo_original

### Tabla *calculos_eudr (nuevo)*

- id, user_id, nombre_finca, fecha, y ~30 campos para parámetros y resultados EUDR (área, producción, huella_total, etc.)

- ## **Requisitos (requirements.txt)**

```text
flask
flask_sqlalchemy
pyodbc
sqlalchemy
gunicorn
pymssql
flask_cors
dotenv
python-dotenv
requests
beautifulsoup4
```

Instalar con:

```bash
pip install -r requirements.txt
```

## **Configuración (.env)**

Crea un archivo .env con:

```env
FLASK_SECRET_KEY=una_clave_segura
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_HOST=tu_host.somee.com
DB_NAME=tu_base_de_datos
```

## **Ejecución local**

```bash
cd "React/cafe-sostenible/backend"

# Entorno virtual (recomendado)
python -m venv venv
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar
python app.py
```

Servidor en: **http://localhost:5000**

## **Seguridad y notas**

- CORS: Configurado para dominios específicos (Render, localhost).
- Scraping: Obtiene noticias de soppexcca.org (solo GET, con User-Agent).
- EUDR: Nuevo modelo para almacenar cálculos detallados de huella de carbono.
- Paginación: Soporte para filtros por fecha y paginación en historial.
- Actualización desde v1: Más campos en modelos, scraping de noticias, endpoints v1.
