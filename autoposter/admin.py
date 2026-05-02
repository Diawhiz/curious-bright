from django.contrib import admin
from django.utils.html import format_html
from .models import SocialPost
from .poster import post_to_facebook, post_to_twitter, post_to_threads


@admin.register(SocialPost)
class SocialPostAdmin(admin.ModelAdmin):
    list_display = ['post', 'platform', 'status_badge', 'platform_post_id', 'posted_at']
    list_filter = ['platform', 'status']
    search_fields = ['post__title']
    readonly_fields = ['post', 'platform', 'platform_post_id', 'error_message', 'posted_at']
    actions = ['retry_failed']

    def status_badge(self, obj):
        colors = {'posted': '#10b981', 'failed': '#ef4444'}
        color = colors.get(obj.status, '#9ca3af')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:999px;font-size:11px;font-weight:600;">{}</span>',
            color, obj.status.upper()
        )
    status_badge.short_description = 'Status'

    @admin.action(description='🔁 Retry failed posts')
    def retry_failed(self, request, queryset):
        poster_map = {
            'facebook': post_to_facebook,
            'twitter': post_to_twitter,
            'threads': post_to_threads,
        }
        retried = 0
        for social in queryset.filter(status='failed'):
            success, result = poster_map[social.platform](social.post)
            social.status = 'posted' if success else 'failed'
            social.platform_post_id = result if success else ''
            social.error_message = '' if success else result
            social.save()
            retried += 1
        self.message_user(request, f"Retried {retried} posts.")
