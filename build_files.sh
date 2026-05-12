#!/bin/bash

echo "Building Django application for Vercel..."

# Install dependencies using uv (Vercel's Python package manager)
if command -v uv &> /dev/null; then
    echo "Using uv to install dependencies..."
    # Create a virtual environment and install there
    uv venv
    source .venv/bin/activate
    uv pip install -r requirements.txt
    # Use the venv python for subsequent commands
    PYTHON=".venv/bin/python"
else
    echo "Using pip to install dependencies..."
    pip install -r requirements.txt --break-system-packages 2>/dev/null || pip install -r requirements.txt
    PYTHON="python"
fi

# Create cache table for database caching (with error handling for missing DB)
echo "Setting up cache table..."
$PYTHON manage.py createcachetable --database default 2>/dev/null || echo "Cache table setup skipped (database not available during build)"

# Collect static files for production
echo "Collecting static files..."
$PYTHON manage.py collectstatic --noinput --clear

echo "Build completed successfully!"
