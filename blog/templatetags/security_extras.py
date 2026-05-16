"""
Custom template filters for security sanitization.
"""
import bleach
from django import template

register = template.Library()

# Allowed tags for TipTap editor content
ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 's', 'strike', 'h1', 'h2', 'h3',
    'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote',
    'code', 'pre', 'span', 'div', 'hr', 'sub', 'sup',
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height', 'style'],
    'span': ['class', 'style'],
    'div': ['class', 'style'],
    'p': ['style'],
    'h1': ['style'], 'h2': ['style'], 'h3': ['style'],
    'h4': ['style'], 'h5': ['style'], 'h6': ['style'],
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


@register.filter(name='reading_time')
def reading_time(value):
    """
    Calculate estimated reading time in minutes.
    Assumes average reading speed of 200 words per minute.
    """
    if not value:
        return 1
    
    # Strip HTML tags and count words
    text = bleach.clean(value, tags=[], strip=True)
    word_count = len(text.split())
    
    # Calculate minutes (minimum 1 minute)
    minutes = max(1, round(word_count / 200))
    return minutes