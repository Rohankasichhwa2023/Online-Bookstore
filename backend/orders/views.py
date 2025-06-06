# orders/views.py

import uuid
import json
import base64
import hmac
import hashlib
from decimal import Decimal

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import get_object_or_404, redirect
from django.utils import timezone

from carts.models import Cart, CartItem
from users.models import User, Address
from .models import Order, OrderItem, Payment

ESEWA_UAT_SECRET_KEY = b'8gBm/:&EnhH.1/q'  # Your secret key (bytes)

def generate_esewa_signature(total_amount: str, transaction_uuid: str, product_code: str) -> str:
    """
    Generate HMAC SHA256 Base64 signature for eSewa payment form.
    The signing string format must exactly match what eSewa expects.
    """
    signing_string = f'total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}'
    mac = hmac.new(ESEWA_UAT_SECRET_KEY, signing_string.encode('utf-8'), hashlib.sha256).digest()
    signature = base64.b64encode(mac).decode('utf-8')
    return signature

def _verify_esewa_signature(signed_str: str, received_sig: str, secret_key: bytes) -> bool:
    mac = hmac.new(secret_key, signed_str.encode('utf-8'), hashlib.sha256).digest()
    expected_sig = base64.b64encode(mac).decode('utf-8')
    return hmac.compare_digest(expected_sig, received_sig)

@api_view(['POST'])
@permission_classes([AllowAny])
def get_esewa_payment_data(request):
    order_id = request.data.get('order_id')
    if not order_id:
        return Response({'detail': 'order_id is required'}, status=400)

    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=404)

    # Generate new UUID for this payment attempt
    transaction_uuid = str(uuid.uuid4())
    total_amount = f"{order.total_amount:.2f}"
    product_code = 'EPAYTEST'

    # Update payment record
    payment = Payment.objects.filter(order=order).first()
    if payment:
        payment.transaction_id = transaction_uuid
        payment.save()

    signature = generate_esewa_signature(total_amount, transaction_uuid, product_code)

    data = {
        "amount": total_amount,
        "tax_amount": "0.00",
        "total_amount": total_amount,
        "transaction_uuid": transaction_uuid,
        "product_code": product_code,
        "product_service_charge": "0.00",
        "product_delivery_charge": "0.00",
        "success_url": f"http://localhost:3000/payment-success/{order_id}",
        "failure_url": f"http://localhost:3000/payment-fail/{order_id}",
        "signed_field_names": "total_amount,transaction_uuid,product_code",
        "signature": signature,
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def esewa_status_check(request, order_id):
    order = get_object_or_404(Order, pk=order_id)
    payment = get_object_or_404(Payment, order=order)

    return Response({
        'product_code': 'EPAYTEST',
        'transaction_uuid': str(order.id),
        'total_amount': str(order.total_amount),
        'status': order.payment_status.upper(),  # completed → COMPLETED
        'ref_id': payment.transaction_id or 'N/A'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    """
    Expects JSON: { "user_id": <int> }.
    - Finds the ACTIVE cart (status='active') for that user.
    - Processes it, then marks it 'purchased'.
    - Does NOT attempt to create a new Cart row.
    """
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'detail': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(pk=int(user_id))
    except (User.DoesNotExist, ValueError):
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    # 1) Fetch this user's ACTIVE Cart
    try:
        cart = Cart.objects.get(user=user, status='active')
    except Cart.DoesNotExist:
        return Response({'detail': 'No active cart found for this user.'}, status=status.HTTP_400_BAD_REQUEST)

    cart_items = CartItem.objects.filter(cart=cart)
    if not cart_items.exists():
        return Response({'detail': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

    # 2) Compute total_amount
    total_amount = Decimal('0.00')
    for ci in cart_items:
        total_amount += (ci.price_snapshot * ci.quantity)

    # 3) Create Order
    default_address = Address.objects.filter(user=user, is_default=True).first()
    order = Order.objects.create(
        user=user,
        shipping_address=default_address,
        status='pending',
        total_amount=total_amount,
        payment_method='esewa',
        payment_status='pending',
    )

    # 4) Create OrderItem records
    for ci in cart_items:
        OrderItem.objects.create(
            order=order,
            book=ci.book,
            quantity=ci.quantity,
            price=ci.price_snapshot,
        )

    # 5) Create Payment stub
    random_txn = str(uuid.uuid4())
    Payment.objects.create(
        order=order,
        method='esewa',
        status='pending',
        amount=total_amount,
        transaction_id=random_txn,
    )

    # 6) Mark the existing cart as 'purchased' and delete its items
    cart_items.delete()
    cart.status = 'purchased'
    cart.save()

    # DO NOT create a new Cart row here (OneToOneField forbids it).
    # Instead, next time the user calls add_to_cart, the add_to_cart logic
    # (above) will flip this same cart back to 'active' if needed.

    return Response(
        {
            'order_id': order.id,
            'total_amount': format(total_amount, '.2f')
        },
        status=status.HTTP_201_CREATED
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def esewa_complete(request):
    # (unchanged from before)
    try:
        encoded_body = request.body.decode('utf-8')
        decoded_json = base64.b64decode(encoded_body).decode('utf-8')
        payload = json.loads(decoded_json)
    except Exception:
        return Response({'detail': 'Invalid Base64 or JSON.'}, status=status.HTTP_400_BAD_REQUEST)

    signed_fields_str = payload.get('signed_field_names', '')
    signed_fields = signed_fields_str.split(',')
    concatenated = ''.join([payload.get(field, '') for field in signed_fields])

    received_sig = payload.get('signature', '')
    if not _verify_esewa_signature(concatenated, received_sig, ESEWA_UAT_SECRET_KEY):
        return Response({'detail': 'Signature mismatch.'}, status=status.HTTP_400_BAD_REQUEST)

    txn_uuid = payload.get('transaction_uuid')
    payment = get_object_or_404(Payment, transaction_id=txn_uuid)
    order = payment.order

    payment = get_object_or_404(Payment, order=order)
    payment.transaction_id = payload.get('transaction_code', payment.transaction_id)
    payment.status = 'completed'
    payment.paid_at = timezone.now()
    payment.save()

    order.payment_status = 'completed'
    order.status = 'processing'
    order.save()

    return redirect(f'/order-success/{order.id}')

@api_view(['POST'])
@permission_classes([AllowAny])
def esewa_fail(request):
    # (unchanged from before)
    try:
        encoded_body = request.body.decode('utf-8')
        decoded_json = base64.b64decode(encoded_body).decode('utf-8')
        payload = json.loads(decoded_json)
    except Exception:
        return Response({'detail': 'Invalid Base64 or JSON.'}, status=status.HTTP_400_BAD_REQUEST)

    txn_uuid = payload.get('transaction_uuid')
    order = get_object_or_404(Order, pk=txn_uuid)

    payment = get_object_or_404(Payment, order=order)
    payment.status = 'failed'
    payment.save()

    order.payment_status = 'failed'
    order.status = 'cancelled'
    order.save()

    return redirect(f'/order-fail/{order.id}')
