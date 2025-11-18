# **React – Café Sostenible**

Versión 2.0+ – Noviembre 2025

Esta carpeta contiene las versiones avanzadas del proyecto desarrolladas con React.js, incluyendo la app web y la versión móvil híbrida (con Capacitor para Android).

## **Estructura**

```text
React/
├── cafe-sostenible/          # Versión web React + Vite + Backend Flask actualizado
├── cafe-sostenible-app/      # Versión móvil React + Capacitor (genera APK)
└── README.md                 # ← Este archivo
```

- cafe-sostenible/: App web completa con cálculo de huella de carbono, perfiles y reportes.
- cafe-sostenible-app/: App híbrida para Android (APK incluido en /APK/). Funciona offline y sincroniza datos.

## **Instalación y ejecución (comandos detallados)**

### **Requisitos generales**

- Node.js 18+ (para npm)
- Python 3.10+ (para backend)
- Android Studio (para la app móvil)

### **Para la versión web (cafe-sostenible)**

```bash
cd cafe-sostenible/frontend
npm install          # Instala dependencias React + Vite
npm run dev          # Ejecuta en modo desarrollo (localhost:5173)

cd ../backend
python -m venv venv  # Crea entorno virtual
venv\Scripts\activate
pip install -r requirements.txt  # Instala Flask + dependencias
python app.py        # Ejecuta backend (localhost:5000)
```

### **Para la versión móvil (cafe-sostenible-app)**

```bash
cd cafe-sostenible-app/frontend
npm install          # Instala dependencias React + Capacitor

npx cap add android  # Agrega plataforma Android (solo una vez)
npx cap sync         # Sincroniza cambios
npx cap open android # Abre en Android Studio para build/test

# Para generar APK
npx cap build android
# APK generado en: cafe-sostenible-app/APK/app-debug.apk
```
