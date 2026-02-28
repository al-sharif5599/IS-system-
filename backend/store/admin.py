from django.contrib import admin
from django.contrib.admin.sites import NotRegistered
from allauth.socialaccount.models import SocialApp, SocialToken
from .models import User, UserProfile, Category, Product, Order, OrderItem, Payment


class StyledAdmin(admin.ModelAdmin):
    class Media:
        css = {
            'all': ('admin/custom_admin.css',)
        }


@admin.register(User)
class UserAdmin(StyledAdmin):
    list_display = ['id', 'username', 'email', 'role', 'is_blocked', 'is_active', 'created_at']
    list_filter = ['role', 'is_blocked', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    list_editable = ['is_blocked']


@admin.register(UserProfile)
class UserProfileAdmin(StyledAdmin):
    list_display = ['id', 'user', 'bio', 'date_of_birth']
    search_fields = ['user__username', 'user__email']


@admin.register(Category)
class CategoryAdmin(StyledAdmin):
    list_display = ['id', 'name', 'created_at']
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(StyledAdmin):
    list_display = ['id', 'name', 'price', 'category', 'status', 'owner', 'date_posted']
    list_filter = ['status', 'category', 'date_posted']
    search_fields = ['name', 'description']
    list_editable = ['status']


@admin.register(Order)
class OrderAdmin(StyledAdmin):
    list_display = ['id', 'order_id', 'customer', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_id', 'customer__username', 'customer__email']
    list_editable = ['status']


@admin.register(OrderItem)
class OrderItemAdmin(StyledAdmin):
    list_display = ['id', 'order', 'product', 'quantity', 'price']
    search_fields = ['order__order_id', 'product__name']


@admin.register(Payment)
class PaymentAdmin(StyledAdmin):
    list_display = ['id', 'transaction_id', 'order', 'user', 'amount', 'status', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['transaction_id', 'order__order_id', 'user__email']
    list_editable = ['status']


# Hide selected allauth models from Django admin Social Accounts section.
for model in (SocialApp, SocialToken):
    try:
        admin.site.unregister(model)
    except NotRegistered:
        pass
