# orders/urls.py
from django.urls import path
from . import views


urlpatterns = [
    # public/user endpoints
    path('list/',            views.list_user_orders,        name='list_user_orders'),
    path('create/',          views.create_order,            name='create_order'),
    path('esewa/complete/',  views.esewa_complete,          name='esewa_complete'),
    path('esewa/fail/',      views.esewa_fail,              name='esewa_fail'),
    path('esewa/status-check/<int:order_id>/', views.esewa_status_check, name='esewa_status_check'),
    path('get-esewa-payment-data/', views.get_esewa_payment_data, name='get_esewa_payment_data'),
    path('khalti/initiate/', views.initiate_khalti_payment, name='khalti_initiate'),
    path('khalti/verify/',   views.verify_khalti_payment,   name='khalti_verify'),
    path('khalti/pay-now/<int:order_id>/', views.pay_existing_order_with_khalti, name='khalti_pay_now'),

    # admin endpoints
    path(
        'admin/orders/',
        views.admin_list_all_orders,
        name='admin_list_all_orders'
    ),
    # Get a single order by its ID
    path(
        'admin/orders/<int:order_id>/',
        views.admin_get_order,
        name='admin_get_order'
    ),
    # Update status (expects user_id + status in body)
    path(
        'admin/orders/<int:order_id>/status/',
        views.admin_update_status,
        name='admin_update_status'
    ),

    
]
