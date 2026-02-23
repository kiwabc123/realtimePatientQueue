@echo off
echo.
echo ========================================
echo Real-time Patient Queue System
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Docker Compose not found
    echo Using 'docker compose' instead
    set DOCKER_CMD=docker compose
) else (
    set DOCKER_CMD=docker-compose
)

echo.
echo 1. Building Docker image...
echo.

%DOCKER_CMD% build

if errorlevel 1 (
    echo ERROR: Docker build failed
    pause
    exit /b 1
)

echo.
echo 2. Starting application...
echo.

%DOCKER_CMD% up

pause
