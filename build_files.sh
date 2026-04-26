#!/bin/bash

echo "Building Django application for Vercel..."

uv venv .venv --python 3.12
source .venv/bin/activate
uv pip install -r requirements.txt

python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear

echo "Build completed successfully!"
