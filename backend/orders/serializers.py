# orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem
from books.serializers import BookSerializer
from users.serializers import AddressSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    book = BookSerializer()

    class Meta:
        model = OrderItem
        fields = ['book', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    address = AddressSerializer(source='shipping_address', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_date',
            'status',
            'total_amount',
            'payment_method',
            'payment_status',
            'address',
            'items'
        ]

    def get_items(self, obj):
        order_items = OrderItem.objects.filter(order=obj)
        return OrderItemSerializer(order_items, many=True).data

