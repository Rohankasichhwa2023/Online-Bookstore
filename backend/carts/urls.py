from django.urls import path
from . import views

urlpatterns = [
    path('add-to-cart/', views.add_to_cart, name='add-to-cart'),
    path('view-cart/', views.view_cart, name='view-cart'),
    path('removeitem-cart/', views.remove_from_cart, name='removeitem-cart'),
    path('update-item/',    views.update_cart_items, name='update-item'),
]
