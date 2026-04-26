from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib import messages
from .models import Post, Category, Comment, StaticPage
from django.db.models import Q
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.models import User

def home(request):
    # Get featured/latest post for hero
    featured_posts = Post.objects.filter(status='published').order_by('-created_date')[:3]
    # Get all other posts
    posts = Post.objects.filter(status='published').order_by('-created_date')[3:12]
    # Get recent posts for sidebar
    recent_posts = Post.objects.filter(status='published').order_by('-created_date')[:5]

    context = {
        'featured_posts': featured_posts,
        'posts': posts,
        'recent_posts': recent_posts,
    }
    return render(request, 'blog/home.html', context)

def post_detail(request, slug):
    post = get_object_or_404(Post, slug=slug, status='published')
    # Increment view count
    post.views += 1
    post.save()

    # Get comments for this post
    comments = post.comments.filter(parent=None, is_approved=True)

    # Get related posts (same category)
    related_posts = Post.objects.filter(category=post.category, status='published').exclude(id=post.id)[:3]

    context = {
        'post': post,
        'comments': comments,
        'related_posts': related_posts,
    }
    return render(request, 'blog/post_detail.html', context)

def category_posts(request, slug):
    category = get_object_or_404(Category, slug=slug)
    posts = Post.objects.filter(category=category, status='published').order_by('-created_date')

    context = {
        'category': category,
        'posts': posts,
    }
    return render(request, 'blog/category_posts.html', context)

@login_required
def like_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)
    if request.user in comment.likes.all():
        comment.likes.remove(request.user)
        liked = False
    else:
        comment.likes.add(request.user)
        liked = True

    return JsonResponse({'liked': liked, 'total_likes': comment.total_likes()})

def add_comment(request, slug):
    post = get_object_or_404(Post, slug=slug)

    if request.method == 'POST':
        parent_id = request.POST.get('parent_id')
        content = request.POST.get('content')

        if request.user.is_authenticated:
            comment = Comment.objects.create(
                post=post,
                user=request.user,
                content=content,
                parent_id=parent_id if parent_id else None
            )
        else:
            name = request.POST.get('name')
            email = request.POST.get('email')
            comment = Comment.objects.create(
                post=post,
                name=name,
                email=email,
                content=content,
                parent_id=parent_id if parent_id else None
            )

        messages.success(request, 'Comment added successfully!')

    return redirect('post_detail', slug=post.slug)

@staff_member_required
def admin_stats(request):
    stats = {
        'posts': Post.objects.count(),
        'comments': Comment.objects.count(),
        'users': User.objects.count(),
        'categories': Category.objects.count(),
    }
    return JsonResponse(stats)


def about(request):
    page = get_object_or_404(StaticPage, slug='about', is_published=True)
    return render(request, 'blog/about.html', {'page': page})

def privacy(request):
    page = get_object_or_404(StaticPage, slug='privacy', is_published=True)
    return render(request, 'blog/privacy.html', {'page': page})

def terms(request):
    page = get_object_or_404(StaticPage, slug='terms', is_published=True)
    return render(request, 'blog/terms.html', {'page': page})

# Error views
def custom_404(request, exception):
    return render(request, '404.html', status=404)

def custom_500(request):
    return render(request, '500.html', status=500)

def custom_403(request, exception):
    return render(request, '403.html', status=403)
