#!/bin/bash

echo "Building Django application for Vercel..."

pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir

python manage.py collectstatic --noinput --clear

echo "Build completed successfully!"
