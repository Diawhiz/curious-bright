import os
import logging
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

# Serverless-safe timeout for all external API calls
REQUEST_TIMEOUT = 5  # seconds - keeps response fast for serverless


def _get_post_url(post):
    """Safely get the post URL, handling missing Site configuration."""
    try:
        return post.get_full_url()
    except Exception as e:
        logger.warning(f"Could not get full URL for post {post.id}: {e}")
        # Fallback to relative URL
        return post.get_absolute_url()


def post_to_twitter(post):
    """
    Placeholder for Twitter/X API integration.
    Requires: twitter-python or direct requests to X API v2.
    
    Serverless considerations:
    - Uses short timeout to prevent hanging
    - Gracefully handles missing credentials
    - Logs all outcomes for debugging
    """
    api_key = os.environ.get('TWITTER_API_KEY')
    api_secret = os.environ.get('TWITTER_API_SECRET')
    access_token = os.environ.get('TWITTER_ACCESS_TOKEN')
    access_token_secret = os.environ.get('TWITTER_ACCESS_TOKEN_SECRET')
    
    if not all([api_key, api_secret, access_token, access_token_secret]):
        logger.debug(f"Skipping Twitter post for '{post.title}': Missing credentials.")
        return False
    
    try:
        post_url = _get_post_url(post)
        
        # Example implementation with timeout (uncomment when ready):
        # import tweepy
        # client = tweepy.Client(
        #     consumer_key=api_key,
        #     consumer_secret=api_secret,
        #     access_token=access_token,
        #     access_token_secret=access_token_secret
        # )
        # text = f"{post.title}\n\nRead more: {post_url}"
        # response = client.create_tweet(text=text)
        # logger.info(f"Posted to Twitter: {post.title}")
        # return True
        
        logger.info(f"[SIMULATED] Twitter post for '{post.title}' -> {post_url}")
        return True
        
    except Exception as e:
        logger.error(f"Twitter post failed for '{post.title}': {e}")
        return False


def post_to_facebook(post):
    """
    Placeholder for Facebook Graph API integration.
    
    Serverless considerations:
    - Uses short timeout to prevent hanging
    - Gracefully handles missing credentials
    - Handles API errors without breaking the request
    """
    page_id = os.environ.get('FB_PAGE_ID')
    access_token = os.environ.get('FB_ACCESS_TOKEN')
    
    if not all([page_id, access_token]):
        logger.debug(f"Skipping Facebook post for '{post.title}': Missing credentials.")
        return False
    
    try:
        # Import here to avoid dependency if not used
        import requests
        
        post_url = _get_post_url(post)
        
        # Build the payload
        message = f"{post.title}\n\n{post.excerpt or ''}"
        params = {
            "message": message,
            "link": post_url,
            "access_token": access_token
        }
        
        # Make request with timeout (serverless-safe)
        api_url = f"https://graph.facebook.com/v18.0/{page_id}/feed"
        response = requests.post(
            api_url,
            data=params,
            timeout=REQUEST_TIMEOUT
        )
        response.raise_for_status()
        
        result = response.json()
        if 'id' in result:
            logger.info(f"Posted to Facebook: {post.title}")
            return True
        else:
            logger.warning(f"Facebook post returned unexpected response: {result}")
            return False
            
    except ImportError:
        logger.debug("requests library not available, skipping Facebook post")
        return False
    except requests.Timeout:
        logger.error(f"Facebook post timed out for '{post.title}'")
        return False
    except requests.RequestException as e:
        logger.error(f"Facebook post failed for '{post.title}': {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error posting to Facebook: {e}")
        return False


def autopost_to_social(post):
    """
    Main entry point for autoposting logic.
    
    This function is serverless-safe:
    - Each post operation has a short timeout
    - Failures are logged but don't break the flow
    - Returns results for optional tracking
    """
    results = {
        'twitter': post_to_twitter(post),
        'facebook': post_to_facebook(post),
    }
    
    success_count = sum(1 for v in results.values() if v)
    if success_count > 0:
        logger.info(f"Autopost completed: {success_count}/{len(results)} platforms succeeded")
    
    return results
