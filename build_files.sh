#!/bin/bash

echo "Building Django application for Vercel..."

# Install dependencies with --break-system-packages flag for uv-managed Python
pip install --break-system-packages -r requirements.txt

# Or try this alternative if above doesn't work:
# python -m pip install --break-system-packages -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate --noinput

echo "Build completed successfully!"
