from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Post, Comment, StaticPage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'created_at']
    search_fields = ['title']
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ['created_at']

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'status', 'is_featured', 'featured_order', 'created_date', 'views', 'image_preview']
    list_filter = ['status', 'category', 'is_featured', 'created_date', 'author']
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_date', 'updated_date', 'image_preview', 'views']
    list_editable = ['is_featured', 'featured_order']  # Allows editing from list view

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'author', 'category', 'status', 'excerpt')
        }),
        ('Featured Settings', {
            'fields': ('is_featured', 'featured_order'),
            'classes': ('wide',),
            'description': 'Check "is_featured" to show this post in the hero section. Use "featured_order" to control display order (lower numbers appear first).'
        }),
        ('Media', {
            'fields': ('featured_image', 'image_preview'),
        }),
        ('Content', {
            'fields': ('content',),
            'classes': ('wide',),
        }),
        ('Metadata', {
            'fields': ('created_date', 'updated_date', 'views'),
            'classes': ('collapse',),
        }),
    )

    def image_preview(self, obj):
        if obj.featured_image:
            return format_html('<img src="{}" width="100" height="100" style="border-radius: 8px; object-fit: cover;" />', obj.featured_image.url)
        return "No Image"
    image_preview.short_description = 'Image Preview'

    actions = ['make_published', 'make_draft', 'make_featured', 'remove_featured']

    def make_published(self, request, queryset):
        updated = queryset.update(status='published')
        self.message_user(request, f'{updated} posts marked as published.')
    make_published.short_description = "Mark selected posts as published"

    def make_draft(self, request, queryset):
        updated = queryset.update(status='draft')
        self.message_user(request, f'{updated} posts marked as draft.')
    make_draft.short_description = "Mark selected posts as draft"

    def make_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} posts marked as featured.')
    make_featured.short_description = "⭐ Mark selected posts as featured"

    def remove_featured(self, request, queryset):
        updated = queryset.update(is_featured=False, featured_order=0)
        self.message_user(request, f'Featured removed from {updated} posts.')
    remove_featured.short_description = "Remove featured from selected posts"

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['post', 'user_or_name', 'created_date', 'is_approved', 'likes_count']
    list_filter = ['is_approved', 'created_date']
    search_fields = ['content', 'name', 'email']
    list_editable = ['is_approved']
    actions = ['approve_comments', 'disapprove_comments']

    def user_or_name(self, obj):
        return obj.user.username if obj.user else obj.name
    user_or_name.short_description = 'User/Commenter'

    def likes_count(self, obj):
        return obj.likes.count()
    likes_count.short_description = 'Likes'

    def approve_comments(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} comments approved.')
    approve_comments.short_description = "Approve selected comments"

    def disapprove_comments(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} comments disapproved.')
    disapprove_comments.short_description = "Disapprove selected comments"

@admin.register(StaticPage)
class StaticPageAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'is_published', 'created_date']
    list_filter = ['is_published', 'created_date']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Page Information', {
            'fields': ('title', 'slug', 'meta_description')
        }),
        ('Content', {
            'fields': ('content',),
            'classes': ('wide',),
        }),
        ('Publication', {
            'fields': ('is_published',),
        }),
    )
