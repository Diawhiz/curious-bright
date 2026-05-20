from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from blog.feeds import LatestPostsFeed
from blog import admin_views, views
from django.contrib.sitemaps import views as sitemap_views
from blog.sitemaps import PostSitemap, CategorySitemap, StaticPageSitemap, StaticViewSitemap

sitemaps = {
    'posts': PostSitemap,
    'categories': CategorySitemap,
    'pages': StaticPageSitemap,
    'static': StaticViewSitemap,
}

urlpatterns = [
    path('admin/analytics/', include([
        path('', admin_views.analytics_dashboard, name='admin_analytics'),
    ])),
    path('admin/upload-image/', views.upload_image, name='upload_image'),

    path('admin/', admin.site.urls),
    
    path('tinymce/', include('tinymce.urls')),

    path('', include('blog.urls')),
    
    path('robots.txt', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),
    path('sitemap.xml', sitemap_views.index, {'sitemaps': sitemaps}),
    path('sitemap-<section>.xml', sitemap_views.sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('feed/', LatestPostsFeed(), name='feed'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
