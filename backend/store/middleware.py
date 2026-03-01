from django.middleware.csrf import get_token
from django.utils.deprecation import MiddlewareMixin


class CSRFExemptAPI(MiddlewareMixin):
    """
    Exempt API endpoints from CSRF protection.
    JWT authentication uses Authorization header, not cookies,
    so CSRF protection is not needed for API endpoints.
    """
    
    def process_request(self, request):
        # Exempt all API endpoints from CSRF
        if request.path.startswith('/api/'):
            request.csrf_processing_done = True
        return None
