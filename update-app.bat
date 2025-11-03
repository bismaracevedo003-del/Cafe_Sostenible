@echo off
echo.
echo  Actualizando Cafe Sostenible para Android...
echo =====================================================
echo.

:: Cambiar a la carpeta frontend
cd /d "C:\Users\PC\Documents\VIII Semestre\Innovacion\Propuesta\In\React\cafe-sostenible\frontend"

:: Construir React
echo Construyendo frontend (Vite)...
npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Fallo en npm run build
    pause
    exit /b %errorlevel%
)

:: Volver a la raiz
cd /d "C:\Users\PC\Documents\VIII Semestre\Innovacion\Propuesta\In\React\cafe-sostenible"

:: Sincronizar con Android
echo.
echo Sincronizando con Android...
npx cap sync android
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Fallo en cap sync
    pause
    exit /b %errorlevel%
)

:: Abrir Android Studio
echo.
echo Abriendo Android Studio...
npx cap open android

echo.
echo Listo! Tu app esta actualizada en Android Studio
echo.
npx cap open android
pause