#!/bin/bash

echo "Building Django application for Vercel..."

# Install dependencies using uv (Vercel's default)
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir

# Collect static files
python manage.py collectstatic --noinput --clear

# Run migrations
python manage.py migrate --noinput

echo "Build completed successfully!"
