# books/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('add-book/', views.add_book, name='add-book'),
    path('genres/', views.list_genres, name='list-genres'),
    path('all-books/', views.get_all_books, name='get_all_books'),
    path('delete-book/<int:pk>/', views.delete_book, name='delete-book'),
    path('update-book/<int:pk>/', views.update_book, name='update-book'),
    path('add-favorite/', views.add_favorite, name='add-favorite'),
    path('list-favorites/', views.list_favorites, name='list-favorites'),
    path('remove-favorite/', views.remove_favorite, name='remove-favorite'),

]
