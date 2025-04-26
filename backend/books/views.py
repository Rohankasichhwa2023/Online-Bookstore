# books/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Book

@api_view(['POST'])
def add_book(request):
    try:
        data = request.data
        file = request.FILES.get('cover_image')

        book = Book.objects.create(
            title=data.get('title'),
            author=data.get('author'),
            description=data.get('description'),
            pages=data.get('pages'),
            language=data.get('language'),
            age_group=data.get('age_group'),
            price=data.get('price'),
            stock=data.get('stock'),
            cover_image=file
        )

        return Response({'message': 'Book added successfully!'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

