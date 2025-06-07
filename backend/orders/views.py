# orders/views.py

import uuid
import json
import base64
import hmac
import hashlib
from decimal import Decimal

import requests
from django.conf import settings
from django.shortcuts    import get_object_or_404, redirect
from django.utils        import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response    import Response
from rest_framework            import status

from carts.models    import Cart, CartItem
from users.models    import User, Address
from .models         import Order, OrderItem, Payment
from .serializers import OrderSerializer, AddressSerializer




@api_view(['GET'])
def list_user_orders(request):
    user_id = request.GET.get('user_id')
    if not user_id:
        return Response({"error": "user_id is required"}, status=400)
    
    orders = Order.objects.filter(user_id=user_id).order_by('-order_date')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)



# -------------------------------
# eSewa Constants and Utilities
# -------------------------------

ESEWA_UAT_SECRET_KEY = b'8gBm/:&EnhH.1/q'  # Your eSewa UAT secret (bytes)

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

# -------------------------------
# 1) Create Order (eSewa or Khalti)
# -------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):

    user_id = request.data.get('user_id')
    pay_method = request.data.get('payment_method', 'esewa').lower()

    if not user_id:
        return Response({'detail': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if pay_method not in ('esewa', 'khalti'):
        return Response({'detail': 'Invalid payment_method.'}, status=status.HTTP_400_BAD_REQUEST)

    # 1) Fetch this user's ACTIVE Cart
    try:
        user = User.objects.get(pk=int(user_id))
    except (User.DoesNotExist, ValueError):
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        cart = Cart.objects.get(user=user, status='active')
    except Cart.DoesNotExist:
        return Response({'detail': 'No active cart found for this user.'}, status=status.HTTP_400_BAD_REQUEST)

    cart_items = CartItem.objects.filter(cart=cart)
    if not cart_items.exists():
        return Response({'detail': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

    # 2) Compute total_amount (Decimal)
    total_amount = Decimal('0.00')
    for ci in cart_items:
        total_amount += (ci.price_snapshot * ci.quantity)

    # 3) Create Order
    default_address = Address.objects.filter(user=user, is_default=True).first()
    if not default_address:
        default_address = Address.objects.filter(user=user).first()
    
    order = Order.objects.create(
        user=user,
        shipping_address=default_address,
        status='pending',
        total_amount=total_amount,
        payment_method=pay_method,
        payment_status='pending',
    )

    # 4) Create OrderItem rows
    for ci in cart_items:
        OrderItem.objects.create(
            order=order,
            book=ci.book,
            quantity=ci.quantity,
            price=ci.price_snapshot,
        )

    # 5) Create Payment stub
    #    - For eSewa: generate a random transaction_id (UUID) now
    #    - For Khalti: leave transaction_id blank; we'll create the Payment after lookup
    if pay_method == 'esewa':
        random_txn = str(uuid.uuid4())
        Payment.objects.create(
            order=order,
            method='esewa',
            status='pending',
            amount=total_amount,
            transaction_id=random_txn,
        )
    else:
        # Khalti: delay creation until after lookup
        # We only need a Payment record once Khalti says "Completed"
        pass

    # 6) Mark cart as purchased + delete its items
    cart_items.delete()
    cart.status = 'purchased'
    cart.save()
    shipping_address_data = AddressSerializer(default_address).data if default_address else None
    return Response(
        {
            'order_id':     order.id,
            'total_amount': format(total_amount, '.2f'),
            'shipping_address': shipping_address_data
        },
        status=status.HTTP_201_CREATED
    )

# -------------------------------
# 2) eSewa: Provide Payment Data
# -------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def get_esewa_payment_data(request):
    """
    Returns the set of hidden fields + signature that your React
    form will submit to https://rc-epay.esewa.com.np/api/epay/main/v2/form
    """
    order_id = request.data.get('order_id')
    if not order_id:
        return Response({'detail': 'order_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        order = Order.objects.get(pk=order_id, payment_method='esewa')
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found or not set to eSewa.'}, status=status.HTTP_404_NOT_FOUND)

    # 1) Generate new UUID for this payment attempt
    transaction_uuid = str(uuid.uuid4())
    total_amount = f"{order.total_amount:.2f}"  # string like "1500.00"
    product_code = 'EPAYTEST'

    # 2) Update existing Payment stub with this new transaction_uuid
    payment = Payment.objects.filter(order=order, method='esewa').first()
    if payment:
        payment.transaction_id = transaction_uuid
        payment.save()

    # 3) Generate eSewa signature
    signature = generate_esewa_signature(total_amount, transaction_uuid, product_code)

    data = {
        "amount":                  total_amount,
        "tax_amount":              "0.00",
        "total_amount":            total_amount,
        "transaction_uuid":        transaction_uuid,
        "product_code":            product_code,
        "product_service_charge":  "0.00",
        "product_delivery_charge": "0.00",
        "success_url":             f"http://localhost:3000/payment-success/{order_id}",
        "failure_url":             f"http://localhost:3000/payment-fail/{order_id}",
        "signed_field_names":      "total_amount,transaction_uuid,product_code",
        "signature":               signature,
    }

    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def esewa_status_check(request, order_id):
    """
    (Optional) If your frontend needs to poll eSewa status,
    you can return the current payment/order status here.
    """
    order = get_object_or_404(Order, pk=order_id, payment_method='esewa')
    payment = get_object_or_404(Payment, order=order, method='esewa')

    return Response({
        'product_code':     'EPAYTEST',
        'transaction_uuid': payment.transaction_id,
        'total_amount':     str(order.total_amount),
        'status':           order.payment_status.upper(),  # 'COMPLETED' or 'PENDING'
        'ref_id':           payment.transaction_id or 'N/A'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def esewa_complete(request):
    """
    Called by eSewa on successful payment. They POST a Base64 payload.
    We decode it, verify HMAC signature, then mark payment + order as completed.
    Finally, redirect to your React success page.
    """
    try:
        encoded_body = request.body.decode('utf-8')
        decoded_json = base64.b64decode(encoded_body).decode('utf-8')
        payload = json.loads(decoded_json)
    except Exception:
        return Response({'detail': 'Invalid Base64 or JSON.'}, status=status.HTTP_400_BAD_REQUEST)

    signed_fields_str = payload.get('signed_field_names', '')
    signed_fields = signed_fields_str.split(',')

    concatenated = ','.join([f"{field}={payload.get(field, '')}" for field in signed_fields])
    received_sig = payload.get('signature', '')

    if not _verify_esewa_signature(concatenated, received_sig, ESEWA_UAT_SECRET_KEY):
        return Response({'detail': 'Signature mismatch.'}, status=status.HTTP_400_BAD_REQUEST)

    txn_uuid = payload.get('transaction_uuid')
    payment = get_object_or_404(Payment, transaction_id=txn_uuid, method='esewa')
    order = payment.order

    # Update payment and order
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
    """
    Called by eSewa on failed/canceled payment. They POST a Base64 payload.
    We decode it, find the related Payment/Order, and mark them as failed.
    Then redirect to your React failure page.
    """
    try:
        encoded_body = request.body.decode('utf-8')
        decoded_json = base64.b64decode(encoded_body).decode('utf-8')
        payload = json.loads(decoded_json)
    except Exception:
        return Response({'detail': 'Invalid Base64 or JSON.'}, status=status.HTTP_400_BAD_REQUEST)

    txn_uuid = payload.get('transaction_uuid')
    payment = get_object_or_404(Payment, transaction_id=txn_uuid, method='esewa')
    order = payment.order

    payment.status = 'failed'
    payment.save()

    order.payment_status = 'failed'
    order.status = 'cancelled'
    order.save()

    return redirect(f'/order-fail/{order.id}')

# -------------------------------
# 3) Khalti: Initiate & Verify
# -------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def initiate_khalti_payment(request):
    """
    Expects JSON: {
      "return_url": <string>,
      "purchase_order_id": <string>,
      "purchase_order_name": <string>,
      "amount": <integer_in_paisa>
    }

    Calls Khalti's /epayment/initiate/ in sandbox using your SECRET KEY,
    then returns { pidx, payment_url, expires_in, ... } back to the frontend.
    """
    data = request.data
    required = ('return_url', 'purchase_order_id', 'purchase_order_name', 'amount')
    if not all(k in data for k in required):
        return Response({'error': 'Missing one of required fields.'}, status=status.HTTP_400_BAD_REQUEST)

    payload = {
        "return_url":          data['return_url'],
        "website_url":         "http://localhost:3000",  # your React origin
        "amount":              data['amount'],
        "purchase_order_id":   data['purchase_order_id'],
        "purchase_order_name": data['purchase_order_name'],
    }

    headers = {
        "Authorization": f"Key {settings.KHALTI_SECRET_KEY}"
    }

    khalti_url = settings.KHALTI_INITIATE_URL  # e.g. "https://a.khalti.com/api/v2/epayment/initiate/"
    response = requests.post(khalti_url, json=payload, headers=headers)

    try:
        return Response(response.json(), status=response.status_code)
    except ValueError:
        return Response({'error': 'Invalid JSON response from Khalti'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_khalti_payment(request):
 
    pidx     = request.GET.get('pidx')
    order_id = request.GET.get('order_id')  # ensure your return_url included &order_id=...

    if not pidx or not order_id:
        return Response({'error': 'Missing pidx or order_id'}, status=status.HTTP_400_BAD_REQUEST)

    headers = {
        "Authorization": f"Key {settings.KHALTI_SECRET_KEY}"
    }
    lookup_url = settings.KHALTI_LOOKUP_URL  # e.g. "https://a.khalti.com/api/v2/epayment/lookup/"
    lookup_resp = requests.post(lookup_url, json={"pidx": pidx}, headers=headers)
    result = lookup_resp.json()

    if result.get('status') == 'Completed':
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        # Create the Payment record now that we have transaction_id
        Payment.objects.create(
            order=order,
            method='khalti',
            status='completed',
            amount=result['total_amount'] / 100,  # convert paisa → rupees
            transaction_id=result['transaction_id'],
            paid_at=timezone.now()
        )

        order.payment_status = 'completed'
        order.status         = 'processing'
        order.save()

        return redirect(f'http://localhost:3000/order-success/{order_id}')
    else:
         return redirect(f'http://localhost:3000/order-fail/{order_id}')


@api_view(['GET'])
@permission_classes([AllowAny])
def pay_existing_order_with_khalti(request, order_id):
    """
    When the user clicks “Pay Now” on an existing, pending Khalti order,
    redirect them to Khalti’s payment page exactly as if they had just created it.
    """
    order = get_object_or_404(Order, id=order_id, payment_method='khalti')

    # Only allow if still pending:
    if order.payment_status != 'pending':
        return Response(
            {'detail': 'Order is not pending payment.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Re‐use the same logic as initiate_khalti_payment, but using this order:
    amount_paisa = int(order.total_amount * 100)
    payload = {
      "return_url":         f"http://localhost:8000/orders/khalti/verify/?order_id={order_id}",
      "website_url":        "http://localhost:3000",
      "amount":             amount_paisa,
      "purchase_order_id":  f"order-{order_id}",
      "purchase_order_name": f"Order #{order_id}",
    }
    headers = {"Authorization": f"Key {settings.KHALTI_SECRET_KEY}"}
    response = requests.post(settings.KHALTI_INITIATE_URL, json=payload, headers=headers)

    try:
        return Response(response.json(), status=response.status_code)
    except ValueError:
        return Response({'error': 'Invalid JSON from Khalti'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
