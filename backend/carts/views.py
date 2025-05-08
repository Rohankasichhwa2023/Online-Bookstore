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

    try:
        user = User.objects.get(pk=user_id)
        book = Book.objects.get(pk=book_id)
    except (User.DoesNotExist, Book.DoesNotExist):
        return Response({'error': 'Invalid user or book.'}, status=status.HTTP_400_BAD_REQUEST)

    cart, _ = Cart.objects.get_or_create(user=user)
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
        cart = Cart.objects.get(user__pk=user_id)
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
        cart = Cart.objects.get(user__pk=user_id)
        item = CartItem.objects.get(cart=cart, book__pk=book_id)
        item.delete()
        return Response({'message': 'Item removed from cart.'}, status=status.HTTP_200_OK)
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return Response({'error': 'Item not found in cart.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
def update_cart_items(request):
    """
    Expects JSON: { "user_id": X, "book_id": Y, "quantity": new_qty }
    If new_qty <= 0, the item is removed.
    """
    user_id  = request.data.get('user_id')
    book_id  = request.data.get('book_id')
    new_qty  = int(request.data.get('quantity', 0))

    try:
        cart = Cart.objects.get(user__pk=user_id)
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

