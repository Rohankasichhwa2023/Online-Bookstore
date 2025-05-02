from django.urls import path
from . import views

urlpatterns = [
    # User management
    path('admin-login/', views.admin_login_api, name='admin_login_api'),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),

    # path('logout/', views.logout_user, name='logout_user'),
    # path('profile/<int:user_id>/', views.user_profile, name='user_profile'),
    
    # # Address
    # path('addresses/', views.address_list_create, name='address_list_create'),
    # path('addresses/<int:pk>/', views.address_detail, name='address_detail'),
    
    # # Notifications
    # path('notifications/', views.notification_list, name='notification_list'),
    # path('notifications/<int:pk>/mark-read/', views.mark_notification_read, name='mark_notification_read'),
]
