from django.http import JsonResponse
from django.db import connection
from .sql_queries import get_all_books

def get_books(request):
    with connection.cursor() as cursor:
        cursor.execute(get_all_books())
        rows = cursor.fetchall()

    books = [
        {"id": row[0], "title": row[1], "author": row[2], "price": row[3]}
        for row in rows
    ]
    return JsonResponse(books, safe=False)
