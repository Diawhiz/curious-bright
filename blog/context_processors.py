from django.db import models
from django.core.cache import cache
from .models import Category, Post, Comment
from django.contrib.auth.models import User
import logging

logger = logging.getLogger(__name__)

CATEGORIES_CACHE_KEY = 'blog_categories'
CATEGORIES_CACHE_TIMEOUT = 300  # 5 minutes

ADMIN_STATS_CACHE_KEY = 'admin_stats_context'
ADMIN_STATS_CACHE_TIMEOUT = 60  # 1 minute


def categories_processor(request):
    categories = cache.get(CATEGORIES_CACHE_KEY)
    if categories is None:
        categories = list(Category.objects.all())
        cache.set(CATEGORIES_CACHE_KEY, categories, CATEGORIES_CACHE_TIMEOUT)
    return {'categories': categories}


def admin_stats_processor(request):
    if not request.path.startswith('/admin/'):
        return {}

    cached_stats = cache.get(ADMIN_STATS_CACHE_KEY)
    if cached_stats:
        return cached_stats

    try:
        stats = {
            'post_count': Post.objects.filter(status='published').count(),
            'comment_count': Comment.objects.count(),
            'total_views': Post.objects.aggregate(total=models.Sum('views'))['total'] or 0,
            'user_count': User.objects.count(),
        }
        cache.set(ADMIN_STATS_CACHE_KEY, stats, ADMIN_STATS_CACHE_TIMEOUT)
        return stats
    except Exception as e:
        logger.error(f"Error generating admin stats: {e}")
        return {}
