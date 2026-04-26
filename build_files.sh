#!/bin/bash

echo "Building Django application for Vercel..."

uv python pin 3.12
uv pip install -r requirements.txt --system

python manage.py collectstatic --noinput --clear

echo "Build completed successfully!"
