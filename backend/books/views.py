from .models import Book, Genre, BookGenre

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
def list_genres(request):
    """
    Return all genres so the frontend can render a multi-select.
    """
    genres = Genre.objects.all().values('id', 'name')
    return Response(genres, status=status.HTTP_200_OK)


@api_view(['POST'])
def add_book(request):
    try:
        data      = request.data
        file      = request.FILES.get('cover_image')
        genre_ids = data.getlist('genres')      # existing genre IDs
        new_names = data.getlist('new_genres')  # new names from frontend

        # 1) Create the Book
        book = Book.objects.create(
            title       = data.get('title'),
            author      = data.get('author'),
            description = data.get('description'),
            pages       = data.get('pages'),
            language    = data.get('language'),
            age_group   = data.get('age_group'),
            price       = data.get('price'),
            stock       = data.get('stock'),
            cover_image = file
        )

        # 2) Attach existing genres
        for gid in genre_ids:
            genre = Genre.objects.get(pk=gid)
            BookGenre.objects.create(book=book, genre=genre)

        # 3) Create & attach any new genres
        for name in new_names:
            genre, _ = Genre.objects.get_or_create(name=name.strip())
            BookGenre.objects.create(book=book, genre=genre)

        return Response({'message': 'Book added!'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

