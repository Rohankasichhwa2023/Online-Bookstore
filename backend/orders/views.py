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

from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response    import Response
from rest_framework            import status, viewsets

from carts.models    import Cart, CartItem
from users.models    import User, Address, Notification
from .models         import Order, OrderItem, Payment
from .serializers import OrderSerializer, AddressSerializer, AdminOrderSerializer




@api_view(['GET'])
def list_user_orders(request):
    user_id = request.GET.get('user_id')
    if not user_id:
        return Response({"error": "user_id is required"}, status=400)
    
    orders = Order.objects.filter(user_id=user_id).order_by('-order_date')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)



# -------------------------------
# 1) Create Order (eSewa or Khalti)
# -------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    """
    POST /orders/create/
    Creates an order with payment_method which may be 'pending', 'esewa', or 'khalti'.
    """
    user_id = request.data.get('user_id')
    pay_method = request.data.get('payment_method', 'pending').lower()

    # allow pending, esewa, khalti
    if not user_id:
        return Response({'detail': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if pay_method not in ('pending', 'esewa', 'khalti'):
        return Response({'detail': 'Invalid payment_method.'}, status=status.HTTP_400_BAD_REQUEST)

    # Fetch user and active cart
    try:
        user = User.objects.get(pk=int(user_id))
    except (User.DoesNotExist, ValueError):
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        cart = Cart.objects.get(user=user, status='active')
    except Cart.DoesNotExist:
        return Response({'detail': 'No active cart found.'}, status=status.HTTP_400_BAD_REQUEST)

    cart_items = CartItem.objects.filter(cart=cart)
    if not cart_items.exists():
        return Response({'detail': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

    # compute total_amount
    total_amount = Decimal('0.00')
    for ci in cart_items:
        total_amount += ci.price_snapshot * ci.quantity

    # select default address
    default_address = Address.objects.filter(user=user, is_default=True).first() or Address.objects.filter(user=user).first()

    # create the order record
    order = Order.objects.create(
        user=user,
        shipping_address=default_address,
        status='pending',
        total_amount=total_amount,
        payment_method=pay_method,
        payment_status='pending',
    )

    # create order items
    for ci in cart_items:
        OrderItem.objects.create(
            order=order,
            book=ci.book,
            quantity=ci.quantity,
            price=ci.price_snapshot
        )

    # create payment stub only if esewa
    if pay_method == 'esewa':
        random_txn = str(uuid.uuid4())
        Payment.objects.create(
            order=order,
            method='esewa',
            status='pending',
            amount=total_amount,
            transaction_id=random_txn
        )
    # for khalti and pending, defer payment creation until later

    # mark cart purchased
    cart_items.delete()
    cart.status = 'purchased'
    cart.save()

    # respond with order details
    shipping_address_data = AddressSerializer(default_address).data if default_address else None
    return Response({
        'order_id': order.id,
        'total_amount': f'{total_amount:.2f}',
        'shipping_address': shipping_address_data
    }, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_order_address(request, order_id):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({"error": "user_id is required"}, status=400)

    try:
        user = User.objects.get(pk=int(user_id))
        order = Order.objects.get(pk=order_id, user=user, status='pending')
    except (User.DoesNotExist, Order.DoesNotExist):
        return Response({"error": "Pending order not found."},
                        status=status.HTTP_404_NOT_FOUND)

    default_addr = Address.objects.filter(user=user, is_default=True).first()
    if not default_addr:
        return Response({"error": "No default address found."}, status=400)

    order.shipping_address = default_addr
    order.save()
    return Response(OrderSerializer(order).data, status=200)

# -------------------------------
# 2) eSewa: Provide Payment Data
# -------------------------------

ESEWA_UAT_SECRET_KEY = b'8gBm/:&EnhH.1/q'

def generate_esewa_signature(total_amount: str, transaction_uuid: str, product_code: str) -> str:
    signing = f'total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}'
    mac = hmac.new(ESEWA_UAT_SECRET_KEY, signing.encode(), hashlib.sha256).digest()
    return base64.b64encode(mac).decode()

def verify_esewa_signature(signed_str: str, recv_sig: str) -> bool:
    mac = hmac.new(ESEWA_UAT_SECRET_KEY, signed_str.encode(), hashlib.sha256).digest()
    return hmac.compare_digest(base64.b64encode(mac).decode(), recv_sig)

@api_view(['POST'])
@permission_classes([AllowAny])
def get_esewa_payment_data(request):
    order_id = request.data.get('order_id')
    if not order_id:
        return Response({'detail': 'order_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    order = get_object_or_404(Order, pk=order_id, status='pending')
    order.payment_method = 'esewa'; order.save(update_fields=['payment_method'])

    txn_uuid = str(uuid.uuid4())
    amt      = f"{order.total_amount:.2f}"
    code     = 'EPAYTEST'

    payment, created = Payment.objects.get_or_create(
        order=order, method='esewa',
        defaults={'status':'pending','amount':order.total_amount,'transaction_id':txn_uuid}
    )
    if not created:
        payment.transaction_id = txn_uuid
        payment.save(update_fields=['transaction_id'])

    sig = generate_esewa_signature(amt, txn_uuid, code)

    BE = settings.BACKEND_BASE_URL.rstrip('/')  # e.g. "http://localhost:8000"
    data = {
      "amount":                  amt,
      "tax_amount":              "0.00",
      "total_amount":            amt,
      "transaction_uuid":        txn_uuid,
      "product_code":            code,
      "product_service_charge":  "0.00",
      "product_delivery_charge": "0.00",
      # now using path-param URLs:
      "success_url": f"{BE}/orders/esewa/complete/{order.id}/",
      "failure_url": f"{BE}/orders/esewa/fail/{order.id}/",
      "signed_field_names":      "total_amount,transaction_uuid,product_code",
      "signature":               sig,
    }
    return Response(data)


@api_view(['GET','POST'])
@permission_classes([AllowAny])
def esewa_complete(request, order_id):
    """
    Handle eSewa success. Accept both POST (real callback) & GET (for manual testing).
    """
    # extract the Base64 payload from POST body or GET ?data=
    if request.method == 'POST':
        raw = request.body.decode()
    else:
        raw = request.GET.get('data','')
    try:
        decoded = base64.b64decode(raw).decode()
        payload = json.loads(decoded)
    except:
        return Response({'detail':'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)

    fields = payload.get('signed_field_names','').split(',')
    concat = ','.join(f"{f}={payload.get(f,'')}" for f in fields)
    if not verify_esewa_signature(concat, payload.get('signature','')):
        return Response({'detail':'Signature mismatch'}, status=status.HTTP_400_BAD_REQUEST)

    payment = get_object_or_404(Payment, transaction_id=payload.get('transaction_uuid',''), method='esewa')
    order = payment.order

    payment.transaction_id = payload.get('transaction_code', payment.transaction_id)
    payment.status = 'completed'
    payment.paid_at = timezone.now()
    payment.save()

    order.payment_status = 'completed'
    order.status         = 'processing'
    order.save()

    # redirect back to React
    return redirect(f"{settings.FRONTEND_BASE_URL}/payment-success/{order.id}")


@api_view(['GET','POST'])
@permission_classes([AllowAny])
def esewa_fail(request, order_id):
    """Handle eSewa failure/cancel; same dual-method support."""
    if request.method == 'POST':
        raw = request.body.decode()
    else:
        raw = request.GET.get('data','')
    try:
        decoded = base64.b64decode(raw).decode()
        payload = json.loads(decoded)
    except:
        return Response({'detail':'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)

    payment = get_object_or_404(Payment, transaction_id=payload.get('transaction_uuid',''), method='esewa')
    order = payment.order

    payment.status = 'failed'; payment.save()
    order.payment_status = 'failed'
    order.status         = 'cancelled'
    order.save()

    return redirect(f"{settings.FRONTEND_BASE_URL}/payment-fail/{order.id}")

@api_view(['GET'])
@permission_classes([AllowAny])
def esewa_status_check(request, order_id):
    order = get_object_or_404(Order, pk=order_id, payment_method='esewa')
    payment = get_object_or_404(Payment, order=order, method='esewa')
    return Response({
        "product_code":     "EPAYTEST",
        "transaction_uuid": payment.transaction_id,
        "total_amount":     float(order.total_amount),
        "status":           order.payment_status.upper(),  # COMPLETED, PENDING, etc.
        "ref_id":           payment.transaction_id or ""
    })
    


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

    try:
        order = Order.objects.get(pk=data['order_id'], status='pending')
    except Order.DoesNotExist:
        return Response({'error':'Order not found or not pending.'}, status=status.HTTP_404_NOT_FOUND)

    order.payment_method = 'khalti'
    order.save(update_fields=['payment_method'])

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
    order = get_object_or_404(Order, id=order_id, payment_method='pending')

    # Only allow if still pending:
    if order.payment_status != 'pending':
        return Response(
            {'detail': 'Order is not pending payment.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    order.payment_method = 'khalti'
    order.save(update_fields=['payment_method'])

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



@api_view(['GET'])
def admin_list_all_orders(request):
    user_id = request.GET.get('user_id')
    if not user_id:
        return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    admin_user = get_object_or_404(User, pk=user_id)
    if not admin_user.is_admin:
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    orders = Order.objects.all().order_by('-order_date')
    serializer = AdminOrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def admin_get_order(request, order_id):
    user_id = request.GET.get('user_id')
    if not user_id:
        return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    admin_user = get_object_or_404(User, pk=user_id)
    if not admin_user.is_admin:
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    order = get_object_or_404(Order, pk=order_id)
    serializer = AdminOrderSerializer(order)
    return Response(serializer.data)


@api_view(['PATCH'])
def admin_update_status(request, order_id):
    
    user_id   = request.data.get('user_id')
    new_status = request.data.get('status')

    if not user_id or not new_status:
        return Response(
            {'detail': 'user_id and status are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 1) Check admin privileges
    admin = get_object_or_404(User, pk=user_id)
    if not admin.is_admin:
        return Response({'detail': 'Permission denied.'},
                        status=status.HTTP_403_FORBIDDEN)

    # 2) Fetch and update the order
    order = get_object_or_404(Order, pk=order_id)
    if new_status not in dict(order.STATUS_CHOICES):
        return Response(
            {'detail': f'Invalid status "{new_status}".'},
            status=status.HTTP_400_BAD_REQUEST
        )

    order.status = new_status
    order.save(update_fields=['status','updated_at'])

    # Decrement stock when delivered
    if new_status == 'delivered':
        for item in order.orderitem_set.select_related('book').all():
            book = item.book
            book.stock = max(0, book.stock - item.quantity)
            book.save(update_fields=['stock'])

    # 3) Build notification message
    #    Gather all product (book) names on this order
    items = order.orderitem_set.select_related('book').all()
    product_list = ", ".join(item.book.title for item in items)
    message = (
        f"Your order #{order.id} of {product_list} "
        f"is now {new_status}."
    )

    # 4) Create the Notification record
    Notification.objects.create(
        user=order.user,
        message=message
    )

    # 5) Return the updated order
    serializer = AdminOrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)


