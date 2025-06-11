# books/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.decorators import api_view
from django.db.models import Avg, Count

from django.contrib.auth import get_user_model
from .models import Book, Rating, Genre, BookGenre, Favorite, BookRequest
from .serializers import BookSerializer, FavoriteSerializer, BookRequestSerializer, FavoriteOutputSerializer
from users.models import Notification

User = get_user_model()


@api_view(['GET'])
def get_all_books(request):
    """
    GET /books/all-books/
    Returns a list of all books (no rating fields here).
    """
    books = Book.objects.all().order_by('-created_at')
    serializer = BookSerializer(books, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_book_detail(request, pk):
    """
    GET /books/book-detail/<pk>/?user_id=<int>
    Returns all Book fields + genres (via BookSerializer) plus:
      - average_rating (float)
      - rating_count (int)
      - user_rating (int or null) for that user_id
    """
    from .serializers import BookSerializer  # Import here to avoid circularity

    book = get_object_or_404(Book, pk=pk)
    book_data = BookSerializer(book, context={'request': request}).data

    # Compute average rating & count
    agg = (
        Rating.objects
        .filter(book=book)
        .aggregate(avg=Avg('rating'), count=Count('id'))
    )
    book_data['average_rating'] = round(agg['avg'], 2) if agg['avg'] else 0
    book_data['rating_count'] = agg['count']

    # If ?user_id=<…> was passed, fetch that user’s own rating (if any)
    user_id = request.query_params.get('user_id')
    if user_id is not None:
        try:
            # No need to fetch User object—just filter Rating by user_id
            user_rating_obj = Rating.objects.filter(user_id=int(user_id), book=book).first()
            book_data['user_rating'] = user_rating_obj.rating if user_rating_obj else None
        except ValueError:
            book_data['user_rating'] = None
    else:
        book_data['user_rating'] = None

    return Response(book_data, status=status.HTTP_200_OK)

    
@api_view(['GET'])
def list_genres(request):
    """
    GET /books/genres/
    Returns [{ id, name }, …] for all genres.
    """
    genres = Genre.objects.all().values('id', 'name')
    return Response(genres, status=status.HTTP_200_OK)


@api_view(['POST'])
def add_book(request):
    # … your existing add_book code …
    try:
        data      = request.data
        file      = request.FILES.get('cover_image')
        genre_ids = data.getlist('genres')      # existing genre IDs
        new_names = data.getlist('new_genres')  # new names from frontend

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

        for gid in genre_ids:
            genre = Genre.objects.get(pk=gid)
            BookGenre.objects.create(book=book, genre=genre)

        for name in new_names:
            genre, _ = Genre.objects.get_or_create(name=name.strip())
            BookGenre.objects.create(book=book, genre=genre)

        return Response({'message': 'Book added!'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_book(request, pk):
    # … your existing delete_book code …
    try:
        book = Book.objects.get(pk=pk)
        book.delete()
        return Response({'message': 'Book deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
    except Book.DoesNotExist:
        return Response({'error': 'Book not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
def update_book(request, pk):
    # … your existing update_book code …
    try:
        book = Book.objects.get(pk=pk)
        data = request.data
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

        genre_ids = data.getlist('genres')
        new_names = data.getlist('new_genres')

        BookGenre.objects.filter(book=book).delete()
        for gid in genre_ids:
            genre = Genre.objects.get(pk=gid)
            BookGenre.objects.create(book=book, genre=genre)

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
    if user_id is None or book_id is None:
        return Response(
            {"error": "Both 'user_id' and 'book_id' are required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        book = Book.objects.get(pk=book_id)
    except Book.DoesNotExist:
        return Response({"error": f"Book with id={book_id} not found."}, status=status.HTTP_404_NOT_FOUND)

    existing = Favorite.objects.filter(user_id=user_id, book_id=book_id).first()
    if existing:
        serializer = FavoriteSerializer(existing, context={'request': request})
        return Response({"message": "Already in favorites.", "favorite": serializer.data}, status=status.HTTP_200_OK)

    serializer = FavoriteSerializer(data={'user': user_id, 'book': book_id})
    if serializer.is_valid():
        fav = serializer.save()
        return Response(
            {"message": "Book added to favorites.",
             "favorite": FavoriteSerializer(fav, context={'request': request}).data},
            status=status.HTTP_201_CREATED
        )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def list_favorites(request):
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response(
            {"error": "'user_id' query parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    favorites = Favorite.objects.filter(user_id=user_id).select_related('book')
    books = [fav.book for fav in favorites]
    serializer = BookSerializer(books, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def remove_favorite(request):
    user_id = request.data.get('user_id')
    book_id = request.data.get('book_id')
    if user_id is None or book_id is None:
        return Response({"error": "Both 'user_id' and 'book_id' are required."}, status=status.HTTP_400_BAD_REQUEST)

    favorite_qs = Favorite.objects.filter(user_id=user_id, book_id=book_id)
    if not favorite_qs.exists():
        return Response({"error": "Favorite record not found."}, status=status.HTTP_404_NOT_FOUND)
    favorite_qs.delete()
    return Response({"message": "Book removed from favorites."}, status=status.HTTP_200_OK)


@api_view(['POST'])
def toggle_favorite(request):
    data = request.data
    user_id = data.get('user_id')
    book_id = data.get('book_id')
    if user_id is None or book_id is None:
        return Response(
            {"error": "Both 'user_id' and 'book_id' are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # verify book exists
    try:
        book = Book.objects.get(pk=book_id)
    except Book.DoesNotExist:
        return Response(
            {"error": f"Book with id={book_id} not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    fav_qs = Favorite.objects.filter(user_id=user_id, book_id=book_id)

    if fav_qs.exists():
        # already favorited → remove
        fav_qs.delete()
        return Response(
            {"message": "Removed from favorites.", "favorited": False},
            status=status.HTTP_200_OK
        )
    else:
        # create new favorite
        fav = Favorite.objects.create(user_id=user_id, book_id=book_id)
        return Response(
            {"message": "Added to favorites.", "favorited": True},
            status=status.HTTP_201_CREATED
        )


@api_view(['POST'])
def rate_book(request, book_id):
    """
    POST /books/rate/<book_id>/
    Body: { "user_id": <int>, "rating": <int> }
    Creates or updates a Rating for (user_id, book_id) and returns
    the updated average_rating & rating_count.
    """
    data = request.data
    user_id = data.get('user_id')
    rating_value = data.get('rating')

    # 1) Validate presence of user_id & rating
    if user_id is None or rating_value is None:
        return Response(
            {"error": "'user_id' and 'rating' are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2) Validate that rating_value is integer 1–5
    try:
        rating_value = int(rating_value)
        if rating_value < 1 or rating_value > 5:
            raise ValueError()
    except (ValueError, TypeError):
        return Response(
            {"error": "Rating must be an integer between 1 and 5."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 3) Validate that book exists
    book = get_object_or_404(Book, pk=book_id)

    # 4) Create or update Rating by setting user_id directly
    #    (this avoids User.objects.get(...) entirely)
    rating_obj, created = Rating.objects.update_or_create(
        user_id=user_id,
        book=book,
        defaults={'rating': rating_value}
    )

    # 5) Recompute average & count
    agg = (
        Rating.objects
        .filter(book=book)
        .aggregate(avg=Avg('rating'), count=Count('id'))
    )

    return Response({
        "message": "Rating submitted successfully." if created else "Rating updated successfully.",
        "average_rating": round(agg['avg'], 2) if agg['avg'] else 0,
        "rating_count": agg['count']
    })


@api_view(['GET'])
def get_book_rating(request, book_id):
    """
    GET /books/rating/<book_id>/
    Returns { average_rating, rating_count }.
    """
    book = get_object_or_404(Book, pk=book_id)
    agg = (
        Rating.objects
        .filter(book=book)
        .aggregate(avg=Avg('rating'), count=Count('id'))
    )

    return Response({
        "average_rating": round(agg['avg'], 2) if agg['avg'] else 0,
        "rating_count": agg['count']
    })


@api_view(['GET', 'POST'])
def request_book(request):

    if request.method == 'GET':
        qs = BookRequest.objects.all().order_by('-created_at')
        serializer = BookRequestSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST
    serializer = BookRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # status defaults to 'pending'
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def list_all_book_requests(request):
    requests = BookRequest.objects.select_related('user').order_by('-created_at')
    data = []
    for r in requests:
        data.append({
            'id': r.id,
            'user': {
                'id': r.user.id,
                'username': r.user.username,
                'email': r.user.email,
            },
            'book_name': r.book_name,
            'book_author': r.book_author,
            'language': r.language,
            'status': r.status,
            'created_at': r.created_at,
        })
    return Response(data, status=status.HTTP_200_OK)



@api_view(['PATCH'])
def update_book_request_status(request, pk):
    try:
        book_request = BookRequest.objects.select_related('user').get(pk=pk)
    except BookRequest.DoesNotExist:
        return Response({"detail": "Book request not found."}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    valid_statuses = dict(BookRequest.STATUS_CHOICES).keys()

    if new_status not in valid_statuses:
        return Response({"detail": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)

    # Update status manually
    book_request.status = new_status
    book_request.save()

    # Send notification to the user
    message = f"Your book request for '{book_request.book_name}' is {new_status.replace('_', ' ').title()}."
    Notification.objects.create(user=book_request.user, message=message)

    return Response({"detail": "Status updated and user notified."}, status=status.HTTP_200_OK)
