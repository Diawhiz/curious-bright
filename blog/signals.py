from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Post, Comment
from .social_utils import autopost_to_social
import logging

logger = logging.getLogger(__name__)

# Cache keys to invalidate
ANALYTICS_CACHE_KEY = 'admin_analytics_dashboard'
ADMIN_STATS_CACHE_KEY = 'admin_stats_context'


@receiver(post_save, sender=Post)
def trigger_autopost(sender, instance, created, **kwargs):
    """
    Triggers autoposting when a post status is set to 'published'.
    
    Note: This runs synchronously because serverless environments (like Vercel)
    don't support background threads - they get killed when the response is returned.
    The social_utils functions have built-in timeouts to prevent blocking.
    """
    if instance.status == 'published':
        try:
            # Run synchronously with timeout protection in social_utils
            # This is serverless-safe - won't leave threads hanging
            autopost_to_social(instance)
        except Exception as e:
            # Log error but don't break the save operation
            logger.error(f"Failed to autopost '{instance.title}': {e}")


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
