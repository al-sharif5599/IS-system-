"""
URL configuration for online_shop project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


from store.views import (
    RegisterView, VerifyEmailView, PasswordResetRequestView, PasswordResetConfirmView,
    ChangePasswordView, UserListView, UserDetailView, BlockUserView, CurrentUserView, AdminStatsView,
    CategoryListView, CategoryDetailView, ProductListView, ProductDetailView,
    MyProductsView, ApproveProductView, RejectProductView, PendingProductsView, ProductSearchView,
    CartView, AddToCartView, UpdateCartItemView, RemoveCartItemView, ClearCartView,
    CheckoutView, OrderListView, OrderDetailView, CancelOrderView,
    InitiatePaymentView, PaymentCallbackView, PaymentListView, PaymentDetailView,
    HomeView
)

urlpatterns = [
    # Home - redirect to frontend
    path('', HomeView.as_view(), name='home'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # Authentication
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/verify-email/<str:uidb64>/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('api/auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('api/auth/password-reset/confirm/<str:uidb64>/<str:token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/auth/me/', CurrentUserView.as_view(), name='current-user'),
    
    # User Management (Admin)
    path('api/admin/users/', UserListView.as_view(), name='user-list'),
    path('api/admin/users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('api/admin/users/<int:user_id>/block/', BlockUserView.as_view(), name='block-user'),
    path('api/admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    
    # Categories
    path('api/categories/', CategoryListView.as_view(), name='category-list'),
    path('api/categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    
    # Products
    path('api/products/', ProductListView.as_view(), name='product-list'),
    path('api/products/search/', ProductSearchView.as_view(), name='product-search'),
    path('api/products/my/', MyProductsView.as_view(), name='my-products'),
    path('api/products/<str:product_id>/approve/', ApproveProductView.as_view(), name='approve-product'),
    path('api/products/<str:product_id>/reject/', RejectProductView.as_view(), name='reject-product'),
    path('api/products/pending/', PendingProductsView.as_view(), name='pending-products'),
    path('api/products/<str:pk>/', ProductDetailView.as_view(), name='product-detail'),
    
    # Cart
    path('api/cart/', CartView.as_view(), name='cart'),
    path('api/cart/add/', AddToCartView.as_view(), name='add-to-cart'),
    path('api/cart/items/<int:pk>/', UpdateCartItemView.as_view(), name='update-cart-item'),
    path('api/cart/items/<int:pk>/delete/', RemoveCartItemView.as_view(), name='remove-cart-item'),
    path('api/cart/clear/', ClearCartView.as_view(), name='clear-cart'),
    
    # Orders
    path('api/orders/', OrderListView.as_view(), name='order-list'),
    path('api/orders/checkout/', CheckoutView.as_view(), name='checkout'),
    path('api/orders/<str:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('api/orders/<str:order_id>/cancel/', CancelOrderView.as_view(), name='cancel-order'),
    
    # Payments
    path('api/payments/initiate/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('api/payments/callback/', PaymentCallbackView.as_view(), name='payment-callback'),
    path('api/payments/', PaymentListView.as_view(), name='payment-list'),
    path('api/payments/<str:pk>/', PaymentDetailView.as_view(), name='payment-detail'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)






