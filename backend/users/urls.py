from django.urls import path
from .views import admin_login_api

urlpatterns = [
    # User management
    # path('register/', views.register_user, name='register_user'),
    path('admin-login/', admin_login_api, name='admin_login_api'),
    # path('login/', views.login_user, name='login_user'),
    # path('logout/', views.logout_user, name='logout_user'),
    # path('profile/<int:user_id>/', views.user_profile, name='user_profile'),
    
    # # Address
    # path('addresses/', views.address_list_create, name='address_list_create'),
    # path('addresses/<int:pk>/', views.address_detail, name='address_detail'),
    
    # # Notifications
    # path('notifications/', views.notification_list, name='notification_list'),
    # path('notifications/<int:pk>/mark-read/', views.mark_notification_read, name='mark_notification_read'),
]
