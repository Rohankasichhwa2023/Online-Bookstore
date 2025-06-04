from .models import Book, Genre, BookGenre, Favorite

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status
from .serializers import BookSerializer, FavoriteSerializer

@api_view(['GET'])
def get_all_books(request):
    books = Book.objects.all().order_by('-created_at')
    serializer = BookSerializer(books, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def get_book_detail(request, pk):
    book = get_object_or_404(Book, pk=pk)
    serializer = BookSerializer(book, context={'request': request})
    
    return Response(serializer.data, status=status.HTTP_200_OK)

    

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


@api_view(['POST'])
def add_favorite(request):
    data = request.data
    user_id = data.get('user_id')
    book_id = data.get('book_id')

    # 1) Validate presence of user_id and book_id
    if user_id is None or book_id is None:
        return Response(
            {"error": "Both 'user_id' and 'book_id' are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2) Check that the Book actually exists
    try:
        book = Book.objects.get(pk=book_id)
    except Book.DoesNotExist:
        return Response(
            {"error": f"Book with id={book_id} not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # 3) Check if a Favorite row for (user_id, book_id) already exists
    existing = Favorite.objects.filter(user_id=user_id, book_id=book_id).first()
    if existing:
        # Already favorited → return 200 OK with a message
        serializer = FavoriteSerializer(existing, context={'request': request})
        return Response(
            {"message": "Already in favorites.", "favorite": serializer.data},
            status=status.HTTP_200_OK
        )

    # 4) Create a new Favorite
    serializer = FavoriteSerializer(data={'user': user_id, 'book': book_id})
    if serializer.is_valid():
        fav = serializer.save()
        return Response(
            {"message": "Book added to favorites.", "favorite": FavoriteSerializer(fav, context={'request': request}).data},
            status=status.HTTP_201_CREATED
        )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def list_favorites(request):
    """
    GET /books/list-favorites/?user_id=<int>
    Returns a list of Book objects that the given user has favorited.
    """
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response(
            {"error": "'user_id' query parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Retrieve all Favorite rows for this user, then extract the related Book
    favorites = Favorite.objects.filter(user_id=user_id).select_related('book')
    books = [fav.book for fav in favorites]

    serializer = BookSerializer(books, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def remove_favorite(request):
    """
    POST /books/remove-favorite/
    Expects JSON:
        {
          "user_id": <int>,
          "book_id": <int>
        }
    Deletes the corresponding Favorite row (if it exists) and returns a message.
    """
    user_id = request.data.get('user_id')
    book_id = request.data.get('book_id')

    if user_id is None or book_id is None:
        return Response(
            {"error": "Both 'user_id' and 'book_id' are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Try to find the Favorite row
    favorite_qs = Favorite.objects.filter(user_id=user_id, book_id=book_id)
    if not favorite_qs.exists():
        return Response(
            {"error": "Favorite record not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Delete it
    favorite_qs.delete()
    return Response(
        {"message": "Book removed from favorites."},
        status=status.HTTP_200_OK
    )