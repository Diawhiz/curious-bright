"""
Context processors for the blog app
"""
from django.db import models


def categories_processor(request):
    """Add all categories to the context"""
    from .models import Category
    return {
        'all_categories': Category.objects.all()
    }


def admin_stats_processor(request):
    """Add admin dashboard statistics"""
    if not request.path.startswith('/admin/'):
        return {}
    
    try:
        from .models import Post, Comment
        from django.contrib.auth.models import User
        
        return {
            'post_count': Post.objects.filter(status='published').count(),
            'comment_count': Comment.objects.count(),
            'total_views': Post.objects.aggregate(total=models.Sum('views'))['total'] or 0,
            'user_count': User.objects.count(),
        }
    except:
        return {}
