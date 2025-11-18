# **Café Sostenible App – Versión Móvil (React + Capacitor)**

Noviembre 2025

Este directorio contiene la versión móvil híbrida del proyecto Calculadora de Huella de Carbono para SOPPEXCCA, desarrollada con React y Capacitor para generar APKs Android. Permite uso offline.

## **Estructura del directorio**

```text
cafe-sostenible-app/
├── APK/
│   ├── debug/
│   │   ├── app-debug.apk         ← APK de depuración (17/11/2025)
│   │   └── output-metadata.json
│   └── release/
│       ├── baselineProfiles/     ← Perfiles de baseline (generados)
│       ├── app-release.apk       ← APK de producción (17/11/2025)
│       └── output-metadata.json
└── frontend/                     ← Código fuente React + Capacitor (ver su README)
```

- APK/: APKs generados para debug y release. Usa app-release.apk para distribución.
- frontend/: Código fuente (React + Vite + Capacitor).

## **Tecnologías utilizadas**

- React 18+ → Interfaz y lógica
- Capacitor → Puente nativo para Android/iOS
- Vite → Build rápido

## **Instalación y generación de APK**

### **Requisitos**

- Node.js 18+
- Android Studio + SDK
- Java JDK

```bash
cd "React/cafe-sostenible-app/frontend"

# Instalar dependencias
npm install

# Agregar/sincronizar plataforma Android
npx cap add android
npx cap sync

# Abrir en Android Studio
npx cap open android

# Generar APK debug/release
# En Android Studio: Build → Build Bundle(s)/APK(s) → Build APK(s)
# O con Gradle: cd android && ./gradlew assembleDebug (o assembleRelease)

# APKs generados en: APK/debug/app-debug.apk o APK/release/app-release.apk
```

## **Notas importantes**

- Debug APK: Para pruebas internas (firmado con clave debug).
- Release APK: Para producción (firmado, optimizado). Usa app-release.apk para instalar en dispositivos.
- Funciona offline para cálculos básicos; guardado en pdf.
- APK actualizado al 17/11/2025.
