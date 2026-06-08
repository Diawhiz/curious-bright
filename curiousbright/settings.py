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
from csp.constants import SELF

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------

SECRET_KEY = os.environ.get('SECRET_KEY')

DEBUG = os.environ.get('DEBUG', 'False') == 'True'

if DEBUG:
    ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '*']
else:
    ALLOWED_HOSTS = [
        '127.0.0.1',
        'localhost',
        '10.89.173.4',
        '0.0.0.0',
        'curiousbright.com.ng',
        'curiousbright.pxxl.click',
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
    'cloudinary',
    'cloudinary_storage',
    'tinymce',
    'csp',

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
    'csp.middleware.CSPMiddleware',
]

ROOT_URLCONF = 'curiousbright.urls'
WSGI_APPLICATION = 'curiousbright.wsgi.application'

SITE_ID = 1


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

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL and not os.environ.get('USE_SQLITE'):
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=False,
        )
    }
    if not DEBUG:
        DATABASES['default']['OPTIONS'] = {
            'sslmode': 'disable',
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


# Static & media files
# ---------------------------------------------------------------------------

CONTENT_SECURITY_POLICY = {
    "EXCLUDE_URL_PREFIXES": ["/admin/", "/tinymce/"],
    "DIRECTIVES": {
        "default-src": [SELF],
        "style-src": [
            SELF,
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://cdnjs.cloudflare.com",
        ],
        "font-src": [
            SELF,
            "https://fonts.gstatic.com",
            "https://cdnjs.cloudflare.com",
        ],
        # 'unsafe-inline' is required because the site uses GTM, AdSense consent,
        # and cookie-banner scripts that are inline. XSS protection comes from
        # Django's template auto-escaping and the sanitize_html bleach filter.
        "script-src": [
            SELF,
            "'unsafe-inline'",
            "https://www.googletagmanager.com",
            "https://pagead2.googlesyndication.com",
            "https://cdn.jsdelivr.net",
        ],
        "img-src": [SELF, "data:", "https:"],
        "connect-src": [SELF, "https://www.googletagmanager.com"],
        "frame-ancestors": [SELF],
    },
}

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / 'static').exists() else []

if not DEBUG:
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
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    CSRF_TRUSTED_ORIGINS = [
        'https://curiousbright.com.ng',
        'https://www.curiousbright.com.ng',
        'https://curiousbright-0a9fca62af3a.herokuapp.com',

    ]
    
    def add_whitenoise_headers(headers, path, url):
        headers['X-Content-Type-Options'] = 'nosniff'
        headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        headers['X-Frame-Options'] = 'DENY'

    WHITENOISE_ADD_HEADERS_FUNCTION = add_whitenoise_headers


# ---------------------------------------------------------------------------
# Caching
# ---------------------------------------------------------------------------
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
    "site_logo": "images/cb_favicon.png",
    "login_logo": "images/cb_favicon.png",
    "custom_css": "admin/css/custom.css",
    "custom_js": "admin/js/tinymce_upload.js",
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

TINYMCE_DEFAULT_CONFIG = {
    'height': 600,
    'width': '100%',
    'cleanup_on_startup': True,
    'custom_undo_redo_levels': 20,
    'selector': 'textarea',
    'theme': 'silver',
    'plugins': [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
        'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
        'fullscreen', 'insertdatetime', 'media', 'table', 'wordcount',
        'emoticons', 'codesample', 'hr', 'pagebreak', 'nonbreaking',
        'quickbars', 'autosave',
    ],
    'toolbar': (
        'undo redo | styles | bold italic underline strikethrough | '
        'alignleft aligncenter alignright alignjustify | '
        'bullist numlist outdent indent | '
        'link image media table | '
        'forecolor backcolor | '
        'blockquote codesample hr | '
        'removeformat | fullscreen preview code'
    ),
    'toolbar_mode': 'sliding',
    'style_formats': [
        {'title': 'Headings', 'items': [
            {'title': 'Heading 1', 'format': 'h1'},
            {'title': 'Heading 2', 'format': 'h2'},
            {'title': 'Heading 3', 'format': 'h3'},
            {'title': 'Heading 4', 'format': 'h4'},
        ]},
        {'title': 'Inline', 'items': [
            {'title': 'Bold', 'format': 'bold'},
            {'title': 'Italic', 'format': 'italic'},
            {'title': 'Underline', 'format': 'underline'},
            {'title': 'Code', 'format': 'code'},
        ]},
        {'title': 'Blocks', 'items': [
            {'title': 'Paragraph', 'format': 'p'},
            {'title': 'Blockquote', 'format': 'blockquote'},
            {'title': 'Pre', 'format': 'pre'},
        ]},
    ],
    'content_style': '''
        body {
            font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 16px;
            line-height: 1.8;
            color: #1a1a1a;
            max-width: 860px;
            margin: 0 auto;
            padding: 24px;
        }
        h1 { font-size: 2rem; font-weight: 800; margin: 1.5rem 0 1rem; }
        h2 { font-size: 1.6rem; font-weight: 700; margin: 1.4rem 0 0.8rem; }
        h3 { font-size: 1.3rem; font-weight: 600; margin: 1.2rem 0 0.6rem; }
        p { margin-bottom: 1.2rem; }
        blockquote {
            border-left: 4px solid #F97316;
            background: #FFF7ED;
            margin: 1.5rem 0;
            padding: 1rem 1.5rem;
            border-radius: 0 6px 6px 0;
            font-style: italic;
            color: #555;
        }
        code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9em;
            color: #e83e8c;
        }
        pre {
            background: #1e1e2e;
            color: #cdd6f4;
            padding: 1.5rem;
            border-radius: 8px;
            overflow-x: auto;
        }
        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1rem 0;
        }
        a { color: #F97316; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #ddd; padding: 8px 12px; }
        th { background: #f5f5f5; font-weight: 600; }
    ''',
    'images_upload_url': '/admin/upload-image/',
    'images_upload_handler': 'customImageUploadHandler',
    'automatic_uploads': True,
    'file_picker_types': 'image',
    'images_reuse_filename': True,
    'quickbars_selection_toolbar': 'bold italic link | h2 h3 blockquote',
    'quickbars_insert_toolbar': 'image media table hr',
    'contextmenu': 'link image table',
    'skin': 'oxide',
    'content_css': 'default',
    'branding': False,
    'elementpath': False,
    'resize': True,
    'statusbar': True,
    'menubar': 'file edit view insert format tools table help',
}

TINYMCE_COMPRESSOR = False
