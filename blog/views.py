from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib import messages
from .models import Post, Category, Comment, StaticPage
from django.db.models import Q
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.models import User

def home(request):
    featured_posts = Post.objects.filter(status='published').order_by('-created_date')[:3]
    posts = Post.objects.filter(status='published').order_by('-created_date')[3:12]
    recent_posts = Post.objects.filter(status='published').order_by('-created_date')[:5]

    # SEO for homepage
    meta = {
        'title': 'CuriousBright - Latest News & Articles',
        'description': 'Stay informed with the latest news, articles and stories on CuriousBright.',
        'image': None,  # put your default OG image static path here
        'url': request.build_absolute_uri(),
        'type': 'website',
        'site_name': 'CuriousBright',
    }

    context = {
        'featured_posts': featured_posts,
        'posts': posts,
        'recent_posts': recent_posts,
        'meta': meta,
    }
    return render(request, 'blog/home.html', context)


def category_posts(request, slug):
    category = get_object_or_404(Category, slug=slug)
    posts = Post.objects.filter(category=category, status='published').order_by('-created_date')

    meta = {
        'title': f'{category.name} - CuriousBright',
        'description': f'Browse all {category.name} articles on CuriousBright.',
        'image': None,
        'url': request.build_absolute_uri(),
        'type': 'website',
        'site_name': 'CuriousBright',
    }

    context = {
        'category': category,
        'posts': posts,
        'meta': meta,
    }
    return render(request, 'blog/category_posts.html', context)

def post_detail(request, slug):
    post = get_object_or_404(Post, slug=slug, status='published')
    post.views += 1
    post.save()

    comments = post.comments.filter(parent=None, is_approved=True)
    related_posts = Post.objects.filter(category=post.category, status='published').exclude(id=post.id)[:3]

    # SEO meta tags
    meta = {
        'title': post.title,
        'description': post.excerpt if hasattr(post, 'excerpt') else post.content[:160],
        'image': post.featured_image.url if post.featured_image else None,
        'url': request.build_absolute_uri(),
        'type': 'article',
        'site_name': 'CuriousBright',
    }

    context = {
        'post': post,
        'comments': comments,
        'related_posts': related_posts,
        'meta': meta,
    }
    return render(request, 'blog/post_detail.html', context)

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
