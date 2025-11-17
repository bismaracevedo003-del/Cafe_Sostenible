# Frontend – Café Sostenible (HTML + CSS + JS Vanilla)  
**Versión 1.0 – Octubre 2025**

Este directorio contiene el **frontend completo** de la primera versión funcional del proyecto **Calculadora de Huella de Carbono para SOPPEXCCA**, desarrollado **100 % con tecnologías web básicas** (sin frameworks ni librerías externas).

Diseñado para funcionar perfectamente con el backend Flask ubicado en `../backend/`.

## Estructura del directorio

```text
rontend/
├── html/
│   ├── index.html     ← Landing page pública (portada)
│   ├── login.html     ← Formulario de inicio de sesión y registro
│   ├── inicio.html    ← Dashboard principal del productor
│   └── perfil.html    ← Perfil del usuario + foto
│
├── css/
│   ├── index.css      ← Estilos de la página de inicio
│   ├── login.css      ← Estilos del login/registro
│   ├── inicio.css     ← Estilos del dashboard
│   └── perfil.css     ← Estilos del perfil
│
├── js/
│   ├── index.js       ← Animaciones y lógica básica del landing
│   ├── login.js       ← Login, registro y validaciones con fetch()
│   ├── inicio.js      ← Carga dinámica del dashboard
│   └── perfil.js      ← Carga de datos del usuario + cambio de foto
│
└── img/               ← Recursos gráficos y favicon
├── fondo_cafe.jpg
├── hero-coffee.svg
├── icon-.svg     ← Iconos del menú
├── favicon.ico, favicon.svg, apple-touch-icon.png
└── web-app-manifest-.png + site.webmanifest  ← PWA ready
```


## Páginas disponibles

| Archivo         | Ruta en la app | Descripción                                      | Requiere login |
|-----------------|----------------|--------------------------------------------------|----------------|
| `index.html`    | `/`            | Landing page pública con información del proyecto | No             |
| `login.html`    | `/login`       | Formulario de inicio de sesión y registro        | No             |
| `inicio.html`   | `/inicio`      | Dashboard del productor                          | Sí             |
| `perfil.html`   | `/perfil`      | Perfil del usuario con foto y datos              | Sí             |

## Características del frontend

- **100 % responsive** – Diseño móvil primero  
- **Sin dependencias externas** – Solo HTML, CSS y JavaScript puro  
- **Comunicación AJAX** con el backend mediante `fetch()`  
- **Validaciones en cliente y servidor**  
- **Subida y visualización de foto de perfil** (base64)  
- **Iconos SVG personalizados** para menú y secciones  
- **Listo para PWA** (Progressive Web App) – incluye manifest y favicons  
- **Transiciones y animaciones suaves** con CSS puro  

## Archivos clave de JavaScript

| Archivo       | Función principal                                                                 |
|---------------|-----------------------------------------------------------------------------------|
| `login.js`    | Manejo completo de login y registro (fetch POST), validaciones, mensajes de error |
| `perfil.js`   | Carga datos del usuario (`/api/user`), muestra foto en base64, cambio de foto     |
| `inicio.js`   | Lógica del dashboard (carga dinámica, futuro módulo de calculadora)              |
| `index.js`    | Animaciones de entrada, scroll suave, efectos visuales del landing               |

## Recursos gráficos incluidos

- `fondo_cafe.jpg` → Imagen de fondo hero  
- `hero-coffee.svg` → Ilustración principal  
- Iconos SVG del menú: home, calculator, graph, leaf, profile, history, news  
- Favicons completos + `site.webmanifest` → Instalación como app en móviles  
- Imágenes de ejemplo y logos institucionales  

## Cómo probarlo rápidamente (sin backend)

Abre directamente en el navegador:  
`frontend/html/index.html`

Todas las páginas se pueden ver estáticamente.  
Para funcionalidad completa (login, perfil, etc.) se requiere ejecutar el backend Flask.

## Notas importantes

- Este frontend fue la **primera versión completamente funcional** del sistema  
- Sirvió como **prototipo validado con productores reales de SOPPEXCCA**  
- Posteriormente se migró a React + Vite (carpeta `React/`) para escalar el cálculo de huella de carbono  
- Mantiene un diseño limpio, accesible y profesional, ideal para entornos rurales con conexión limitada  

**Frontend ligero, rápido y 100 % funcional**
