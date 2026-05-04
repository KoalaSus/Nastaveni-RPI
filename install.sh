#!/bin/bash

set -e

echo "Spouštím instalaci skeneru..."

sudo apt update
sudo apt install -y python3 python3-venv python3-pip i2c-tools ufw libcamera-dev rpicam-apps

sudo mkdir -p /home/appuser/python
sudo mkdir -p /home/appuser/python/images
sudo mkdir -p /home/appuser/python/static/scans
sudo chown -R appuser:appuser /home/appuser/python
sudo chown -R appuser:appuser /home/appuser/scans

cp skener_sluzba.py skener_ovladani.py skener_web.py /home/appuser/python/
cp -r templates static /home/appuser/python/

python3 -m venv /home/appuser/python/venv
source /home/appuser/python/venv/bin/activate

pip install --upgrade pip
pip install flask waitress requests rpi-lcd flask-cors opencv-python-headless trimesh numpy

deactivate

sudo chown -R appuser:appuser /home/appuser/python
sudo chmod -R 755 /home/appuser/python

sudo cp ./skener.service /etc/systemd/system/
sudo cp ./skener-web.service /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable skener.service
sudo systemctl enable skener-web.service

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
for port in 5000 5001 5002; do
    sudo ufw allow $port/tcp
done
echo "y" | sudo ufw enable

echo "Instalace dokončena. Doporučuji restartovat zařízení."
