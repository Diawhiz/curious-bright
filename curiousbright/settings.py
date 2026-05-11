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

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

if DEBUG:
    ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '*']
else:
    ALLOWED_HOSTS = [
        '127.0.0.1',
        'localhost',
        '.vercel.app',
        '.curiousbright.com.ng',
    ]

# SITE_ID: must match the domain in Django admin → Sites
# Local:      Site #2  →  127.0.0.1:8000
# Production: Site #1  →  curiousbright.com.ng
# After deploying, go to admin → Sites and set Site #1 domain to curiousbright.com.ng
SITE_ID = 2 if DEBUG else 1


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
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',

    # Local
    'blog',
]


# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'allauth.account.middleware.AccountMiddleware',
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
# Authentication & Allauth
# ---------------------------------------------------------------------------

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

LOGIN_URL = '/accounts/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'
ACCOUNT_LOGOUT_REDIRECT_URL = '/'

ACCOUNT_EMAIL_VERIFICATION = 'none'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_AUTHENTICATION_METHOD = 'email'

SOCIALACCOUNT_QUERY_EMAIL = True
SOCIALACCOUNT_EMAIL_REQUIRED = True
SOCIALACCOUNT_STORE_TOKENS = False

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'APP': {
            'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
            'secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
            'key': '',
        }
    }
}

SOCIALACCOUNT_TEMPLATES = {
    'login_cancelled': 'socialaccount/login_cancelled.html',
    'authentication_error': 'socialaccount/authentication_error.html',
    'signup': 'socialaccount/signup.html',
}

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
# Static & media files
# ---------------------------------------------------------------------------

ON_VERCEL = os.environ.get('VERCEL', False)

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / 'static').exists() else []
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
    # Vercel terminates SSL at the edge — don't redirect again inside Django
    SECURE_SSL_REDIRECT = False
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

    CSRF_TRUSTED_ORIGINS = [
        'https://curiousbright.com.ng',
        'https://www.curiousbright.com.ng',
        'https://*.vercel.app',
    ]


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
    "site_logo": None,
    "login_logo": None,
    "welcome_sign": "Welcome to CuriousBright CMS",
    "copyright": "CuriousBright © 2026",
    "search_model": "blog.Post",
    "user_avatar": None,
    "topmenu_links": [
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Analytics", "url": "admin_analytics", "permissions": ["auth.view_user"]},
        {"name": "Blog Posts", "url": "admin:blog_post_changelist", "permissions": ["blog.view_post"]},
        {"name": "Categories", "url": "admin:blog_category_changelist", "permissions": ["blog.view_category"]},
        {"name": "Comments", "url": "admin:blog_comment_changelist", "permissions": ["blog.view_comment"]},
        {"name": "View Site", "url": "/", "new_window": True},
    ],
    "show_ui_builder": False,
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs",
    },
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "blog.Post": "fas fa-newspaper",
        "blog.Category": "fas fa-tag",
        "blog.Comment": "fas fa-comments",
        "sites.Site": "fas fa-globe",
    },
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    "hide_apps": [],
    "hide_models": [],
    "order_with_respect_to": ["blog", "auth", "sites"],
    "custom_links": {
        "blog": [{
            "name": "Make Announcement",
            "url": "admin:blog_post_add",
            "icon": "fas fa-plus-circle",
            "permissions": ["blog.add_post"],
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
    "brand_colour": "navbar-purple",
    "accent": "accent-purple",
    "navbar": "navbar-purple navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-purple",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "default_theme_mode": "auto",
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
