from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib import messages
from django.db.models import Q, F
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie
from django.views.decorators.http import require_POST

from .models import Post, Category, Comment, StaticPage


@cache_page(60 * 10)
@vary_on_cookie
def home(request):
    featured_posts = Post.objects.filter(
        status='published',
        is_featured=True
    ).select_related('author', 'category').order_by('featured_order', '-created_date')[:5]

    latest_posts = Post.objects.filter(
        status='published',
        is_featured=False
    ).select_related('author', 'category').order_by('-created_date')[:9]

    context = {
        'featured_posts': featured_posts,
        'latest_posts': latest_posts,
    }
    return render(request, 'blog/home.html', context)


@cache_page(60 * 15)
@vary_on_cookie
def post_detail(request, slug):
    post = get_object_or_404(
        Post.objects.select_related('author', 'category'),
        slug=slug,
        status='published'
    )

    Post.objects.filter(pk=post.pk).update(views=F('views') + 1)

    comments = Comment.objects.filter(
        post=post, parent=None, is_approved=True
    ).select_related('user').prefetch_related(
        'replies__user', 'likes'
    )

    related_posts = Post.objects.filter(
        category=post.category,
        status='published'
    ).exclude(id=post.id).select_related('author', 'category').order_by('-created_date')[:3]

    context = {
        'post': post,
        'comments': comments,
        'related_posts': related_posts,
    }
    return render(request, 'blog/post_detail.html', context)


@cache_page(60 * 10)
def category_posts(request, slug):
    category = get_object_or_404(Category, slug=slug)
    posts = Post.objects.filter(
        category=category,
        status='published'
    ).select_related('author', 'category').order_by('-created_date')

    context = {
        'category': category,
        'posts': posts,
    }
    return render(request, 'blog/category_posts.html', context)


@cache_page(60 * 10)
def all_posts(request):
    posts_list = Post.objects.filter(
        status='published'
    ).select_related('author', 'category').order_by('-created_date')

    paginator = Paginator(posts_list, 12)
    page = request.GET.get('page', 1)

    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        posts = paginator.page(1)
    except EmptyPage:
        posts = paginator.page(paginator.num_pages)

    context = {
        'posts': posts,
        'is_paginated': True,
    }
    return render(request, 'blog/all_posts.html', context)


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
        content = request.POST.get('content', '').strip()
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()

        if content:
            comment_data = {
                'post': post,
                'content': content,
                'parent_id': parent_id if parent_id else None,
            }
            
            if request.user.is_authenticated:
                comment_data['user'] = request.user
            else:
                comment_data['name'] = name if name else 'Anonymous'
                comment_data['email'] = email

            Comment.objects.create(**comment_data)
            messages.success(request, 'Comment added successfully! It will appear once approved.' if not request.user.is_authenticated else 'Comment added successfully!')
            
    return redirect('post_detail', slug=post.slug)


def about(request):
    page = get_object_or_404(StaticPage, slug='about', is_published=True)
    return render(request, 'blog/about.html', {'page': page})


def privacy(request):
    page = get_object_or_404(StaticPage, slug='privacy', is_published=True)
    return render(request, 'blog/privacy.html', {'page': page})


def terms(request):
    page = get_object_or_404(StaticPage, slug='terms', is_published=True)
    return render(request, 'blog/terms.html', {'page': page})


@staff_member_required
def admin_stats(request):
    from django.contrib.auth.models import User
    stats = {
        'posts': Post.objects.count(),
        'comments': Comment.objects.count(),
        'users': User.objects.count(),
        'categories': Category.objects.count(),
    }
    return JsonResponse(stats)


def custom_404(request, exception):
    return render(request, '404.html', status=404)


def custom_500(request):
    return render(request, '500.html', status=500)


def custom_403(request, exception):
    return render(request, '403.html', status=403)
