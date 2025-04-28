# books/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('add-book/', views.add_book, name='add-book'),
    path('genres/', views.list_genres, name='list-genres'),
]
