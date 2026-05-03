#!/bin/bash

sudo apt update
sudo apt install -y python3 python3-venv python3-pip i2c-tools ufw

mkdir -p /home/appuser/python
mkdir -p /home/appuser/scans

# PŘIDAT PYTHON SOUBORY
cp skener_sluzba.py skener_ovladani.py skener_web.py /home/appuser/python/
cp -r templates static /home/appuser/python/

python3 -m venv /home/appuser/python/venv
source /home/appuser/python/venv/bin/activate
pip install flask waitress requests rpi-lcd flask-cors
deactivate

sudo chown -R appuser:appuser /home/appuser/python
sudo chown -R appuser:appuser /home/appuser/scans
sudo chmod -R 755 /home/appuser/python


sudo cp ./skener.service /etc/systemd/system/
sudo cp ./skener-web.service /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable skener.service
sudo systemctl enable skener-web.service
sudo systemctl start skener.service
sudo systemctl start skener-web.service

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
for port in 5000 5001 5002; do
    sudo ufw allow $port/tcp
done
echo "y" | sudo ufw enable
sudo ufw status verbose

echo "instalace dokončena"