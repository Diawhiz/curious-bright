from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Post, Category, StaticPage


class PostSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.9

    def items(self):
        return Post.objects.filter(status='published').order_by('-created_date')

    def lastmod(self, obj):
        return obj.updated_date if hasattr(obj, 'updated_date') else obj.created_date

    def location(self, obj):
        return f'/post/{obj.slug}/'


class CategorySitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.7

    def items(self):
        return Category.objects.all()

    def location(self, obj):
        return f'/category/{obj.slug}/'


class StaticPageSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.6

    def items(self):
        return StaticPage.objects.filter(is_published=True)

    def location(self, obj):
        return f'/{obj.slug}/'


class StaticViewSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.5

    def items(self):
        return ['home', 'all_posts', 'about']

    def location(self, item):
        return reverse(item)