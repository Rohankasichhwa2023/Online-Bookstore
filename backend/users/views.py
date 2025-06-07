from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password
from .models import User, Address
from .serializers import UserSerializer, AddressSerializer

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


@api_view(['GET', 'PUT'])
def user_detail(request, pk):
 
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # PUT: partial update
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def change_password(request, pk):
 
    data = request.data
    current = data.get('current_password')
    new     = data.get('new_password')

    if current is None or new is None:
        return Response(
            {'error': 'Both current_password and new_password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Validate current password
    if current != user.password:
        return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_401_UNAUTHORIZED)

    # Update to new password
    user.password = new
    user.save()

    return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def addresses_list(request):
  
    if request.method == 'GET':
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        qs = Address.objects.filter(user_id=user_id).order_by('-is_default','-updated_at')
        return Response(AddressSerializer(qs, many=True).data)

    # POST: create new
    serializer = AddressSerializer(data=request.data)
    if serializer.is_valid():
        # if new address is_default, unset old defaults
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user_id=serializer.validated_data['user'].id).update(is_default=False)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
def address_detail(request, pk):

    try:
        addr = Address.objects.get(pk=pk)
    except Address.DoesNotExist:
        return Response({'error': 'Address not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        addr.delete()
        return Response({'message': 'Address deleted.'}, status=status.HTTP_200_OK)

    # PUT: update partial
    serializer = AddressSerializer(addr, data=request.data, partial=True)
    if serializer.is_valid():
        # if marking default, unset others
        if serializer.validated_data.get('is_default') is True:
            Address.objects.filter(user_id=addr.user_id).update(is_default=False)
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
