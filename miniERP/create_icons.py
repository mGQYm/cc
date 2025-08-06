#!/usr/bin/env python3
import os
import base64
from PIL import Image, ImageDraw

# Create images directory
os.makedirs('/home/admin/cc/miniERP/images', exist_ok=True)

# Define colors for each icon
colors = {
    'home': (25, 118, 210),      # #1976D2
    'customers': (76, 175, 80),  # #4CAF50
    'products': (255, 152, 0),   # #FF9800
    'orders': (156, 39, 176),    # #9C27B0
    'profile': (244, 67, 54),    # #F44336
}

def create_icon(name, color, is_active=False):
    """Create a simple circular icon"""
    size = (48, 48)
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size[0] // 2
    radius = 16 if is_active else 14
    
    if is_active:
        # Active - filled circle
        draw.ellipse([
            center - radius, center - radius,
            center + radius, center + radius
        ], fill=color)
    else:
        # Inactive - outlined circle
        draw.ellipse([
            center - radius, center - radius,
            center + radius, center + radius
        ], outline=color, width=2)
    
    return img

# Create all required icons
icons = [
    ('home.png', 'home', False),
    ('home-active.png', 'home', True),
    ('customers.png', 'customers', False),
    ('customers-active.png', 'customers', True),
    ('products.png', 'products', False),
    ('products-active.png', 'products', True),
    ('orders.png', 'orders', False),
    ('orders-active.png', 'orders', True),
    ('profile.png', 'profile', False),
    ('profile-active.png', 'profile', True),
]

for filename, icon_name, is_active in icons:
    color = colors[icon_name]
    img = create_icon(icon_name, color, is_active)
    path = f'/home/admin/cc/miniERP/images/{filename}'
    img.save(path, 'PNG')
    print(f"Created: {path}")

print("All tabBar icons created successfully!")