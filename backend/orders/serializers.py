# orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem, Payment
from books.serializers import BookSerializer
from users.serializers import AddressSerializer, UserSerializer


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

class AdminOrderItemSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'book', 'quantity', 'price', 'created_at')

class AdminPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('method', 'status', 'amount', 'transaction_id', 'paid_at')
        
class AdminOrderSerializer(serializers.ModelSerializer):
    user    = UserSerializer(read_only=True)
    address = AddressSerializer(source='shipping_address', read_only=True)
    items   = AdminOrderItemSerializer(source='orderitem_set', many=True, read_only=True)
    payment = AdminPaymentSerializer(read_only=True)  # no `source=` since it matches the field name

    class Meta:
        model = Order
        fields = (
            'id',
            'user',
            'order_date',
            'address',
            'status',
            'total_amount',
            'payment_method',
            'payment_status',
            'created_at',
            'updated_at',
            'items',
            'payment',
        )

