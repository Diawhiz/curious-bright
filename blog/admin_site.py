"""
Custom Admin Site with WordPress-like styling
"""
from django.contrib.admin import AdminSite


class CuriousBrightAdminSite(AdminSite):
    """Custom admin site with WordPress-like branding"""
    
    site_header = 'CuriousBright CMS'
    site_title = 'CuriousBright Admin'
    index_title = 'Dashboard'
    
    def each_context(self, request):
        context = super().each_context(request)
        context['site_header'] = self.site_header
        context['site_title'] = self.site_title
        return context


# Create instance
admin_site = CuriousBrightAdminSite(name='curiousbright_admin')
