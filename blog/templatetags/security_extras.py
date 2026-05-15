"""
Custom template filters for security sanitization.
"""
import bleach
from django import template

register = template.Library()

# Allowed tags for Quill editor content
ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4',
    'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote',
    'code', 'pre', 'span', 'div', 'sub', 'sup', 's', 'strike'
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'width', 'height'],
    'span': ['class', 'style'],
    'div': ['class', 'style'],
    'p': ['class', 'style'],
    'h1': ['class', 'style'],
    'h2': ['class', 'style'],
    'h3': ['class', 'style'],
    'h4': ['class', 'style'],
    'h5': ['class', 'style'],
    'h6': ['class', 'style'],
    'ul': ['class'],
    'ol': ['class'],
    'li': ['class'],
    'blockquote': ['class'],
    'code': ['class'],
    'pre': ['class'],
}

ALLOWED_STYLES = [
    'color', 'background-color', 'font-size', 'font-weight',
    'text-align', 'text-decoration', 'font-style'
]


@register.filter(name='sanitize_html')
def sanitize_html(value):
    """
    Sanitize HTML content to prevent XSS attacks.
    Use this filter instead of 'safe' for user-generated content.
    """
    if not value:
        return value
    
    return bleach.clean(
        value,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )