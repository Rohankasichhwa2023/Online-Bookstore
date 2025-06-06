# carts/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Cart, CartItem
from books.models import Book
from users.models import User

@api_view(['POST'])
def add_to_cart(request):
    user_id = request.data.get('user_id')
    book_id = request.data.get('book_id')
    quantity = int(request.data.get('quantity', 1))

    # 1) Validate user and book
    try:
        user = User.objects.get(pk=user_id)
        book = Book.objects.get(pk=book_id)
    except (User.DoesNotExist, Book.DoesNotExist):
        return Response({'error': 'Invalid user or book.'}, status=status.HTTP_400_BAD_REQUEST)

    # 2) Try to find an ACTIVE cart for this user
    cart = Cart.objects.filter(user=user, status='active').first()
    if not cart:
        # a) If no active cart exists, check if any cart row exists for the user
        cart = Cart.objects.filter(user=user).first()
        if cart:
            # b) Flip its status back to 'active'
            cart.status = 'active'
            cart.save()
        else:
            # c) No cart row exists at all, so create a new one
            cart = Cart.objects.create(user=user, status='active')

    # 3) Create or update the CartItem in that ACTIVE cart
    item, created = CartItem.objects.get_or_create(
        cart=cart,
        book=book,
        defaults={'quantity': quantity, 'price_snapshot': book.price}
    )
    if not created:
        item.quantity += quantity
        item.save()

    return Response({'message': 'Added to cart.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
def view_cart(request):
    user_id = request.query_params.get('user_id')
    try:
        cart = Cart.objects.get(user__pk=user_id, status='active')
    except Cart.DoesNotExist:
        return Response([], status=status.HTTP_200_OK)

    items = CartItem.objects.filter(cart=cart)
    data = []
    for item in items:
        data.append({
            'id': item.id,
            'book': {
                'id': item.book.id,
                'title': item.book.title,
                'cover_image': request.build_absolute_uri(item.book.cover_image.url)
                    if item.book.cover_image else None,
                'price_snapshot': float(item.price_snapshot),
            },
            'quantity': item.quantity,
            'subtotal': float(item.price_snapshot) * item.quantity,
        })
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
def remove_from_cart(request):
    user_id = request.data.get('user_id')
    book_id = request.data.get('book_id')

    try:
        cart = Cart.objects.get(user__pk=user_id, status='active')
        item = CartItem.objects.get(cart=cart, book__pk=book_id)
        item.delete()
        return Response({'message': 'Item removed from cart.'}, status=status.HTTP_200_OK)
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return Response({'error': 'Item not found in cart.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
def update_cart_items(request):
    user_id  = request.data.get('user_id')
    book_id  = request.data.get('book_id')
    new_qty  = int(request.data.get('quantity', 0))

    try:
        cart = Cart.objects.get(user__pk=user_id, status='active')
        item = CartItem.objects.get(cart=cart, book__pk=book_id)
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return Response({'error': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

    if new_qty <= 0:
        item.delete()
        return Response({'message': 'Item removed.'}, status=status.HTTP_200_OK)

    item.quantity = new_qty
    item.save()
    return Response({
        'message': 'Quantity updated.',
        'quantity': item.quantity,
        'subtotal': float(item.price_snapshot) * item.quantity
    }, status=status.HTTP_200_OK)
