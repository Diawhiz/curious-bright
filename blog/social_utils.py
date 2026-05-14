"""
Social media auto-posting utilities for CuriousBright blog.
Supports Facebook, Threads, and Quora posting when posts are published.
"""

import os
import logging
import requests
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

# Request timeout for external API calls
REQUEST_TIMEOUT = 10


def _get_post_url(post):
    """Safely get the post URL, handling missing Site configuration."""
    try:
        return post.get_full_url()
    except Exception as e:
        logger.warning(f"Could not get full URL for post {post.id}: {e}")
        return post.get_absolute_url()


def _truncate_text(text, max_length):
    """Truncate text to fit within platform limits."""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def post_to_facebook(post):
    """
    Post to Facebook Page using Graph API.
    
    Requires environment variables:
    - FB_PAGE_ID
    - FB_ACCESS_TOKEN
    
    Returns:
        dict: {'success': bool, 'post_id': str|None, 'url': str|None, 'error': str|None}
    """
    page_id = os.environ.get('FB_PAGE_ID')
    access_token = os.environ.get('FB_ACCESS_TOKEN')
    
    if not all([page_id, access_token]):
        logger.debug(f"Skipping Facebook post for '{post.title}': Missing credentials.")
        return {'success': False, 'post_id': None, 'url': None, 'error': 'Missing credentials'}
    
    try:
        post_url = _get_post_url(post)
        
        # Build the payload
        message = f"{post.title}\n\n{post.excerpt or ''}"
        params = {
            "message": message,
            "link": post_url,
            "access_token": access_token
        }
        
        # Make request
        api_url = f"https://graph.facebook.com/v18.0/{page_id}/feed"
        response = requests.post(api_url, data=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        
        result = response.json()
        if 'id' in result:
            post_id = result['id']
            fb_url = f"https://facebook.com/{post_id}"
            logger.info(f"Posted to Facebook: {post.title} - {fb_url}")
            return {
                'success': True,
                'post_id': post_id,
                'url': fb_url,
                'error': None
            }
        else:
            logger.warning(f"Facebook post returned unexpected response: {result}")
            return {'success': False, 'post_id': None, 'url': None, 'error': 'Unexpected response'}
            
    except requests.Timeout:
        logger.error(f"Facebook post timed out for '{post.title}'")
        return {'success': False, 'post_id': None, 'url': None, 'error': 'Request timeout'}
    except requests.RequestException as e:
        logger.error(f"Facebook post failed for '{post.title}': {e}")
        return {'success': False, 'post_id': None, 'url': None, 'error': str(e)}
    except Exception as e:
        logger.error(f"Unexpected error posting to Facebook: {e}")
        return {'success': False, 'post_id': None, 'url': None, 'error': str(e)}


def post_to_threads(post):
    """
    Post to Threads using the Threads API.
    
    Requires environment variables:
    - THREADS_ACCESS_TOKEN
    - THREADS_USER_ID
    
    Returns:
        dict: {'success': bool, 'post_id': str|None, 'url': str|None, 'error': str|None}
    """
    access_token = os.environ.get('THREADS_ACCESS_TOKEN')
    user_id = os.environ.get('THREADS_USER_ID')
    
    if not all([access_token, user_id]):
        logger.debug(f"Skipping Threads post for '{post.title}': Missing credentials.")
        return {'success': False, 'post_id': None, 'url': None, 'error': 'Missing credentials'}
    
    try:
        post_url = _get_post_url(post)
        
        # Threads has a 500 character limit
        max_text_length = 500 - len(post_url) - 10
        text = _truncate_text(post.title, max_text_length)
        caption = f"{text}\n\nRead more: {post_url}"
        
        # Step 1: Create a media container
        container_url = f"https://graph.threads.net/v1.0/{user_id}/threads"
        container_params = {
            "media_type": "TEXT",
            "text": caption,
            "access_token": access_token
        }
        
        container_response = requests.post(
            container_url,
            data=container_params,
            timeout=REQUEST_TIMEOUT
        )
        container_response.raise_for_status()
        container_result = container_response.json()
        
        if 'id' not in container_result:
            logger.warning(f"Threads container creation failed: {container_result}")
            return {'success': False, 'post_id': None, 'url': None, 'error': 'Container creation failed'}
        
        creation_id = container_result['id']
        
        # Step 2: Publish the container
        publish_url = f"https://graph.threads.net/v1.0/{user_id}/threads_publish"
        publish_params = {
            "creation_id": creation_id,
            "access_token": access_token
        }
        
        publish_response = requests.post(
            publish_url,
            data=publish_params,
            timeout=REQUEST_TIMEOUT
        )
        publish_response.raise_for_status()
        publish_result = publish_response.json()
        
        if 'id' in publish_result:
            post_id = publish_result['id']
            threads_url = f"https://threads.net/@{user_id}/post/{post_id}"
            logger.info(f"Posted to Threads: {post.title} - {threads_url}")
            return {
                'success': True,
                'post_id': post_id,
                'url': threads_url,
                'error': None
            }
        else:
            logger.warning(f"Threads publish returned unexpected response: {publish_result}")
            return {'success': False, 'post_id': None, 'url': None, 'error': 'Unexpected response'}
            
    except requests.Timeout:
        logger.error(f"Threads post timed out for '{post.title}'")
        return {'success': False, 'post_id': None, 'url': None, 'error': 'Request timeout'}
    except requests.RequestException as e:
        logger.error(f"Threads post failed for '{post.title}': {e}")
        return {'success': False, 'post_id': None, 'url': None, 'error': str(e)}
    except Exception as e:
        logger.error(f"Unexpected error posting to Threads: {e}")
        return {'success': False, 'post_id': None, 'url': None, 'error': str(e)}


def post_to_quora(post):
    """
    Post to Quora using their sharing API or as an answer to relevant questions.
    
    Note: Quora doesn't have a direct posting API for creating posts.
    This function can be used to:
    1. Generate shareable links
    2. Create draft content for manual posting
    3. Post as answers to questions (requires question ID)
    
    Requires environment variables:
    - QUORA_ACCESS_TOKEN (if using Quora's partner API)
    - QUORA_QUESTION_ID (optional, to post as answer)
    
    For now, this creates a shareable URL that can be manually posted.
    
    Returns:
        dict: {'success': bool, 'post_id': str|None, 'url': str|None, 'error': str|None}
    """
    access_token = os.environ.get('QUORA_ACCESS_TOKEN')
    
    try:
        post_url = _get_post_url(post)
        
        # Quora doesn't have a public API for creating posts
        # We'll create a shareable URL and log it for manual posting
        quora_share_url = f"https://www.quora.com/share?url={requests.utils.quote(post_url)}&title={requests.utils.quote(post.title)}"
        
        # If access token is available, attempt to use Quora's API
        if access_token:
            # Quora API is limited and primarily for partners
            # This is a placeholder for actual API integration when available
            logger.info(f"Quora API integration not fully implemented. Manual share URL: {quora_share_url}")
        else:
            logger.debug(f"Quora credentials not configured. Generated share URL for manual posting.")
        
        # Return success with the share URL for manual posting
        return {
            'success': True,
            'post_id': None,
            'url': quora_share_url,
            'error': None
        }
            
    except Exception as e:
        logger.error(f"Unexpected error generating Quora share: {e}")
        return {'success': False, 'post_id': None, 'url': None, 'error': str(e)}


def autopost_to_social(post, platforms=None):
    """
    Main entry point for autoposting to social media platforms.
    
    Args:
        post: Post model instance
        platforms: List of platforms to post to ['facebook', 'threads', 'quora']
                   If None, posts to all configured platforms.
    
    Returns:
        dict: Results for each platform with success status and post details
    """
    if platforms is None:
        platforms = ['facebook', 'threads', 'quora']
    
    results = {}
    
    if 'facebook' in platforms:
        results['facebook'] = post_to_facebook(post)
    
    if 'threads' in platforms:
        results['threads'] = post_to_threads(post)
    
    if 'quora' in platforms:
        results['quora'] = post_to_quora(post)
    
    success_count = sum(1 for r in results.values() if r.get('success'))
    if success_count > 0:
        logger.info(f"Autopost completed: {success_count}/{len(results)} platforms succeeded")
    
    return results
