"""
Custom template filters for security sanitization.
"""
import bleach
from django import template

register = template.Library()

ALLOWED_TAGS = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'blockquote', 'code', 'pre',
    'span', 'div',
    'hr', 'br',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'figure', 'figcaption',
    'sub', 'sup',
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height', 'style', 'class'],
    'span': ['style', 'class'],
    'div': ['style', 'class'],
    'p': ['style', 'class'],
    'h1': ['style'], 'h2': ['style'], 'h3': ['style'], 'h4': ['style'],
    'blockquote': ['class'],
    'code': ['class'],
    'pre': ['class'],
    'table': ['style', 'class', 'border', 'cellpadding', 'cellspacing'],
    'td': ['style', 'colspan', 'rowspan'],
    'th': ['style', 'colspan', 'rowspan'],
    'figure': ['class', 'style'],
    'figcaption': ['class'],
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