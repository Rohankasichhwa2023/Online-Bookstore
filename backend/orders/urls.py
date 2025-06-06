# orders/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_order, name='create_order'),
    path('esewa/complete/', views.esewa_complete, name='esewa_complete'),
    path('esewa/fail/', views.esewa_fail, name='esewa_fail'),
    path('esewa/status-check/<int:order_id>/', views.esewa_status_check, name='esewa_status_check'),

    path('get-esewa-payment-data/', views.get_esewa_payment_data, name='get_esewa_payment_data'),
]
