# Café Sostenible – Versión 1.0 (HTML + CSS + JS + Flask)

**Primera versión funcional del proyecto "Calculadora de Huella de Carbono" desarrollada con tecnologías web básicas (sin frameworks frontend).**

Esta carpeta contiene la **versión inicial y completamente funcional** del sistema web para la cooperativa **SOPPEXCCA**, creada como un **prototipo rápido (MVP)** antes de escalarlo a React + Capacitor.

El sistema está construido con:

- **HTML5** → estructura semántica, vistas estáticas y navegación tradicional  
- **CSS3 puro** → diseño responsivo, sin frameworks como Bootstrap  
- **JavaScript vanilla** → manejo del DOM, validaciones, peticiones `fetch`, y control del login  
- **Python + Flask** → backend liviano, ideal para prototipos, API REST, manejo de sesiones  
- **SQL Server** → base de datos remota vía Somee.com o Azure  
- **SQLAlchemy** → ORM para mapear tablas (usuarios y fincas)  
- **pymssql** → conexión directa a SQL Server desde Flask  

Esta versión fue probada en ambiente real y utilizada por productores para validar el flujo de inicio de sesión y perfil.

## Estructura de la carpeta

```text
Cafe sostenible/
├── backend/
│   ├── app.py              ← Servidor Flask principal (rutas, API, login)
│   ├── models.py           ← Modelos SQLAlchemy (User y Finca)
│   ├── .env                ← Variables de entorno (¡no subir al repo!)
│   ├── .gitignore
│   └── requirements.txt    ← Flask, flask-sqlalchemy, pymssql, python-dotenv
│
├── frontend/
│   ├── html/
│   │   ├── index.html      ← Landing page pública
│   │   ├── inicio.html     ← Dashboard (requiere login)
│   │   ├── login.html      ← Formulario de inicio
│   │   └── perfil.html     ← Vista de perfil del usuario
│   │
│   ├── css/
│   │   ├── index.css
│   │   ├── inicio.css
│   │   ├── login.css
│   │   └── perfil.css
│   │
│   ├── js/
│   │   ├── index.js
│   │   ├── inicio.js
│   │   ├── login.js        ← Manejo de login/register con fetch()
│   │   └── perfil.js       ← Carga de datos + cambio de foto
│   │
│   └── img/                ← Logos, iconos, fotos de perfil
│
└── coverage/               ← Reportes de pruebas (si aplican)
```

## Tecnologías usadas

### Frontend
| Tecnología         | Uso                                                                 |
|--------------------|---------------------------------------------------------------------|
| HTML5              | Estructura semántica (header, section, article, etc.) para accesibilidad y SEO |
| CSS3               | Diseño responsivo móvil-first. Estilos independientes por página. Animaciones suaves |
| JavaScript Vanilla | Peticiones `fetch`, validación, manejo de sesiones, carga dinámica. Sin jQuery |

### Backend
| Tecnología     | Uso                                                                 |
|----------------|---------------------------------------------------------------------|
| Flask          | Framework ligero para APIs rápidas y manejo de sesiones            |
| Flask-CORS     | Comunicación entre frontend local y backend remoto                 |
| SQLAlchemy     | ORM para manejar usuarios y fincas sin SQL manual                  |
| pymssql        | Conexión a bases SQL Server hosteadas en Somee/Azure               |
| python-dotenv  | Manejo seguro de credenciales mediante archivo `.env`              |

### Base de datos
- SQL Server con tablas: `users` y `fincas`
- Hash de contraseñas y códigos de asociado con **SHA-256**
- Almacenamiento de fotos de perfil como binario

## Funcionalidades implementadas

- Registro de productores (requiere código válido en la tabla `fincas`)  
- Inicio de sesión seguro con contraseña hasheada (SHA-256)  
- Perfil de usuario con subida de foto (guardada en BD)  
- Dashboard del productor protegido por sesión  
- Logout y limpieza de sesión  
- Validación del código de asociado SOPPEXCCA  
- Sitio completamente responsive  
- API REST definida con Flask  

## Requisitos para ejecutar

1. Python 3.8 o superior  
2. Instalar dependencias:

```bash
pip install -r backend/requirements.txt
```
3. Crear archivo .env dentro de backend/ con:
4. 
```bash
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_HOST=tu_host.somee.com      # o servidor Azure
DB_NAME=tu_base_de_datos
FLASK_SECRET_KEY=
```

## **Cómo ejecutar localmente**

```bash
cd "Html Css Js/Cafe sostenible/backend"
```

(Opcional) Crear entorno virtual:

```bash
python -m venv venv
venv\Scripts\activate
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Ejecutar el servidor:

```bash
python app.py
```

Abrir en el navegador: http://localhost:5000

## **Páginas disponibles**

|Ruta    |  Descripción  | Requiere login |
|--------|---------------|----------------|
|/       |Landing page pública |No|
|/login  | Formulario de inicio|No|
|/inicio|Dashboard del productor|Sí|
|/perfil|Perfil del usuario + foto|Sí|
|/logout|Cerrar sesión|Sí|

## **Notas importantes**

Esta versión **NO** incluye aún el módulo de cálculo de huella de carbono (se añadió después en la versión React).
Sirve como base sólida de autenticación, gestión de usuarios y validación de productores.
El código de asociado se hashea con SHA-256 antes de validar contra la tabla fincas.

## **Próximos pasos (ya implementados en otras carpetas)**

Versión en React + Vite
Cálculo real de huella de carbono basado en IPCC
Generación de reportes PDF
Aplicación móvil con Capacitor (APK incluida)

¡Primera versión 100 % funcional del sistema Café Sostenible!
