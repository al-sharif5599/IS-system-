from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile, Category, Product, Order, OrderItem, Cart, CartItem, Payment

User = get_user_model()


# ==================== USER SERIALIZERS ====================

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_blocked', 'phone_number', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm', 'first_name', 'last_name', 'phone_number', 'role']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role = validated_data.pop('role', 'customer')
        user = User.objects.create_user(**validated_data)
        user.role = role
        user.is_staff = role == User.Role.ADMIN
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    class Meta:
        model = UserProfile
        fields = ['bio', 'avatar', 'date_of_birth', 'address']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField()


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_blocked', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def update(self, instance, validated_data):
        if 'is_blocked' in validated_data:
            instance.is_blocked = validated_data['is_blocked']
        if 'role' in validated_data:
            instance.is_staff = validated_data['role'] == User.Role.ADMIN
        return super().update(instance, validated_data)


# ==================== PRODUCT SERIALIZERS ====================

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for product categories"""
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'products_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_products_count(self, obj):
        return obj.products.count()


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for products"""
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category', 'category_name',
            'images', 'videos', 'status', 'rejection_reason', 'date_posted', 'date_updated',
            'owner', 'owner_name', 'owner_email'
        ]
        read_only_fields = ['id', 'status', 'rejection_reason', 'date_posted', 'date_updated', 'owner']


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for product listings"""
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'category', 'category_name',
            'images', 'videos', 'status', 'date_posted', 'owner_name'
        ]
        read_only_fields = ['id', 'status', 'date_posted']


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating products with multiple images and videos"""
    
    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'category', 'images', 'videos']

    def validate(self, attrs):
        images = attrs.get('images') or []
        videos = attrs.get('videos') or []
        if len(images) == 0 and len(videos) == 0:
            raise serializers.ValidationError("At least one image or video is required.")
        return attrs
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ProductApprovalSerializer(serializers.ModelSerializer):
    """Serializer for product approval/rejection"""
    
    class Meta:
        model = Product
        fields = ['status', 'rejection_reason']
    
    def validate(self, attrs):
        if attrs.get('status') == Product.Status.REJECTED and not attrs.get('rejection_reason'):
            raise serializers.ValidationError({"rejection_reason": "Rejection reason is required when rejecting a product."})
        return attrs


class ProductSearchSerializer(serializers.ModelSerializer):
    """Serializer for product search results"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'category_name', 'images', 'status', 'date_posted']


# ==================== ORDER SERIALIZERS ====================

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price', 'subtotal']
        read_only_fields = ['id', 'price']

    def get_product_image(self, obj):
        if obj.product.images and len(obj.product.images) > 0:
            return obj.product.images[0]
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['subtotal'] = str(instance.subtotal)
        return data


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders"""
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'customer', 'customer_name', 'customer_email',
            'items', 'total_amount', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_id', 'customer', 'total_amount', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    
    class Meta:
        model = Order
        fields = []


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items"""
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'subtotal']
        read_only_fields = ['id']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['subtotal'] = str(instance.subtotal)
        return data


class CartSerializer(serializers.ModelSerializer):
    """Serializer for shopping cart"""
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total', 'items_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_items_count(self, obj):
        return obj.items.count()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['total'] = str(instance.total)
        return data


class AddToCartSerializer(serializers.Serializer):
    """Serializer for adding items to cart"""
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(default=1, min_value=1)


class UpdateCartItemSerializer(serializers.ModelSerializer):
    """Serializer for updating cart item quantity"""
    
    class Meta:
        model = CartItem
        fields = ['quantity']
    
    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1")
        return value


class CheckoutSerializer(serializers.Serializer):
    """Serializer for checkout process"""
    phone_number = serializers.CharField(max_length=20)


# ==================== PAYMENT SERIALIZERS ====================

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments"""
    order_id = serializers.CharField(source='order.order_id', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'transaction_id', 'order', 'order_id', 'user', 'user_name',
            'amount', 'phone_number', 'status', 'payment_method',
            'mpesa_receipt_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'transaction_id', 'status', 'mpesa_receipt_number', 'created_at', 'updated_at']


class MpesaPaymentSerializer(serializers.Serializer):
    """Serializer for Mpesa payment initiation"""
    order_id = serializers.UUIDField()
    phone_number = serializers.CharField(max_length=20)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class PaymentStatusSerializer(serializers.ModelSerializer):
    """Serializer for payment status update"""
    
    class Meta:
        model = Payment
        fields = ['status', 'mpesa_receipt_number']
    
    def validate_status(self, value):
        if value not in [Payment.Status.COMPLETED, Payment.Status.FAILED]:
            raise serializers.ValidationError("Invalid payment status")
        return value
