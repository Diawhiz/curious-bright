"""
Django signals for the blog app.
Handles cache invalidation and social media autoposting.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Post, Comment
import logging

logger = logging.getLogger(__name__)

# Cache keys to invalidate
ANALYTICS_CACHE_KEY = 'admin_analytics_dashboard'
ADMIN_STATS_CACHE_KEY = 'admin_stats_context'


def invalidate_admin_caches():
    """Clear admin analytics caches when data changes."""
    try:
        cache.delete(ANALYTICS_CACHE_KEY)
        cache.delete(ADMIN_STATS_CACHE_KEY)
    except Exception as e:
        logger.warning(f"Failed to invalidate admin caches: {e}")


@receiver(post_save, sender=Post)
@receiver(post_delete, sender=Post)
@receiver(post_save, sender=Comment)
@receiver(post_delete, sender=Comment)
def clear_analytics_cache(sender, instance, **kwargs):
    """Invalidate admin analytics caches when posts or comments change."""
    invalidate_admin_caches()
