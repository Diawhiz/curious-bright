from django.db import models
from blog.models import Post


class SocialPost(models.Model):
    PLATFORM_CHOICES = [
        ('facebook', 'Facebook'),
        ('twitter', 'X / Twitter'),
        ('threads', 'Threads'),
    ]
    STATUS_CHOICES = [
        ('posted', 'Posted'),
        ('failed', 'Failed'),
    ]

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='social_posts')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    platform_post_id = models.CharField(max_length=200, blank=True)
    error_message = models.TextField(blank=True)
    posted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'platform')
        ordering = ['-posted_at']

    def __str__(self):
        return f"{self.post.title} → {self.platform} ({self.status})"
