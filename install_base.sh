#!/bin/bash

# uknočení při chybě
set -e

sudo apt update

sudo apt install -y nginx python3 ufw

sudo ufw allow ssh

sudo ufw allow 'Nginx Full'

sudo ufw --force enable

systemctl status nginx --no-pager
sudo ufw status

echo "OK"