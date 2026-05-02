import logging
import requests
import tweepy
from django.conf import settings

logger = logging.getLogger(__name__)


def build_message(post):
    url = f"https://curiousbright.com.ng/post/{post.slug}/"
    title = post.title
    excerpt = post.excerpt or ''
    return {
        # X: max 280 chars
        'short': f"{title}\n\n{url}"[:280],
        # Threads: title + excerpt + url
        'medium': f"{title}\n\n{excerpt}\n\n{url}"[:500],
        # Facebook: full message with link
        'full': f"{title}\n\n{excerpt}\n\nRead more 👉 {url}",
        'url': url,
    }


def post_to_facebook(post):
    try:
        msg = build_message(post)
        resp = requests.post(
            f"https://graph.facebook.com/v19.0/{settings.FACEBOOK_PAGE_ID}/feed",
            data={
                'message': msg['full'],
                'link': msg['url'],
                'access_token': settings.FACEBOOK_PAGE_ACCESS_TOKEN,
            },
            timeout=15
        )
        data = resp.json()
        if 'id' in data:
            logger.info(f"Facebook ✅ {post.title} → {data['id']}")
            return True, data['id']
        error = data.get('error', {}).get('message', str(data))
        logger.error(f"Facebook ❌ {post.title} → {error}")
        return False, error
    except Exception as e:
        logger.error(f"Facebook ❌ {post.title} → {e}")
        return False, str(e)


def post_to_twitter(post):
    try:
        msg = build_message(post)
        client = tweepy.Client(
            consumer_key=settings.TWITTER_API_KEY,
            consumer_secret=settings.TWITTER_API_SECRET,
            access_token=settings.TWITTER_ACCESS_TOKEN,
            access_token_secret=settings.TWITTER_ACCESS_TOKEN_SECRET,
        )
        resp = client.create_tweet(text=msg['short'])
        tweet_id = str(resp.data['id'])
        logger.info(f"Twitter ✅ {post.title} → {tweet_id}")
        return True, tweet_id
    except Exception as e:
        logger.error(f"Twitter ❌ {post.title} → {e}")
        return False, str(e)


def post_to_threads(post):
    try:
        msg = build_message(post)
        token = settings.THREADS_ACCESS_TOKEN
        user_id = settings.THREADS_USER_ID

        # Step 1 — create container
        container = requests.post(
            f"https://graph.threads.net/v1.0/{user_id}/threads",
            data={
                'media_type': 'TEXT',
                'text': msg['medium'],
                'access_token': token,
            },
            timeout=15
        ).json()

        if 'id' not in container:
            error = container.get('error', {}).get('message', str(container))
            logger.error(f"Threads ❌ container failed: {error}")
            return False, error

        # Step 2 — publish
        published = requests.post(
            f"https://graph.threads.net/v1.0/{user_id}/threads_publish",
            data={
                'creation_id': container['id'],
                'access_token': token,
            },
            timeout=15
        ).json()

        if 'id' in published:
            logger.info(f"Threads ✅ {post.title} → {published['id']}")
            return True, published['id']

        error = published.get('error', {}).get('message', str(published))
        logger.error(f"Threads ❌ {post.title} → {error}")
        return False, error

    except Exception as e:
        logger.error(f"Threads ❌ {post.title} → {e}")
        return False, str(e)
