from django.urls import path
from . import views

urlpatterns = [

    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),
    path('ratings-summary/', views.ratings_summary, name='ratings_summary'),
]