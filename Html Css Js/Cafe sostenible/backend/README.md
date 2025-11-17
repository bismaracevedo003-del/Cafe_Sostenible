# Backend – Café Sostenible (Flask + SQL Server)  
**Versión 1.0 – Octubre 2025**

Este directorio contiene el **backend completo** de la primera versión funcional del proyecto **Calculadora de Huella de Carbono para SOPPEXCCA**, desarrollado con **Flask** y conectado a **Microsoft SQL Server** (Somee.com / Azure).

Es la base de autenticación y gestión de usuarios que luego se reutilizó y amplió en la versión React.

## Estructura del directorio

```text
backend/
├── app.py              ← Servidor Flask principal + todas las rutas y lógica
├── models.py           ← Modelos SQLAlchemy (tablas users y fincas)
├── requirements.txt    ← Dependencias exactas del proyecto
├── .env                ← Variables de entorno (¡NO subir al repositorio!)
├── .gitignore
└── pycache/        ← Generado automáticamente
```


## Tecnologías utilizadas

| Tecnología          | Uso                                                  |
|---------------------|-------------------------------------------------------|
| Python 3.10+        | Lenguaje principal                                    |
| Flask               | Framework web ligero                                  |
| Flask-SQLAlchemy    | ORM para interacción con la base de datos             |
| pymssql             | Driver para conectar a SQL Server                     |
| python-dotenv       | Carga segura de variables de entorno                  |
| hashlib (SHA-256)   | Hash de contraseñas y códigos de asociado             |
| SQL Server          | Base de datos remota (Somee.com o Azure)              |

## Endpoints disponibles

| Método | Ruta                 | Descripción                                 | Autenticación |
|--------|----------------------|---------------------------------------------|---------------|
| GET    | `/`                  | Landing page (`index.html`)                 | No            |
| GET    | `/inicio`            | Dashboard del productor                     | Sí            |
| GET    | `/login`             | Formulario de login                         | No            |
| GET    | `/perfil`            | Perfil del usuario                          | Sí            |
| POST   | `/login`             | Iniciar sesión                              | No            |
| POST   | `/register`          | Registro de nuevo productor                 | No            |
| GET    | `/api/user`          | Obtener datos del usuario autenticado      | Sí            |
| POST   | `/api/cambiar-foto`  | Cambiar foto de perfil                      | Sí            |
| GET    | `/logout`            | Cerrar sesión                               | Sí            |
| GET    | `/css/...`, `/js/...`, `/img/...` | Servir archivos estáticos       | No            |

## Modelos de base de datos

### Tabla `users`

```sql
id                  INT PK
username            VARCHAR(100) UNIQUE
password_hash       VARCHAR(255)          ← SHA-256
nombre              VARCHAR(100)
apellido            VARCHAR(100)
codigo_asociado_hash VARCHAR(255)         ← SHA-256 del código SOPPEXCCA
foto_perfil         VARBINARY(MAX)        ← Imagen en binario
foto_mime           VARCHAR(50)           ← image/jpeg, image/png...
```
### Tabla `fincas`

```sql
id                  INT PK
nombre              VARCHAR(100)
codigo_hash         VARCHAR(255) UNIQUE   ← SHA-256 del código original
codigo_original     VARCHAR(50)           ← Ej: ASOC-1234 (texto plano para mostrar)
```

## **Requisitos (requirements.txt)**

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
```

Instalar con:
```bash
pip install -r requirements.txt
```

## **Configuración (.env)**

Crea un archivo .env en esta misma carpeta con tus credenciales:

```env
FLASK_SECRET_KEY=una_clave_muy_segura_y_larga_aqui
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_HOST=tu_servidor.mssql.somee.com
DB_NAME=tu_base_de_datos
FLASK_DEBUG=True    # Cambiar a False en producción
```

## **Ejecución local**

```bash
cd "Html Css Js/Cafe sostenible/backend"

# Recomendado: crear entorno virtual
python -m venv venv
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar
python app.py
```

Servidor disponible en: http://localhost:5000

## **Seguridad implementada**

- Contraseñas y códigos de asociado hasheados con SHA-256
- Sesiones Flask seguras (HttpOnly, SameSite=Lax)
- Límite de tamaño de archivo (5 MB)
- Validación de MIME types en subida de fotos
- Protección contra inyección (usando parámetros en consultas)

## **Notas importantes**

- Este backend sigue siendo 100 % funcional y se usa como base para la versión React.
- El cálculo de huella de carbono se implementó después en la versión React + nuevo backend.
