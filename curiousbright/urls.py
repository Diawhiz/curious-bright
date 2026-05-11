from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from blog.sitemaps import PostSitemap, CategorySitemap, StaticSitemap
from django.contrib.sitemaps.views import sitemap
from django.views.generic import TemplateView
from blog.feeds import LatestPostsFeed
from blog import admin_views

sitemaps = {
    'posts': PostSitemap,
    'categories': CategorySitemap,
    'pages': StaticSitemap,
}

urlpatterns = [
    path('admin/analytics/', include([
        path('', admin_views.analytics_dashboard, name='admin_analytics'),
    ])),
    path('admin/', admin.site.urls),
    path('', include('blog.urls')),
    path('accounts/', include('allauth.urls')),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),
    path('feed/', LatestPostsFeed(), name='feed'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
