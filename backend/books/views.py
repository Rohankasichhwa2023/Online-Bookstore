from .models import Book, Genre, BookGenre

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import BookSerializer

@api_view(['GET'])
def get_all_books(request):
    books = Book.objects.all().order_by('-created_at')
    serializer = BookSerializer(books, many=True, context={'request': request})
    return Response(serializer.data)


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


@api_view(['DELETE'])
def delete_book(request, pk):
    try:
        book = Book.objects.get(pk=pk)
        book.delete()
        return Response({'message': 'Book deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
    except Book.DoesNotExist:
        return Response({'error': 'Book not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
def update_book(request, pk):
    try:
        book = Book.objects.get(pk=pk)
        data = request.data

        # Handle cover image update
        cover_image = request.FILES.get('cover_image')
        if cover_image:
            book.cover_image = cover_image

        book.title       = data.get('title', book.title)
        book.author      = data.get('author', book.author)
        book.description = data.get('description', book.description)
        book.pages       = data.get('pages', book.pages)
        book.language    = data.get('language', book.language)
        book.age_group   = data.get('age_group', book.age_group)
        book.price       = data.get('price', book.price)
        book.stock       = data.get('stock', book.stock)
        book.save()

        # Update genres
        genre_ids = data.getlist('genres')
        new_names = data.getlist('new_genres')

        # Clear existing genres
        BookGenre.objects.filter(book=book).delete()

        # Add selected existing genres
        for gid in genre_ids:
            genre = Genre.objects.get(pk=gid)
            BookGenre.objects.create(book=book, genre=genre)

        # Add new genres
        for name in new_names:
            genre, _ = Genre.objects.get_or_create(name=name.strip())
            BookGenre.objects.create(book=book, genre=genre)

        return Response({'message': 'Book updated successfully.'})
    
    except Book.DoesNotExist:
        return Response({'error': 'Book not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
