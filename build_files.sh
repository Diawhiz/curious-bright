#!/bin/bash

echo "Building Django application for Vercel..."

# Install dependencies using uv (Vercel's Python package manager)
# Falls back to pip if uv is not available
if command -v uv &> /dev/null; then
    echo "Using uv to install dependencies..."
    uv pip install -r requirements.txt --system
else
    echo "Using pip to install dependencies..."
    pip install -r requirements.txt --break-system-packages 2>/dev/null || pip install -r requirements.txt
fi

# Create cache table for database caching
python manage.py createcachetable --database default 2>/dev/null || echo "Cache table may already exist or using non-database cache"

# Collect static files for production
python manage.py collectstatic --noinput --clear

echo "Build completed successfully!"
