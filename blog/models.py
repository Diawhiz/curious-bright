from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.urls import reverse
from cloudinary.models import CloudinaryField
from django.utils import timezone
from tinymce.models import HTMLField


class Category(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['title']


class Post(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
    )

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True, db_index=True)
    excerpt = models.TextField(max_length=160, help_text="Used for SEO meta description. Keep under 160 characters.")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    featured_image = CloudinaryField('image', folder='newsblog/featured')
    content = HTMLField(blank=True, default='')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='posts')
    created_date = models.DateTimeField(default=timezone.now, db_index=True)
    updated_date = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft', db_index=True)
    views = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False, help_text="Check to display this post in the hero section")
    featured_order = models.IntegerField(default=0, help_text="Lower numbers appear first (1, 2, 3, etc.)")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('post_detail', args=[self.slug])

    def get_full_url(self):
        """
        Get the full absolute URL including domain.
        
        Falls back to settings.ALLOWED_HOSTS[0] if Site framework is not configured.
        This prevents crashes on fresh installs or misconfigured sites.
        """
        from django.contrib.sites.models import Site
        from django.conf import settings
        
        try:
            domain = Site.objects.get_current().domain
        except Exception:
            # Fallback: use first allowed host or localhost
            domain = settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost'
        
        protocol = 'https' if not settings.DEBUG else 'http'
        return f"{protocol}://{domain}{self.get_absolute_url()}"

    class Meta:
        indexes = [
            models.Index(fields=['status', '-created_date'], name='idx_post_status_date'),
            models.Index(fields=['status', 'is_featured', 'featured_order'], name='idx_post_featured'),
            models.Index(fields=['category', 'status', '-created_date'], name='idx_post_category_date'),
        ]
        ordering = ['-created_date']


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=True)

    def __str__(self):
        return f'Comment by {self.user.username if self.user else self.name} on {self.post.title}'

    def total_likes(self):
        return self.likes.count()

    class Meta:
        indexes = [
            models.Index(fields=['post', 'parent', 'is_approved'], name='idx_comment_post'),
        ]
        ordering = ['created_date']


class StaticPage(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = HTMLField()
    meta_description = models.CharField(max_length=300, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Static Page"
        verbose_name_plural = "Static Pages"
