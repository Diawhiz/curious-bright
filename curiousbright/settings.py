"""
Django settings for curiousbright project.
"""

import os
from pathlib import Path
import cloudinary
import cloudinary.uploader
import cloudinary.api
import dj_database_url
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-!2cuway20jozk_y2b7ot(f)&81hskg@#el9s6@8l30fcs+upuu')

DEBUG = os.environ.get('DEBUG', 'False') == 'True'

if DEBUG:
    ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '*']
else:
    ALLOWED_HOSTS = [
        '127.0.0.1',
        'localhost',
        '.herokuapp.com',
        '.curiousbright.com.ng',
    ]

# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------

INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.sitemaps',

    # Third party
    'django_quill',
    'cloudinary',
    'cloudinary_storage',

    # Local
    'blog',
]


# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'curiousbright.urls'
WSGI_APPLICATION = 'curiousbright.wsgi.application'


# ---------------------------------------------------------------------------
# Templates
# ---------------------------------------------------------------------------

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'blog.context_processors.categories_processor',
                'blog.context_processors.admin_stats_processor',
            ],
        },
    },
]

ACCOUNT_TEMPLATE_EXTENSION = 'html'

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL and not os.environ.get('USE_SQLITE'):
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True,
        )
    }
    if not DEBUG:
        DATABASES['default']['OPTIONS'] = {
            'sslmode': 'require',
            'connect_timeout': 10,
        }
        DATABASES['default']['CONN_MAX_AGE'] = 300
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

LOGIN_URL = '/admin/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

# Email Config
if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = 'smtp.gmail.com'
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
    DEFAULT_FROM_EMAIL = f'CuriousBright <{os.environ.get("EMAIL_HOST_USER")}>'

# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ---------------------------------------------------------------------------
# Internationalisation
# ---------------------------------------------------------------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------------------------
# Django Quill Editor Configuration
# ---------------------------------------------------------------------------

QUILL_CONFIG = {
    'theme': 'snow',
    'modules': {
        'toolbar': [
            [{'header': [1, 2, 3, 4, False]}],
            ['bold', 'italic', 'underline', 'strike'],
            [{'color': []}, {'background': []}],
            [{'script': 'sub'}, {'script': 'super'}],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            [{'indent': '-1'}, {'indent': '+1'}],
            [{'align': []}],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean'],
        ],
    },
    'placeholder': 'Start writing your story...',
}

# Static & media files
# ---------------------------------------------------------------------------


STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / 'static').exists() else []

# WhiteNoise configuration for production
if not DEBUG:
    # Use ManifestStaticFilesStorage for proper cache-busting hashes
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    WHITENOISE_MAX_AGE = 31536000  # 1 year for immutable files
else:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ---------------------------------------------------------------------------
# Cloudinary
# ---------------------------------------------------------------------------

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True,
)


# ---------------------------------------------------------------------------
# Security (production only)
# ---------------------------------------------------------------------------

if not DEBUG:
    PREPEND_WWW = True
    SECURE_SSL_REDIRECT = False
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    
    # HSTS - Uncomment after HTTPS is fully verified working
    # SECURE_HSTS_SECONDS = 31536000  # 1 year
    # SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    # SECURE_HSTS_PRELOAD = True

    CSRF_TRUSTED_ORIGINS = [
        'https://curiousbright.com.ng',
        'https://www.curiousbright.com.ng',
        'https://curiousbright-0a9fca62af3a.herokuapp.com',

    ]
    
    # WhiteNoise security headers for static files
    def add_whitenoise_headers(headers, path, url):
        headers['X-Content-Type-Options'] = 'nosniff'
        headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        headers['X-Frame-Options'] = 'DENY'

    WHITENOISE_ADD_HEADERS_FUNCTION = add_whitenoise_headers


# ---------------------------------------------------------------------------
# Caching
# ---------------------------------------------------------------------------

# Use database cache for serverless compatibility
# For high-traffic sites, consider using Redis or Memcached
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'django_cache_table',
        'TIMEOUT': 300,  # 5 minutes default
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
            'CULL_FREQUENCY': 3,
        }
    }
}

# For local development, use locmem cache (faster, per-process)
if DEBUG:
    CACHES['default'] = {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'curiousbright-cache',
        'TIMEOUT': 300,
    }


# ---------------------------------------------------------------------------
# SEO
# ---------------------------------------------------------------------------

META_SITE_PROTOCOL = 'https'
META_SITE_DOMAIN = 'curiousbright.com.ng'
META_USE_OG_PROPERTIES = True
META_USE_TWITTER_PROPERTIES = True
META_TWITTER_TYPE = 'summary_large_image'
META_OG_TYPE = 'article'
META_DEFAULT_IMAGE = '/static/images/default-og.jpg'


# ---------------------------------------------------------------------------
# Error handlers
# ---------------------------------------------------------------------------

handler404 = 'blog.views.custom_404'
handler500 = 'blog.views.custom_500'
handler403 = 'blog.views.custom_403'

# ---------------------------------------------------------------------------
# Jazzmin
# ---------------------------------------------------------------------------

JAZZMIN_SETTINGS = {
    "site_title": "CuriousBright CMS",
    "site_header": "CuriousBright",
    "site_brand": "CuriousBright",
    "site_logo": "/images/cb_favicon.png",
    "login_logo": "/images/cb_favicon.png",
    "welcome_sign": "Welcome to CuriousBright CMS",
    "copyright": "CuriousBright © 2026",
    "search_model": "blog.Post",
    "user_avatar": None,
    "topmenu_links": [
        {"name": "Home", "url": "admin:index"},
        {"name": "Analytics", "url": "admin_analytics"},
        {"name": "Blog Posts", "url": "admin:blog_post_changelist"},
        {"name": "Categories", "url": "admin:blog_category_changelist"},
        {"name": "Comments", "url": "admin:blog_comment_changelist"},
        {"name": "View Site", "url": "/", "new_window": True},
    ],
    "show_ui_builder": False,
    "changeform_format": "horizontal_tabs",

    "icons": {
        "blog.Post": "fas fa-newspaper",
        "blog.Category": "fas fa-tag",
        "blog.Comment": "fas fa-comments",
    },
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    "hide_apps": [],
    "hide_models": [],
    "order_with_respect_to": ["blog"],
    "custom_links": {
        "blog": [{
            "name": "Make Announcement",
            "url": "admin:blog_post_add",
            "icon": "fas fa-plus-circle",
        }]
    },
    "show_sidebar": True,
    "navigation_expanded": True,
    "related_modal_active": True,
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-light",
    "accent": "accent-primary",
    "navbar": "navbar-white navbar-light",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-light-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "default_theme_mode": "light",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
    "actions_sticky_top": True,
}
