from django.contrib.syndication.views import Feed
from .models import Post


class LatestPostsFeed(Feed):
    title = "CuriousBright"
    link = "/"
    description = "Latest articles from CuriousBright"

    def items(self):
        return Post.objects.filter(
            status='published'
        ).order_by('-created_date')[:20]

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        return item.excerpt or ''

    def item_link(self, item):
        return f"https://curiousbright.com.ng/post/{item.slug}/"

    def item_pubdate(self, item):
        return item.created_date
