from django.urls import path
from . import views

urlpatterns = [
    # User management
    path('admin-login/', views.admin_login_api, name='admin_login_api'),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('usersInfoEdit/<int:pk>/', views.user_detail, name='user_detail'),
    path('change-password/<int:pk>/', views.change_password, name='change_password'),
    path('addresses/',           views.addresses_list, name='addresses_list'),
    path('addresses/<int:pk>/',  views.address_detail,  name='address_detail'),
    # path('logout/', views.logout_user, name='logout_user'),
    # path('profile/<int:user_id>/', views.user_profile, name='user_profile'),
    
    # # Address
    # path('addresses/', views.address_list_create, name='address_list_create'),
    # path('addresses/<int:pk>/', views.address_detail, name='address_detail'),
    
    path(
        'notifications/',
        views.list_user_notifications,
        name='list_user_notifications'
    ),
    path(
        'notifications/<int:pk>/read/',
        views.mark_notification_read,
        name='mark_notification_read'
    ),
]
