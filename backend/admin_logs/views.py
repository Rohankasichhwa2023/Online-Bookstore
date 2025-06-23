from django.db.models import Sum, Count, F, Avg, ExpressionWrapper, FloatField
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
import os

from orders.models import Order, OrderItem
from books.models import Book, BookRequest

@api_view(['GET'])
def dashboard_stats(request):
    # total revenue from completed orders
    total_revenue = Order.objects.filter(
        payment_status='completed'
    ).aggregate(total=Sum('total_amount'))['total'] or 0

    # total books sold
    total_books_sold = OrderItem.objects.filter(
        order__status='delivered'
    ).aggregate(total=Sum('quantity'))['total'] or 0

    # pending orders
    pending_orders = Order.objects.filter(status='pending').count()

    # pending book requests
    pending_requests = BookRequest.objects.filter(status='pending').count()

    # out of stock books
    out_of_stock = Book.objects.filter(stock__lte=0).count()

    highest_rated_qs = (
        Book.objects.annotate(
            rating_count=Count('rating__rating'),
            rating_sum=Sum('rating__rating'),
        )
        .filter(rating_count__gt=0)
        .annotate(
            avgRating=ExpressionWrapper(
                F('rating_sum') / F('rating_count'),
                output_field=FloatField()
            )
        )
        .order_by('-avgRating')[:5]
        .values('id', 'title', 'avgRating', 'cover_image')
    )
    highest_rated = []
    for b in highest_rated_qs:
        if b['cover_image']:
            img_url = request.build_absolute_uri(
                os.path.join(settings.MEDIA_URL, b['cover_image'])
            )
        else:
            img_url = ''
        highest_rated.append({
            'id': b['id'],
            'title': b['title'],
            'avgRating': b['avgRating'],
            'cover_image': img_url
        })

    most_sold_qs = (
        Book.objects.annotate(
            soldCount=Sum('orderitem__quantity')
        )
        .filter(soldCount__gt=0)
        .order_by('-soldCount')[:5]
        .values('id', 'title', 'soldCount', 'cover_image')
    )
    most_sold = []
    for b in most_sold_qs:
        if b['cover_image']:
            img_url = request.build_absolute_uri(
                os.path.join(settings.MEDIA_URL, b['cover_image'])
            )
        else:
            img_url = ''
        most_sold.append({
            'id': b['id'],
            'title': b['title'],
            'soldCount': b['soldCount'],
            'cover_image': img_url
        })

    return Response({
        'totalRevenue': total_revenue,
        'totalBooksSold': total_books_sold,
        'pendingOrders': pending_orders,
        'pendingRequests': pending_requests,
        'outOfStock': out_of_stock,
        'highestRated': highest_rated,
        'mostSold': most_sold
    })

@api_view(['GET'])
def ratings_summary(request):
    books = Book.objects.annotate(
        avg_rating=Avg('rating__rating')
    ).values('id', 'title', 'avg_rating').order_by('-avg_rating')
    return Response(list(books))
