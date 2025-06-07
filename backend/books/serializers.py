# books/serializers.py

from rest_framework import serializers
from .models import Book, Genre, BookGenre, Favorite, Rating, BookRequest

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']


class BookSerializer(serializers.ModelSerializer):
    cover_image = serializers.ImageField(use_url=True)
    genres = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'description',
            'pages',
            'language',
            'age_group',
            'price',
            'stock',
            'cover_image',
            'created_at',
            'updated_at',
            'genres',
        ]

    def get_genres(self, obj):
        qs = Genre.objects.filter(bookgenre__book=obj)
        return GenreSerializer(qs, many=True).data


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'book', 'created_at']
        read_only_fields = ['id', 'created_at']


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['id', 'user', 'book', 'rating', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']



class BookRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookRequest
        fields = ['id', 'user', 'book_name', 'book_author', 'language', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']