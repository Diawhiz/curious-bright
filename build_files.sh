#!/bin/bash
set -e

# Install dependencies first
pip install -r requirements.txt

# Then collect static files
python manage.py collectstatic --noinput