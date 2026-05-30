from django.urls import path
from . import views
from .feeds import LatestPostsFeed

urlpatterns = [
    path('', views.home, name='home'),
    
    path('post/<slug:slug>/', views.post_detail, name='post_detail'),
    path('category/<slug:slug>/', views.category_posts, name='category_posts'),
    path('comment/<int:comment_id>/like/', views.like_comment, name='like_comment'),
    path('post/<slug:slug>/comment/', views.add_comment, name='add_comment'),
    
    path('admin/stats/', views.admin_stats, name='admin_stats'),

    path('posts/', views.all_posts, name='all_posts'),
    path('about/', views.about, name='about'),
    path('privacy/', views.privacy, name='privacy'),
    path('terms/', views.terms, name='terms'),
    path('search/', views.search, name='search'),
    path('feed/', LatestPostsFeed(), name='feed'),
]
