import os
import uuid
import random
import string
import time
from django.conf import settings
from django.shortcuts import redirect
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Q

from .models import UserProfile, Category, Product, Order, OrderItem, Cart, CartItem, Payment
from .serializers import (
    UserSerializer, UserRegistrationSerializer, ChangePasswordSerializer, 
    PasswordResetSerializer, AdminUserSerializer, CategorySerializer,
    ProductSerializer, ProductListSerializer, ProductCreateSerializer, 
    ProductApprovalSerializer, ProductSearchSerializer, OrderSerializer,
    CartSerializer, CartItemSerializer, AddToCartSerializer, 
    UpdateCartItemSerializer, CheckoutSerializer, PaymentSerializer, 
    MpesaPaymentSerializer
)
from .permissions import IsRoleAdmin

User = get_user_model()


# ==================== HOME VIEW ====================

class HomeView(APIView):
    """Redirect to the frontend application"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return redirect('http://localhost:5173')


# ==================== AUTH VIEWS ====================

class RegisterView(generics.CreateAPIView):
    """User registration view"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        verification_url = f"{settings.SITE_URL}/verify-email/{uid}/{token}/"
        send_mail(
            'Verify your email',
            f'Click the link to verify your email: {verification_url}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response({
            'message': 'User registered successfully. Please check your email to verify your account.',
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    """Email verification view"""
    permission_classes = [AllowAny]
    
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.save()
                UserProfile.objects.get_or_create(user=user)
                return Response({'message': 'Email verified successfully'}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """Password reset request view"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"{settings.SITE_URL}/reset-password/{uid}/{token}/"
            send_mail(
                'Password Reset Request',
                f'Click the link to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'If the email exists, a reset link has been sent'}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Password reset confirmation view"""
    permission_classes = [AllowAny]
    
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                new_password = request.data.get('new_password')
                confirm_password = request.data.get('confirm_password')
                
                if new_password != confirm_password:
                    return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
                
                user.set_password(new_password)
                user.save()
                return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change password view"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    """List all users (admin only)"""
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsRoleAdmin]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a user (admin only)"""
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsRoleAdmin]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class BlockUserView(APIView):
    """Block or unblock a user (admin only)"""
    permission_classes = [IsAuthenticated, IsRoleAdmin]
    
    def post(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
            # Toggle the blocked status
            user.is_blocked = not user.is_blocked
            user.save()
            action = 'blocked' if user.is_blocked else 'unblocked'
            return Response({'message': f'User {action} successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class CurrentUserView(APIView):
    """Get current user info"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AdminStatsView(APIView):
    """Admin dashboard statistics"""
    permission_classes = [IsAuthenticated, IsRoleAdmin]
    
    def get(self, request):
        from django.utils import timezone
        
        today = timezone.now().date()
        
        total_users = User.objects.count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        
        today_users = User.objects.filter(date_joined__date=today).count()
        today_products = Product.objects.filter(date_posted__date=today).count()
        today_orders = Order.objects.filter(created_at__date=today).count()
        
        blocked_users = User.objects.filter(is_blocked=True).count()
        
        pending_orders = Order.objects.filter(status=Order.Status.PENDING).count()
        paid_orders = Order.objects.filter(status=Order.Status.PAID).count()
        cancelled_orders = Order.objects.filter(status=Order.Status.CANCELLED).count()
        
        pending_products = Product.objects.filter(status=Product.Status.PENDING).count()
        approved_products = Product.objects.filter(status=Product.Status.APPROVED).count()
        rejected_products = Product.objects.filter(status=Product.Status.REJECTED).count()
        
        return Response({
            'total_users': total_users,
            'total_products': total_products,
            'total_orders': total_orders,
            'today_users': today_users,
            'today_products': today_products,
            'today_orders': today_orders,
            'blocked_users': blocked_users,
            'orders_by_status': {
                'pending': pending_orders,
                'paid': paid_orders,
                'cancelled': cancelled_orders
            },
            'products_by_status': {
                'pending': pending_products,
                'approved': approved_products,
                'rejected': rejected_products
            }
        })


# ==================== CATEGORY VIEWS ====================

class CategoryListView(generics.ListCreateAPIView):
    """List all categories or create a new category"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsRoleAdmin()]
        return [AllowAny()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a category"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsRoleAdmin]


# ==================== PRODUCT VIEWS ====================

class ProductListView(generics.ListCreateAPIView):
    """List all products or create a new product"""
    queryset = Product.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'status']
    search_fields = ['name', 'description']
    ordering_fields = ['date_posted', 'price', 'name']
    ordering = ['-date_posted']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_authenticated or not self.request.user.is_admin:
            queryset = queryset.filter(status=Product.Status.APPROVED)
        return queryset
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def create(self, request, *args, **kwargs):
        images = request.FILES.getlist('images')
        videos = request.FILES.getlist('videos')
        
        image_urls = []
        video_urls = []
        
        for image in images:
            image_url = self._save_media_file(image, 'images')
            image_urls.append(image_url)
        
        for video in videos:
            video_url = self._save_media_file(video, 'videos')
            video_urls.append(video_url)
        
        data = request.data.copy()
        data['images'] = image_urls
        data['videos'] = video_urls
        
        if 'category' in data and isinstance(data.get('category'), str):
            try:
                category = Category.objects.get(name=data['category'])
                data['category'] = category.id
            except Category.DoesNotExist:
                pass
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def _save_media_file(self, file, folder):
        ext = os.path.splitext(file.name)[1]
        filename = f"{uuid.uuid4()}{ext}"
        
        upload_dir = os.path.join(settings.MEDIA_ROOT, f'products/{folder}')
        os.makedirs(upload_dir, exist_ok=True)
        
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        return f"/media/products/{folder}/{filename}"


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a product"""
    queryset = Product.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            if self.request.user.is_admin:
                return ProductApprovalSerializer
            product = self.get_object()
            if product.status != Product.Status.PENDING:
                return ProductSerializer
        return ProductSerializer
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if not request.user.is_admin and instance.status == Product.Status.APPROVED:
            return Response(
                {'error': 'Approved products cannot be edited'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().update(request, *args, **kwargs)


class MyProductsView(generics.ListAPIView):
    """List products posted by current user"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Product.objects.filter(owner=self.request.user)


class ApproveProductView(APIView):
    """Approve a product (admin only)"""
    permission_classes = [IsAuthenticated, IsRoleAdmin]
    
    def post(self, request, product_id):
        try:
            product = Product.objects.get(pk=product_id)
            product.status = Product.Status.APPROVED
            product.save()
            
            send_mail(
                'Your Product Has Been Approved',
                f'Congratulations! Your product "{product.name}" has been approved and is now visible to customers.',
                settings.DEFAULT_FROM_EMAIL,
                [product.owner.email],
                fail_silently=False,
            )
            
            return Response({'message': 'Product approved successfully'}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)


class RejectProductView(APIView):
    """Reject a product (admin only)"""
    permission_classes = [IsAuthenticated, IsRoleAdmin]
    
    def post(self, request, product_id):
        try:
            product = Product.objects.get(pk=product_id)
            rejection_reason = request.data.get('rejection_reason', '')
            
            if not rejection_reason:
                return Response(
                    {'error': 'Rejection reason is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            product.status = Product.Status.REJECTED
            product.rejection_reason = rejection_reason
            product.save()
            
            send_mail(
                'Your Product Has Been Rejected',
                f'Your product "{product.name}" has been rejected.\n\nReason: {rejection_reason}\n\nPlease submit a new product with the necessary corrections.',
                settings.DEFAULT_FROM_EMAIL,
                [product.owner.email],
                fail_silently=False,
            )
            
            return Response({'message': 'Product rejected successfully'}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)


class PendingProductsView(generics.ListAPIView):
    """List pending products (admin only)"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsRoleAdmin]
    
    def get_queryset(self):
        return Product.objects.filter(status=Product.Status.PENDING)


class ProductSearchView(generics.ListAPIView):
    """Search products by name"""
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        queryset = Product.objects.filter(status=Product.Status.APPROVED)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__id=category)
        
        return queryset


# ==================== CART VIEWS ====================

class CartView(generics.RetrieveAPIView):
    """Get current user's cart"""
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart


class AddToCartView(APIView):
    """Add product to cart"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']
        
        try:
            product = Product.objects.get(pk=product_id, status=Product.Status.APPROVED)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found or not available'}, status=status.HTTP_404_NOT_FOUND)
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return Response({'message': 'Product added to cart'}, status=status.HTTP_201_CREATED)


class UpdateCartItemView(generics.UpdateAPIView):
    """Update cart item quantity"""
    serializer_class = UpdateCartItemSerializer
    permission_classes = [IsAuthenticated]
    queryset = CartItem.objects.all()
    
    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)


class RemoveCartItemView(generics.DestroyAPIView):
    """Remove item from cart"""
    permission_classes = [IsAuthenticated]
    queryset = CartItem.objects.all()
    
    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)


class ClearCartView(APIView):
    """Clear all items from cart"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            cart.items.all().delete()
            return Response({'message': 'Cart cleared'}, status=status.HTTP_204_NO_CONTENT)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)


# ==================== ORDER VIEWS ====================

class CheckoutView(APIView):
    """Process checkout and create order"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        order = Order.objects.create(
            customer=request.user,
            total_amount=cart.total
        )
        
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
        
        cart.items.all().delete()
        
        send_mail(
            f'Order Confirmation - {order.order_id}',
            f'Thank you for your order!\n\nOrder ID: {order.order_id}\nTotal Amount: KES {order.total_amount}\nStatus: {order.status}\n\nYou will receive a payment confirmation once payment is processed.',
            settings.DEFAULT_FROM_EMAIL,
            [request.user.email],
            fail_silently=False,
        )
        
        return Response({
            'message': 'Order created successfully',
            'order': OrderSerializer(order).data,
            'phone_number': serializer.validated_data['phone_number']
        }, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    """List orders"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_admin:
            return Order.objects.all()
        return Order.objects.filter(customer=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """Get order details"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()
    
    def get_queryset(self):
        if self.request.user.is_admin:
            return Order.objects.all()
        return Order.objects.filter(customer=self.request.user)


class CancelOrderView(APIView):
    """Cancel an order"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, order_id):
        try:
            order = Order.objects.get(pk=order_id, customer=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if order.status != Order.Status.PENDING:
            return Response(
                {'error': 'Only pending orders can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = Order.Status.CANCELLED
        order.save()
        
        return Response({'message': 'Order cancelled successfully'}, status=status.HTTP_200_OK)


# ==================== PAYMENT VIEWS ====================

class InitiatePaymentView(APIView):
    """Initiate Mpesa payment (Demo)"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = MpesaPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order_id = serializer.validated_data['order_id']
        phone_number = serializer.validated_data['phone_number']
        amount = serializer.validated_data['amount']
        
        try:
            order = Order.objects.get(pk=order_id, customer=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if order.status != Order.Status.PENDING:
            return Response({'error': 'Order is not pending'}, status=status.HTTP_400_BAD_REQUEST)
        
        if float(amount) != float(order.total_amount):
            return Response({'error': 'Amount does not match order total'}, status=status.HTTP_400_BAD_REQUEST)
        
        payment = Payment.objects.create(
            order=order,
            user=request.user,
            amount=amount,
            phone_number=phone_number
        )
        
        stk_simulate = self.simulate_stk_push(phone_number, amount, payment.transaction_id)
        
        if stk_simulate['success']:
            payment.status = Payment.Status.COMPLETED
            payment.mpesa_receipt_number = f"RCP{random.randint(100000, 999999)}"
            payment.save()
            
            order.status = Order.Status.PAID
            order.save()
            
            send_mail(
                'Payment Confirmed',
                f'Your payment of KES {amount} has been received.\n\nOrder ID: {order.order_id}\nTransaction ID: {payment.transaction_id}\nMpesa Receipt: {payment.mpesa_receipt_number}\n\nThank you for your purchase!',
                settings.DEFAULT_FROM_EMAIL,
                [request.user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Payment successful',
                'payment': PaymentSerializer(payment).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Payment initiated. Please complete on your phone.',
            'payment': PaymentSerializer(payment).data
        }, status=status.HTTP_202_ACCEPTED)
    
    def simulate_stk_push(self, phone_number, amount, transaction_id):
        time.sleep(1)
        success = random.random() > 0.1
        return {
            'success': success,
            'message': 'STK Push sent' if success else 'Payment failed',
            'checkout_request_id': f"WS{random.randint(100000, 999999)}"
        }


class PaymentCallbackView(APIView):
    """Mpesa payment callback (Demo)"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = request.data
        result_code = data.get('ResultCode', 0)
        
        if result_code == 0:
            checkout_request_id = data.get('CheckoutRequestID')
            
            try:
                payment = Payment.objects.filter(transaction_id=checkout_request_id).first()
                
                if payment:
                    payment.status = Payment.Status.COMPLETED
                    payment.mpesa_receipt_number = data.get('MpesaReceiptNumber', '')
                    payment.save()
                    
                    order = payment.order
                    order.status = Order.Status.PAID
                    order.save()
                    
                    return Response({'message': 'Payment processed'}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'message': 'Payment failed'}, status=status.HTTP_400_BAD_REQUEST)


class PaymentListView(generics.ListAPIView):
    """List payments"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_admin:
            return Payment.objects.all()
        return Payment.objects.filter(user=self.request.user)


class PaymentDetailView(generics.RetrieveAPIView):
    """Get payment details"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    queryset = Payment.objects.all()
    
    def get_queryset(self):
        if self.request.user.is_admin:
            return Payment.objects.all()
        return Payment.objects.filter(user=self.request.user)
