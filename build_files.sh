#!/bin/bash
set -e
pip install -r requirements.txt --break-system-packages
python manage.py collectstatic --noinput