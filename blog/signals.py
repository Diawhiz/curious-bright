from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Post, Comment, Category
import logging

logger = logging.getLogger(__name__)

ANALYTICS_CACHE_KEY = 'admin_analytics_dashboard'


def _get_admin_stats_key():
    from .context_processors import ADMIN_STATS_CACHE_KEY
    return ADMIN_STATS_CACHE_KEY


def _get_categories_key():
    from .context_processors import CATEGORIES_CACHE_KEY
    return CATEGORIES_CACHE_KEY


def invalidate_admin_caches():
    try:
        cache.delete(ANALYTICS_CACHE_KEY)
        cache.delete(_get_admin_stats_key())
    except Exception as e:
        logger.warning(f"Failed to invalidate admin caches: {e}")


@receiver(post_save, sender=Post)
@receiver(post_delete, sender=Post)
@receiver(post_save, sender=Comment)
@receiver(post_delete, sender=Comment)
def clear_analytics_cache(sender, instance, **kwargs):
    invalidate_admin_caches()


@receiver(post_save, sender=Category)
@receiver(post_delete, sender=Category)
def clear_categories_cache(sender, instance, **kwargs):
    try:
        cache.delete(_get_categories_key())
    except Exception as e:
        logger.warning(f"Failed to invalidate categories cache: {e}")
