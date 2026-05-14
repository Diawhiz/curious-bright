"""
Django signals for the blog app.
Handles cache invalidation and social media autoposting.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Post, Comment, SocialPost
from .social_utils import autopost_to_social
import logging

logger = logging.getLogger(__name__)

# Cache keys to invalidate
ANALYTICS_CACHE_KEY = 'admin_analytics_dashboard'
ADMIN_STATS_CACHE_KEY = 'admin_stats_context'


@receiver(post_save, sender=Post)
def trigger_autopost(sender, instance, created, **kwargs):
    """
    Triggers autoposting when a post status changes to 'published'.
    
    Only posts when:
    - Post status is 'published'
    - Post hasn't been posted to the platform before (prevents duplicates)
    """
    if instance.status != 'published':
        return
    
    try:
        # Get existing social posts for this post
        existing_platforms = set(
            SocialPost.objects.filter(post=instance, success=True)
            .values_list('platform', flat=True)
        )
        
        # Determine which platforms to post to
        all_platforms = ['facebook', 'threads', 'quora']
        platforms_to_post = [p for p in all_platforms if p not in existing_platforms]
        
        if not platforms_to_post:
            logger.debug(f"Post '{instance.title}' already shared to all platforms")
            return
        
        # Run autopost
        results = autopost_to_social(instance, platforms=platforms_to_post)
        
        # Save results to SocialPost model
        for platform, result in results.items():
            SocialPost.objects.update_or_create(
                post=instance,
                platform=platform,
                defaults={
                    'platform_post_id': result.get('post_id', ''),
                    'platform_post_url': result.get('url', ''),
                    'success': result.get('success', False),
                    'error_message': result.get('error', '') if not result.get('success') else '',
                }
            )
            
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
