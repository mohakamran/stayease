import os
import django
import random
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from properties.models import Property, PropertyImage

def seed_data():
    print("Seeding database...")

    # Create users
    print("Creating users...")
    host1, _ = User.objects.get_or_create(username='host_alice', defaults={'email': 'alice@example.com', 'role': 'host', 'first_name': 'Alice'})
    if not host1.has_usable_password():
        host1.set_password('password123')
        host1.save()

    host2, _ = User.objects.get_or_create(username='host_bob', defaults={'email': 'bob@example.com', 'role': 'host', 'first_name': 'Bob'})
    if not host2.has_usable_password():
        host2.set_password('password123')
        host2.save()
        
    guest1, _ = User.objects.get_or_create(username='guest_charlie', defaults={'email': 'charlie@example.com', 'role': 'guest', 'first_name': 'Charlie'})
    if not guest1.has_usable_password():
        guest1.set_password('password123')
        guest1.save()

    # Create properties
    print("Creating properties...")
    properties_data = [
        {
            'host': host1,
            'title': 'Luxury Villa with Private Pool',
            'description': 'Experience luxury living in this stunning villa featuring a private infinity pool, panoramic ocean views, and state-of-the-art amenities. Perfect for family getaways or romantic retreats.',
            'city': 'Bali',
            'country': 'Indonesia',
            'price_per_night': 350.00,
            'max_guests': 6,
            'amenities': ['WiFi', 'Pool', 'Air Conditioning', 'Kitchen', 'Free Parking', 'Ocean View'],
            'image_url': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'
        },
        {
            'host': host1,
            'title': 'Cozy Cabin in the Woods',
            'description': 'Unplug and unwind in this charming rustic cabin. Surrounded by nature, it offers a fireplace, hiking trails right outside the door, and absolute peace and quiet.',
            'city': 'Aspen',
            'country': 'USA',
            'price_per_night': 150.00,
            'max_guests': 4,
            'amenities': ['Fireplace', 'Heating', 'Kitchen', 'Pet Friendly'],
            'image_url': 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1065&q=80'
        },
        {
            'host': host2,
            'title': 'Modern Loft in Downtown',
            'description': 'Stay in the heart of the city in this sleek, modern loft. High ceilings, exposed brick walls, and walking distance to the best restaurants and nightlife.',
            'city': 'New York',
            'country': 'USA',
            'price_per_night': 220.00,
            'max_guests': 2,
            'amenities': ['WiFi', 'Air Conditioning', 'City Skyline View', 'Gym Access'],
            'image_url': 'https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1180&q=80'
        },
        {
            'host': host2,
            'title': 'Beachfront Paradise',
            'description': 'Step straight out of your living room onto the white sand. This beachfront property offers the ultimate relaxing vacation with stunning sunsets.',
            'city': 'Maldives',
            'country': 'Maldives',
            'price_per_night': 500.00,
            'max_guests': 8,
            'amenities': ['WiFi', 'Beach Access', 'Air Conditioning', 'Private Chef available'],
            'image_url': 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'
        }
    ]

    for p_data in properties_data:
        image_url = p_data.pop('image_url')
        prop, created = Property.objects.get_or_create(
            title=p_data['title'],
            defaults=p_data
        )
        if created:
            # We use an external URL for the image field to make it simple for the frontend
            PropertyImage.objects.create(property=prop, image=image_url, is_cover=True)

    print("Database seeding complete!")

if __name__ == '__main__':
    seed_data()
