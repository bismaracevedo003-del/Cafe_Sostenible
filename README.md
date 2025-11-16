# ☕ **Calculadora de Huella de Carbono – Café Sostenible**  
### *Proyecto de Innovación 2025 – UNAN-Managua & SOPPEXCCA*

![Banner]()  
*Herramienta digital para cuantificar y reducir la huella de carbono en fincas cafetaleras de SOPPEXCCA (Jinotega, Nicaragua).*

<p align="left">
  <img src="https://img.shields.io/badge/React-18.2-61dafb?logo=react" />
  <img src="https://img.shields.io/badge/Vite-5.x-B73BFE?logo=vite" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python" />
  <img src="https://img.shields.io/badge/Flask-3.x-000000?logo=flask" />
  <img src="https://img.shields.io/badge/Capacitor-5.x-9856F7?logo=capacitor" />
  <img src="https://img.shields.io/badge/Azure-Cloud-0078D4?logo=microsoftazure" />
</p>

---

# 📑 **Índice**

1. [📌 Descripción del Proyecto](#-descripción-del-proyecto)  
2. [👥 Autores](#-autores-viii-semestre--innovación-y-desarrollo-de-proyectos)  
3. [✨ Características Principales](#-características-principales)  
4. [🏆 Impacto Esperado](#-impacto-esperado)  
5. [🚀 Tecnologías Utilizadas](#-tecnologías-utilizadas)  
6. [📂 Estructura del Repositorio](#-estructura-del-repositorio)  
7. [⚙️ Instalación y Ejecución Local](#️-instalación-y-ejecución-local)  
8. [📱 Versión Móvil](#-versión-móvil)  
9. [📄 Licencia](#-licencia-y-uso-académico)  
10. [🤝 Agradecimientos](#-agradecimientos)

---

## 📌 **Descripción del Proyecto**

La **Calculadora de Huella de Carbono** es una aplicación web y móvil desarrollada como proyecto de **innovación abierta** para calcular las emisiones de gases de efecto invernadero (GEI) en el proceso productivo del café en las fincas de **SOPPEXCCA**.

Permite:

- Registrar datos productivos por finca  
- Calcular huella de carbono (tCO₂e) según **IPCC**, **GHG Protocol** y factores locales  
- Generar reportes descargables (PDF/Excel)  
- Sugerir estrategias de reducción  
- Cumplir con la normativa **EUDR**  

> 🎯 **Objetivo principal:**  
> Contribuir a la sostenibilidad ambiental y competitividad del café nicaragüense en mercados internacionales.

---

## 👥 **Autores (VIII Semestre – Innovación y Desarrollo de Proyectos)**

- Br. Jeimy Yolanda Martínez López  
- Br. Wiston Alejandro Mejía Sequeira  
- **Br. Bismarck Agustín Acevedo Cruz** (Desarrollador)  
- Br. Geylin Valeria García Gómez  
- Br. Miguel Antonio Aragón Alfaro  

---

## ✨ **Características Principales**

- Registro y autenticación segura  
- Captura de datos: fertilizantes, energía, residuos, transporte, cobertura arbórea  
- Cálculo automático de emisiones (Alcance 1, 2 y 3)  
- Estimación de **captura de carbono** por árboles de sombra  
- Dashboard visual  
- Reportes descargables  
- Recomendaciones personalizadas  
- **Versión móvil (APK Android)** para trabajo de campo  
- Arquitectura headless (React + Flask en Azure)

---

## 🏆 **Impacto Esperado**

| Área        | Beneficio |
|-------------|-----------|
| Ambiental   | Reducción de hasta **60-80 %** en emisiones identificables |
| Económico   | Acceso a mercados *premium* y cumplimiento EUDR |
| Social      | Empoderamiento y capacitación a pequeños productores |
| Regulatorio | Trazabilidad completa para exportación a la UE |

---

## 🚀 **Tecnologías Utilizadas**

| Capa              | Tecnología |
|-------------------|------------|
| Frontend Web      | React 18 + Vite |
| Frontend Móvil    | React + Capacitor (Android) |
| Backend           | Python 3.10 + Flask |
| Base de datos     | Azure SQL Server |
| Despliegue        | Render (Frontend) + Azure (Backend) |
| Metodologías      | IPCC 2019, GHG Protocol |

---

## 📂 **Estructura del Repositorio**

```text
Cafe_Sostenible/
├── Html Css Js/                  # Versión inicial estática (HTML/CSS/JS)
├── React/
│   ├── cafe-sostenible/          # Versión web React + Flask
│   └── cafe-sostenible-app/      # Versión móvil (Capacitor + APK)
│       ├── APK/                  # app-debug.apk generado
│       └── frontend/             # Código React + Capacitor
├── Documentación/                # Propuesta técnica completa (PDF)
└── README.md                     # ← Este archivo
```
## **⚙️ Instalación y Ejecución Local**

### **🔧 Backend (Flask + Azure SQL)**
 ```bash
cd "React/cafe-sostenible/backend"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
set FLASK_APP=app.py
set FLASK_ENV=development
flask run
```

### **💻 Frontend Web (React + Vite)**

```bash
cd "React/cafe-sostenible/frontend"
npm install
npm run dev
```

### **📱 App Móvil (Capacitor – Android)**

```bash
cd "React/cafe-sostenible-app/frontend"
npm install
npx cap sync android
npx cap open android    # Abre Android Studio
# APK generado → APK/app-debug.apk
```


### **📲 Versión Móvil**

📌 APK disponible en:
React/cafe-sostenible-app/APK/app-debug.apk

✔ Permite uso offline.

## 📸 **Capturas de Pantalla**

A continuación se muestran algunas vistas de la aplicación web:

### 🏠 Inicio
![Inicio](./React/cafe-sostenible/frontend/public/Cap%20web/inicio.png)

### 🔐 Login
![Login](./React/cafe-sostenible/frontend/public/Cap%20web/login.png)

### 🏠 Inicio (Vista 2)
![Inicio 2](./React/cafe-sostenible/frontend/public/Cap%20web/inicio2.png)

### 📊 Calculadora
![Calculadora](./React/cafe-sostenible/frontend/public/Cap%20web/cal.png)

### 🗂️ Historial de Cálculos
![Historial](./React/cafe-sostenible/frontend/public/Cap%20web/historial.png)

### 📰 Noticias
![Noticias](./React/cafe-sostenible/frontend/public/Cap%20web/noticias.png)



## **📄 Licencia y Uso Académico**

Este proyecto está bajo MIT License.
Se permite usar, modificar y distribuir, siempre que se mantenga el crédito a los autores.

## **🤝 Agradecimientos**

Unión de Cooperativas Agropecuarias SOPPEXCCA (Jinotega)

Recinto Universitario Rubén Darío – UNAN-Managua

Departamento de Tecnología – Área de Ciencias Básicas y Tecnológicas
