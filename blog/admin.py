from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Post, Comment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'created_at']
    search_fields = ['title']
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ['created_at']

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'status', 'created_date', 'image_preview']
    list_filter = ['status', 'category', 'created_date', 'author']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_date', 'updated_date', 'image_preview']
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'author', 'category', 'status')
        }),
        ('Content', {
            'fields': ('featured_image', 'image_preview', 'content')
        }),
        ('Metadata', {
            'fields': ('created_date', 'updated_date', 'views'),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        if obj.featured_image:
            return format_html('<img src="{}" width="100" height="100" style="border-radius: 8px;" />', obj.featured_image.url)
        return "No Image"
    image_preview.short_description = 'Image Preview'

    actions = ['make_published', 'make_draft']

    def make_published(self, request, queryset):
        queryset.update(status='published')
    make_published.short_description = "Mark selected posts as published"

    def make_draft(self, request, queryset):
        queryset.update(status='draft')
    make_draft.short_description = "Mark selected posts as draft"

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['post', 'user_or_name', 'created_date', 'is_approved', 'likes_count']
    list_filter = ['is_approved', 'created_date']
    search_fields = ['content', 'name', 'email']
    actions = ['approve_comments']

    def user_or_name(self, obj):
        return obj.user.username if obj.user else obj.name
    user_or_name.short_description = 'User/Commenter'

    def likes_count(self, obj):
        return obj.total_likes()
    likes_count.short_description = 'Likes'

    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
    approve_comments.short_description = "Approve selected comments"
