from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .serializers import RegisterSerializer, UserSerializer
from .models import User, Wishlist
from properties.models import Property
from properties.serializers import PropertySerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upgrade_to_host(request):
    user = request.user
    if user.role == 'host':
        return Response({"detail": "Already a host."}, status=status.HTTP_400_BAD_REQUEST)
    user.role = 'host'
    user.save()
    return Response({"detail": "Successfully upgraded to host."}, status=status.HTTP_200_OK)

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def wishlist_manager(request, property_id=None):
    user = request.user
    
    if request.method == 'GET':
        wishlists = Wishlist.objects.filter(user=user)
        properties = [w.property for w in wishlists]
        serializer = PropertySerializer(properties, many=True, context={'request': request})
        return Response(serializer.data)
        
    if not property_id:
        return Response({"detail": "Property ID required."}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        property_obj = Property.objects.get(id=property_id)
    except Property.DoesNotExist:
        return Response({"detail": "Property not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        wishlist, created = Wishlist.objects.get_or_create(user=user, property=property_obj)
        if created:
            return Response({"detail": "Added to wishlist."}, status=status.HTTP_201_CREATED)
        return Response({"detail": "Already in wishlist."}, status=status.HTTP_200_OK)
        
    elif request.method == 'DELETE':
        Wishlist.objects.filter(user=user, property=property_obj).delete()
        return Response({"detail": "Removed from wishlist."}, status=status.HTTP_200_OK)
