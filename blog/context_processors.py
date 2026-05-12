"""
Context processors for the blog app
"""
from django.db import models
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

# Cache settings
ADMIN_STATS_CACHE_KEY = 'admin_stats_context'
ADMIN_STATS_CACHE_TIMEOUT = 60  # 1 minute - keep stats relatively fresh


def categories_processor(request):
    """Add all categories to the context"""
    from .models import Category
    return {
        'all_categories': Category.objects.all()
    }


def admin_stats_processor(request):
    """
    Add admin dashboard statistics to context.
    
    Uses caching to prevent repeated database queries on every admin page load.
    """
    if not request.path.startswith('/admin/'):
        return {}
    
    # Try to get cached stats
    cached_stats = cache.get(ADMIN_STATS_CACHE_KEY)
    if cached_stats:
        return cached_stats
    
    try:
        from .models import Post, Comment
        from django.contrib.auth.models import User
        
        stats = {
            'post_count': Post.objects.filter(status='published').count(),
            'comment_count': Comment.objects.count(),
            'total_views': Post.objects.aggregate(total=models.Sum('views'))['total'] or 0,
            'user_count': User.objects.count(),
        }
        
        # Cache the stats
        cache.set(ADMIN_STATS_CACHE_KEY, stats, ADMIN_STATS_CACHE_TIMEOUT)
        return stats
        
    except Exception as e:
        logger.error(f"Error generating admin stats: {e}")
        return {}
