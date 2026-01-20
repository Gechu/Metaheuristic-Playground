@echo off
echo ================================================
echo   Metaheuristic Algorithms Visualization
echo   Starting application...
echo ================================================
echo.

REM Sprawdź czy Python jest zainstalowany
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python from https://www.python.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Python detected
echo.

REM Sprawdź czy istnieją wymagane foldery
if not exist "templates" (
    echo [INFO] Creating templates folder...
    mkdir templates
)

if not exist "static" (
    echo [INFO] Creating static folder...
    mkdir static
)

REM Sprawdź czy wszystkie pliki są na miejscu
echo [INFO] Checking required files...
set MISSING_FILES=0

if not exist "app.py" (
    echo [ERROR] app.py not found!
    set MISSING_FILES=1
)

if not exist "ArtificialBeeColony.py" (
    echo [ERROR] ArtificialBeeColony.py not found!
    set MISSING_FILES=1
)

if not exist "BatAlgorithm.py" (
    echo [ERROR] BatAlgorithm.py not found!
    set MISSING_FILES=1
)

if not exist "GeneticAlgorithm.py" (
    echo [ERROR] GeneticAlgorithm.py not found!
    set MISSING_FILES=1
)

if not exist "objective_functions.py" (
    echo [ERROR] objective_functions.py not found!
    set MISSING_FILES=1
)

if not exist "templates\index.html" (
    echo [ERROR] templates\index.html not found!
    set MISSING_FILES=1
)

if not exist "static\style.css" (
    echo [ERROR] static\style.css not found!
    set MISSING_FILES=1
)

if %MISSING_FILES%==1 (
    echo.
    echo [ERROR] Some required files are missing!
    echo Please make sure all files are in the correct location.
    echo.
    pause
    exit /b 1
)

echo [OK] All required files found
echo.

REM Sprawdź czy wymagane biblioteki są zainstalowane
echo [INFO] Checking required Python packages...
echo.

python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Flask not found. Installing...
    pip install flask
    if errorlevel 1 (
        echo [ERROR] Failed to install Flask!
        pause
        exit /b 1
    )
) else (
    echo [OK] Flask is installed
)

python -c "import numpy" >nul 2>&1
if errorlevel 1 (
    echo [INFO] NumPy not found. Installing...
    pip install numpy
    if errorlevel 1 (
        echo [ERROR] Failed to install NumPy!
        pause
        exit /b 1
    )
) else (
    echo [OK] NumPy is installed
)

python -c "import matplotlib" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Matplotlib not found. Installing...
    pip install matplotlib
    if errorlevel 1 (
        echo [ERROR] Failed to install Matplotlib!
        pause
        exit /b 1
    )
) else (
    echo [OK] Matplotlib is installed
)

python -c "from PIL import Image" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Pillow not found. Installing...
    pip install pillow
    if errorlevel 1 (
        echo [ERROR] Failed to install Pillow!
        pause
        exit /b 1
    )
) else (
    echo [OK] Pillow is installed
)

echo.
echo ================================================
echo   All dependencies satisfied!
echo   Starting Flask server...
echo ================================================
echo.
echo [INFO] The application will open in your browser shortly...
echo [INFO] Press Ctrl+C to stop the server
echo.

REM Uruchom przeglądarkę po 3 sekundach
start /B cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5000"

REM Uruchom aplikację Flask
python app.py

REM Ten kod wykona się po zamknięciu serwera
echo.
echo ================================================
echo   Server stopped
echo ================================================
pause