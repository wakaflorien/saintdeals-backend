# Product Image Upload Guide

## Overview

The Product module now supports multipart/form-data file uploads for product images. You can upload images directly when creating or updating products, and they will be automatically uploaded to Cloudinary.

## Creating a Product with Images

### Using cURL

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Nike Air Max 90" \
  -F "slug=nike-air-max-90" \
  -F "description=Classic Nike sneaker" \
  -F "basePrice=120.99" \
  -F "categoryId=1" \
  -F "brandId=1" \
  -F "gender=MEN" \
  -F "isFeatured=true" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg"
```

### Using Postman

1. Select **POST** method
2. Enter URL: `http://localhost:3000/products`
3. Go to **Headers** tab:
   - Add `Authorization: Bearer YOUR_JWT_TOKEN`
4. Go to **Body** tab:
   - Select **form-data**
   - Add text fields for product data:
     - `name`: Nike Air Max 90
     - `slug`: nike-air-max-90
     - `description`: Classic Nike sneaker
     - `basePrice`: 120.99
     - `categoryId`: 1
     - `brandId`: 1
     - `gender`: MEN
   - Add file fields for images:
     - Key: `images`, Type: File, Value: Select image file
     - Repeat for multiple images (up to 10)

### Using Axios (JavaScript/TypeScript)

```javascript
const formData = new FormData();

// Add product data
formData.append('name', 'Nike Air Max 90');
formData.append('slug', 'nike-air-max-90');
formData.append('description', 'Classic Nike sneaker');
formData.append('basePrice', '120.99');
formData.append('categoryId', '1');
formData.append('brandId', '1');
formData.append('gender', 'MEN');
formData.append('isFeatured', 'true');

// Add image files
const imageFiles = document.querySelector('input[type="file"]').files;
for (let i = 0; i < imageFiles.length; i++) {
  formData.append('images', imageFiles[i]);
}

// Add variants as JSON string (optional)
const variants = [
  {
    sizeId: 1,
    color: 'Black',
    colorHex: '#000000',
    stock: 50,
    price: 120.99,
    sku: 'NIKE-AM90-BLK-42',
  },
];
formData.append('variants', JSON.stringify(variants));

// Send request
const response = await axios.post('http://localhost:3000/products', formData, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  },
});
```

### Using Fetch API

```javascript
const formData = new FormData();
formData.append('name', 'Nike Air Max 90');
formData.append('slug', 'nike-air-max-90');
formData.append('basePrice', '120.99');
formData.append('categoryId', '1');
formData.append('brandId', '1');

// Add images
const imageInput = document.getElementById('productImages');
for (const file of imageInput.files) {
  formData.append('images', file);
}

const response = await fetch('http://localhost:3000/products', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const product = await response.json();
```

## Updating a Product with New Images

### Using cURL

```bash
curl -X PUT http://localhost:3000/products/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Updated Product Name" \
  -F "basePrice=129.99" \
  -F "images=@/path/to/new-image1.jpg" \
  -F "images=@/path/to/new-image2.jpg"
```

### Using Axios

```javascript
const formData = new FormData();
formData.append('name', 'Updated Product Name');
formData.append('basePrice', '129.99');

// Add new images
const newImages = document.querySelector('input[type="file"]').files;
for (let i = 0; i < newImages.length; i++) {
  formData.append('images', newImages[i]);
}

const response = await axios.put(
  `http://localhost:3000/products/${productId}`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  },
);
```

## Image Upload Details

### Specifications

- **Maximum Images**: 10 images per request
- **Supported Formats**: JPG, JPEG, PNG, GIF, WebP
- **Storage**: Cloudinary (automatic CDN distribution)
- **First Image**: Automatically set as primary image
- **Image Order**: Preserved based on upload sequence

### What Happens During Upload

1. Images are uploaded to Cloudinary
2. Secure URLs are generated
3. Images are associated with the product
4. First uploaded image is set as primary
5. Alt text is auto-generated: `{ProductName} - Image {N}`

### Response

```json
{
  "id": 1,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Nike Air Max 90",
  "slug": "nike-air-max-90",
  "basePrice": "120.99",
  "images": [
    {
      "id": 1,
      "uuid": "660e8400-e29b-41d4-a716-446655440001",
      "url": "https://res.cloudinary.com/your-cloud/image/upload/v123456/product1.jpg",
      "alt": "Nike Air Max 90 - Image 1",
      "isPrimary": true,
      "order": 0
    },
    {
      "id": 2,
      "uuid": "660e8400-e29b-41d4-a716-446655440002",
      "url": "https://res.cloudinary.com/your-cloud/image/upload/v123456/product2.jpg",
      "alt": "Nike Air Max 90 - Image 2",
      "isPrimary": false,
      "order": 1
    }
  ],
  "category": { ... },
  "brand": { ... },
  "variants": [ ... ]
}
```

## Best Practices

1. **Image Optimization**: Compress images before upload to reduce upload time
2. **Image Dimensions**: Recommended minimum 800x800px for product images
3. **File Naming**: Use descriptive names (e.g., `nike-air-max-90-front.jpg`)
4. **Multiple Images**: Upload multiple angles (front, side, back, detail shots)
5. **Primary Image**: Ensure the first image is the best representation

## Error Handling

### Common Errors

- **401 Unauthorized**: Missing or invalid JWT token
- **400 Bad Request**: Invalid product data or image format
- **409 Conflict**: Product slug already exists
- **413 Payload Too Large**: Image file size exceeds limit
- **500 Internal Server Error**: Cloudinary upload failure

### Example Error Response

```json
{
  "statusCode": 400,
  "message": "Invalid image format. Supported formats: JPG, PNG, GIF, WebP",
  "error": "Bad Request"
}
```

## Frontend Example (React)

```jsx
import { useState } from 'react';
import axios from 'axios';

function ProductUploadForm() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    basePrice: '',
    categoryId: '',
    brandId: '',
  });
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    images.forEach((image) => {
      data.append('images', image);
    });

    try {
      const response = await axios.post(
        'http://localhost:3000/products',
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      console.log('Product created:', response.data);
    } catch (error) {
      console.error('Upload failed:', error.response?.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
      />

      <button type="submit">Upload Product</button>
    </form>
  );
}
```

## Notes

- Images are uploaded sequentially to Cloudinary
- Failed image uploads will roll back the entire product creation
- Update operations append new images to existing ones
- To replace images, delete old images first, then upload new ones
- Consider implementing image deletion endpoint for complete CRUD operations
