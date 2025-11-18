# Frontend – Café Sostenible (React + Vite)  

**Versión 2.0 – Noviembre 2025**

Este directorio contiene el **frontend web** de la versión React del proyecto **Calculadora de Huella de Carbono para SOPPEXCCA**. Desarrollado con React.js + Vite para un build rápido y optimizado.

## Estructura del directorio

```text
frontend/
├── node_modules/           ← Dependencias npm (generado, ignorar)
├── public/
│   ├── Cap web/            ← Capturas de pantalla (cal.png, historial.png, etc.)
│   ├── img/                ← Recursos gráficos (fondos, iconos SVG, favicons)
│   └── vite.svg            ← Logo por defecto de Vite
├── src/
│   ├── assets/             ← Recursos estáticos (imágenes, fuentes)
│   ├── components/         ← Componentes reutilizables (Header, Footer, Hero, etc.)
│   ├── pages/              ← Páginas principales (Login, Inicio, Calculadora, etc.)
│   ├── App.css             ← Estilos globales de la app
│   ├── App.jsx             ← Componente raíz con rutas
│   ├── index.css           ← Estilos base (reset, variables)
│   └── main.jsx            ← Entry point de React
├── .env                    ← Variables de entorno (API URLs, etc.)
├── .gitignore
├── Comandos.txt            ← Notas internas de comandos
├── eslint.config.js        ← Configuración ESLint
├── index.html              ← HTML base con Vite
├── package-lock.json       ← Lockfile de dependencias
├── package.json            ← Dependencias y scripts npm
├── README.md               ← ← Este archivo
└── vite.config.js          ← Configuración Vite (proxies, build)
```


## Componentes clave

### Páginas (`src/pages`)
| Archivo           | Descripción                                      |
|-------------------|--------------------------------------------------|
| `Calculadora.jsx` | Wizard para cálculo de huella de carbono         |
| `Historial.jsx`   | Lista paginada de cálculos previos               |
| `Home.jsx`        | Página de inicio pública                         |
| `Inicio.jsx`      | Dashboard del productor                          |
| `Login.jsx`       | Formulario de login y registro                   |
| `Noticias.jsx`    | Feed de noticias scraped de soppexcca.org        |
| `Noticias1.jsx`   | Versión alternativa de noticias                  |
| `Perfil.jsx`      | Perfil del usuario con foto                      |

### Componentes reutilizables (`src/components`)
| Archivo          | Descripción                                      |
|------------------|--------------------------------------------------|
| `Benefits.jsx`   | Sección de beneficios                            |
| `CTAFinal.jsx`   | Llamado a acción final                           |
| `Footer.jsx`     | Pie de página                                    |
| `Header.jsx`     | Barra de navegación                              |
| `Hero.jsx`       | Sección hero con imagen                          |
| `HowItWorks.jsx` | Cómo funciona (pasos)                            |
| `Stats.jsx`      | Estadísticas y métricas                          |

## Tecnologías utilizadas

- **React 18+** → Componentes y estado  
- **Vite** → Build tool rápido  
- **CSS puro** → Estilos modulares (index.css con variables)  
- **Fetch API** → Comunicación con backend  
- **ESLint** → Linting de código  

## Instalación y ejecución

### Requisitos
- Node.js 18+  

```bash
cd "React/cafe-sostenible/frontend"

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev  # Abre en http://localhost:5173

# Build para producción
npm run build  # Genera /dist
```

## **Configuración adicional**

- .env: Configura VITE_API_URL=http://localhost:5000 para el backend local.
- vite.config.js: Incluye proxy para /api → backend.
- Integra con backend en ../backend/ (ejecuta python app.py).

## **Notas importantes**

- Esta versión es la evolución del frontend HTML/CSS/JS con React para mejor escalabilidad.
- Incluye wizard completo para EUDR, historial paginado y scraping de noticias.
- Capturas en public/Cap web/ para documentación.
- Listo para deploy en Vercel/Render/Netlify.
