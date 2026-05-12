#!/bin/bash

echo "Building Django application for Vercel..."

# Install dependencies
pip install -r requirements.txt

# Collect static files for production
python manage.py collectstatic --noinput --clear

echo "Build completed successfully!"
