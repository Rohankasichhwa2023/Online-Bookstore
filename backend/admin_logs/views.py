from django.db.models import Sum, Count, F, Avg, ExpressionWrapper, FloatField
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from orders.models import Order, OrderItem
from books.models import Book, Rating, BookRequest

@api_view(['GET'])
def dashboard_stats(request):
    # total revenue from completed orders
    total_revenue = Order.objects.filter(payment_status='completed').aggregate(
        total=Sum('total_amount')
    )['total'] or 0

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

    # highest rated books (top 5)
    highest_rated = (
        Book.objects.annotate(
            rating_count=Count('rating__rating'),
            rating_sum=Sum('rating__rating'),
        )
        .filter(rating_count__gt=0)  # ✅ exclude books with no ratings
        .annotate(
            avgRating=ExpressionWrapper(
                F('rating_sum') / F('rating_count'),
                output_field=FloatField()
            )
        )
        .order_by('-avgRating')[:5]
        .values('id', 'title', 'avgRating')
    )

    # most sold books (top 5)
    most_sold = (
        Book.objects.annotate(
            soldCount=Sum('orderitem__quantity')
        )
        .filter(soldCount__gt=0)
        .order_by('-soldCount')[:5]
        .values('id', 'title', 'soldCount')
    )

    return Response({
        'totalRevenue': total_revenue,
        'totalBooksSold': total_books_sold,
        'pendingOrders': pending_orders,
        'pendingRequests': pending_requests,
        'outOfStock': out_of_stock,
        'highestRated': list(highest_rated),
        'mostSold': list(most_sold),
    })

@api_view(['GET'])
def ratings_summary(request):
    books = Book.objects.annotate(avg_rating=Avg('rating__rating')).values('id', 'title', 'avg_rating').order_by('-avg_rating')
    return Response(list(books))