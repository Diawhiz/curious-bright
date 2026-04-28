from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Post, Category, StaticPage

class PostSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8
    protocol = 'https'
    domain = 'curiousbright.com.ng'

    def items(self):
        return Post.objects.filter(status='published')

    def lastmod(self, obj):
        return obj.updated_date

    def location(self, obj):
        return reverse('post_detail', args=[obj.slug])

class CategorySitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.6
    protocol = 'https'
    domain = 'curiousbright.com.ng'

    def items(self):
        return Category.objects.all()

    def location(self, obj):
        return reverse('category_posts', args=[obj.slug])

class StaticSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.5
    protocol = 'https'
    domain = 'curiousbright.com.ng'

    def items(self):
        return ['home', 'about', 'privacy', 'terms']

    def location(self, item):
        return reverse(item)
