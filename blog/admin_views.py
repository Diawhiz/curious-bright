from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from .models import Post, Comment, Category
from django.utils import timezone
from datetime import timedelta
import json

@staff_member_required
def analytics_dashboard(request):
    # Total Stats
    total_posts = Post.objects.count()
    total_comments = Comment.objects.count()
    total_views = Post.objects.aggregate(Sum('views'))['views__sum'] or 0
    total_categories = Category.objects.count()

    # Views per Post (Top 10)
    top_posts = Post.objects.order_by('-views')[:10]
    post_labels = [post.title for post in top_posts]
    post_data = [post.views for post in top_posts]

    # Posts by Category
    cat_stats = Category.objects.annotate(post_count=Count('posts')).values('title', 'post_count')
    cat_labels = [c['title'] for c in cat_stats]
    cat_data = [c['post_count'] for c in cat_stats]

    # Recent Activity (Last 30 days)
    last_30_days = timezone.now() - timedelta(days=30)
    recent_posts = Post.objects.filter(created_date__gte=last_30_days).annotate(date=TruncDate('created_date')).values('date').annotate(count=Count('id')).order_by('date')
    
    activity_labels = [str(p['date']) for p in recent_posts]
    activity_data = [p['count'] for p in recent_posts]

    context = {
        'total_posts': total_posts,
        'total_comments': total_comments,
        'total_views': total_views,
        'total_categories': total_categories,
        'post_labels': json.dumps(post_labels),
        'post_data': json.dumps(post_data),
        'cat_labels': json.dumps(cat_labels),
        'cat_data': json.dumps(cat_data),
        'activity_labels': json.dumps(activity_labels),
        'activity_data': json.dumps(activity_data),
        'title': 'Analytics Dashboard'
    }
    return render(request, 'admin/analytics_dashboard.html', context)
