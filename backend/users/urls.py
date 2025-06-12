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
    path('non-admins/', views.non_admin_users, name='non-admin-users'),

    
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
