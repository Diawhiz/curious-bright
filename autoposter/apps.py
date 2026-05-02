from django.apps import AppConfig


class AutoposterConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'autoposter'

    def ready(self):
        import autoposter.signals  # noqa
