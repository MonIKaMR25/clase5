#!/usr/bin/env bash
set -euo pipefail

APP_NAME="poke-arena"
APP_DIR="/var/www/html/${APP_NAME}"
SITE_CONF="/etc/nginx/sites-available/${APP_NAME}"
SITE_LINK="/etc/nginx/sites-enabled/${APP_NAME}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Iniciando deploy de ${APP_NAME}..."

# 1) Instalar Nginx si no existe
if ! command -v nginx >/dev/null 2>&1; then
    echo "Nginx no esta instalado. Instalando..."
    sudo apt update
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
else
    echo "Nginx ya esta instalado."
fi

# 2) Crear directorio de despliegue
echo "Creando directorio de despliegue en ${APP_DIR}..."
sudo mkdir -p "${APP_DIR}"

# 3) Copiar archivos de la app
echo "Copiando archivos del proyecto..."
if command -v rsync >/dev/null 2>&1; then
    sudo rsync -av --delete \
        --exclude ".git" \
        --exclude "deploy-pokemon.sh" \
        "${SCRIPT_DIR}/" "${APP_DIR}/"
else
    sudo rm -rf "${APP_DIR:?}"/*
    sudo cp -a "${SCRIPT_DIR}/." "${APP_DIR}/"
    sudo rm -rf "${APP_DIR}/.git"
    sudo rm -f "${APP_DIR}/deploy-pokemon.sh"
fi

# 4) Configurar virtual host de Nginx para SPA
echo "Generando configuracion de Nginx..."
sudo tee "${SITE_CONF}" >/dev/null <<EOF
server {
    listen 80;
    server_name _;

    root ${APP_DIR};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

if [[ ! -L "${SITE_LINK}" ]]; then
    sudo ln -s "${SITE_CONF}" "${SITE_LINK}"
fi

if [[ -L /etc/nginx/sites-enabled/default ]]; then
    sudo rm -f /etc/nginx/sites-enabled/default
fi

echo "Validando configuracion de Nginx..."
sudo nginx -t

echo "Reiniciando Nginx..."
sudo systemctl restart nginx

echo "Deploy completado."
echo "Abre: http://localhost"