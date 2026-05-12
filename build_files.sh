#!/bin/bash

echo "Building Django application for Vercel..."

# Install dependencies
pip install -r requirements.txt

# Create cache table for database caching
python manage.py createcachetable --database default 2>/dev/null || echo "Cache table may already exist or using non-database cache"

# Collect static files for production
python manage.py collectstatic --noinput --clear

echo "Build completed successfully!"
