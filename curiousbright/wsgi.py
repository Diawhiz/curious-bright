import os
import sys
from django.core.wsgi import get_wsgi_application

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'curiousbright.settings')

# Create the application
application = get_wsgi_application()

# For Vercel
app = application
