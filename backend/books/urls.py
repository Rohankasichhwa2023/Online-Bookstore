# books/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('all-books/', views.get_all_books, name='get_all_books'),
    path('book-detail/<int:pk>/', views.get_book_detail, name='get-book-detail'),
    path('add-book/', views.add_book, name='add-book'),
    path('delete-book/<int:pk>/', views.delete_book, name='delete-book'),
    path('update-book/<int:pk>/', views.update_book, name='update-book'),

    path('genres/', views.list_genres, name='list-genres'),
    path('add-favorite/', views.add_favorite, name='add-favorite'),
    path('list-favorites/', views.list_favorites, name='list-favorites'),
    path('remove-favorite/', views.remove_favorite, name='remove-favorite'),

    # **Ratings endpoints:**
    path('rate/<int:book_id>/', views.rate_book, name='rate-book'),
    path('rating/<int:book_id>/', views.get_book_rating, name='get-book-rating'),

    path('request-book/', views.request_book, name='request-book'),
]
