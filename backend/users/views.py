from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password
from .models import User

@api_view(['POST'])
def admin_login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username, is_admin=True)
        if (password == user.password):
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid password'}, status=status.HTTP_401_UNAUTHORIZED)

    except User.DoesNotExist:
        return Response({'error': 'Admin user not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def register_user(request):
    data = request.data
    try:
        if User.objects.filter(username=data['username']).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=data['email']).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=data['username'],
            email=data['email'],
            phone=data.get('phone', ''),
            password=data['password'],
            is_admin=False
        )
        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def login_user(request):
    data = request.data
    try:
        user = User.objects.get(username=data['username'])
        if (data['password'] == user.password):
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_admin': user.is_admin
                }
            })
        else:
            return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
