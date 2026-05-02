from django.db.models.signals import post_save
from django.dispatch import receiver
from blog.models import Post
from .models import SocialPost
from .poster import post_to_facebook, post_to_twitter, post_to_threads
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Post)
def autopost_on_publish(sender, instance, **kwargs):
    # Only fire when status is published
    if instance.status != 'published':
        return

    # Don't post again if already posted to all platforms
    posted_platforms = set(
        SocialPost.objects.filter(
            post=instance, status='posted'
        ).values_list('platform', flat=True)
    )

    platforms = {
        'facebook': post_to_facebook,
        'twitter': post_to_twitter,
        'threads': post_to_threads,
    }

    for platform, poster_fn in platforms.items():
        if platform in posted_platforms:
            logger.info(f"Skipping {platform} — already posted")
            continue

        success, result = poster_fn(instance)

        SocialPost.objects.update_or_create(
            post=instance,
            platform=platform,
            defaults={
                'status': 'posted' if success else 'failed',
                'platform_post_id': result if success else '',
                'error_message': '' if success else result,
            }
        )
