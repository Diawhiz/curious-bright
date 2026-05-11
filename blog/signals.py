from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Post
from .social_utils import autopost_to_social
import threading

@receiver(post_save, sender=Post)
def trigger_autopost(sender, instance, created, **kwargs):
    """
    Triggers autoposting when a post status is set to 'published'.
    Uses a thread to avoid blocking the request.
    """
    if instance.status == 'published':
        # We use a thread because API calls can be slow
        # In a real production app, use Celery or another task queue
        thread = threading.Thread(target=autopost_to_social, args=(instance,))
        thread.start()
