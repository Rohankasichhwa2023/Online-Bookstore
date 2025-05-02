# books/serializers.py

from rest_framework import serializers
from .models import Book, Genre, BookGenre

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
        genres = Genre.objects.filter(bookgenre__book=obj)
        return GenreSerializer(genres, many=True).data
