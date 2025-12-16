import { PrismaClient, UserRole, Gender, ShoeSize } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================
  // 1. CLEAN UP EXISTING DATA (Optional - comment out if you want to keep existing data)
  // ============================================
  console.log('🧹 Cleaning up existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.size.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // ============================================
  // 2. CREATE USERS
  // ============================================
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@saintdeals.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
      phone: '+1234567890',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@saintdeals.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
      phone: '+1234567891',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
      emailVerified: true,
      phone: '+1234567892',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.CUSTOMER,
      emailVerified: true,
      phone: '+1234567893',
    },
  });

  console.log(`✅ Created ${4} users`);

  // ============================================
  // 3. CREATE CATEGORIES
  // ============================================
  console.log('📁 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Sneakers',
        slug: 'sneakers',
        description: 'Casual and athletic sneakers for everyday wear',
        image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Running Shoes',
        slug: 'running-shoes',
        description: 'High-performance running shoes for athletes',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Boots',
        slug: 'boots',
        description: 'Durable boots for all seasons',
        image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sandals',
        slug: 'sandals',
        description: 'Comfortable sandals for warm weather',
        image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Formal Shoes',
        slug: 'formal-shoes',
        description: 'Elegant shoes for formal occasions',
        image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Basketball Shoes',
        slug: 'basketball-shoes',
        description: 'High-top basketball shoes for court performance',
        image: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // ============================================
  // 4. CREATE BRANDS
  // ============================================
  console.log('🏢 Creating brands...');
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Nike',
        slug: 'nike',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
        description: 'Just Do It - Leading athletic footwear and apparel brand',
        isActive: true,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Adidas',
        slug: 'adidas',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
        description: 'Impossible is Nothing - German sportswear manufacturer',
        isActive: true,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Puma',
        slug: 'puma',
        logo: 'https://upload.wikimedia.org/wikipedia/en/d/da/Puma_complete_logo.svg',
        description: 'Forever Faster - Athletic and casual footwear',
        isActive: true,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'New Balance',
        slug: 'new-balance',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg',
        description: 'Endorsed by No One - Premium athletic footwear',
        isActive: true,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Converse',
        slug: 'converse',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Converse_logo.svg',
        description: 'Classic American footwear brand',
        isActive: true,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Vans',
        slug: 'vans',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Vans-logo.svg',
        description: 'Off The Wall - Skateboarding and lifestyle shoes',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${brands.length} brands`);

  // ============================================
  // 5. CREATE SIZES
  // ============================================
  console.log('📏 Creating sizes...');
  const sizesData = [
    // Adult sizes (most common range)
    { sizeValue: ShoeSize.EU_35, displayValue: '35 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_35_5, displayValue: '35.5 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_36, displayValue: '36 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_36_5, displayValue: '36.5 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_37, displayValue: '37 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_37_5, displayValue: '37.5 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_38, displayValue: '38 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_38_5, displayValue: '38.5 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_39, displayValue: '39 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_39_5, displayValue: '39.5 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_40, displayValue: '40 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_40_5, displayValue: '40.5 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_41, displayValue: '41 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_41_5, displayValue: '41.5 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_42, displayValue: '42 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_42_5, displayValue: '42.5 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_43, displayValue: '43 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_43_5, displayValue: '43.5 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_44, displayValue: '44 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_44_5, displayValue: '44.5 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_45, displayValue: '45 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_45_5, displayValue: '45.5 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_46, displayValue: '46 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_46_5, displayValue: '46.5 EU', system: 'EU' },
    { sizeValue: ShoeSize.EU_47, displayValue: '47 EU', system: 'EU' },
  ];

  const sizes = await Promise.all(
    sizesData.map((size) =>
      prisma.size.create({
        data: size,
      }),
    ),
  );

  console.log(`✅ Created ${sizes.length} sizes`);

  // ============================================
  // 6. CREATE PRODUCTS WITH VARIANTS AND IMAGES
  // ============================================
  console.log('👟 Creating products...');

  // Product 1: Nike Air Max 90
  const nikeAirMax90 = await prisma.product.create({
    data: {
      name: 'Nike Air Max 90',
      slug: 'nike-air-max-90',
      description:
        'The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle outsole, stitched overlays and classic TPU accents. Classic colors celebrate your fresh look while Max Air cushioning adds comfort to the journey.',
      basePrice: 129.99,
      categoryId: categories[0].id, // Sneakers
      brandId: brands[0].id, // Nike
      gender: Gender.UNISEX,
      upperMaterial: 'Leather and Mesh',
      soleMaterial: 'Rubber',
      heelHeight: 3.5,
      closureType: 'Laces',
      isFeatured: true,
      isActive: true,
      metaTitle: 'Nike Air Max 90 - Classic Sneakers | SaintDeals',
      metaDescription:
        'Shop the iconic Nike Air Max 90 sneakers with Max Air cushioning and classic design. Available in multiple colors and sizes.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
            alt: 'Nike Air Max 90 - Front View',
            isPrimary: true,
            order: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2',
            alt: 'Nike Air Max 90 - Side View',
            isPrimary: false,
            order: 1,
          },
          {
            url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772',
            alt: 'Nike Air Max 90 - Detail View',
            isPrimary: false,
            order: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_40)!.id,
            color: 'White/Black',
            colorHex: '#FFFFFF',
            stock: 25,
            price: 129.99,
            sku: 'NIKE-AM90-WHT-40',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_41)!.id,
            color: 'White/Black',
            colorHex: '#FFFFFF',
            stock: 30,
            price: 129.99,
            sku: 'NIKE-AM90-WHT-41',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_42)!.id,
            color: 'White/Black',
            colorHex: '#FFFFFF',
            stock: 35,
            price: 129.99,
            sku: 'NIKE-AM90-WHT-42',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_40)!.id,
            color: 'Black/Red',
            colorHex: '#000000',
            stock: 20,
            price: 134.99,
            sku: 'NIKE-AM90-BLK-40',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_41)!.id,
            color: 'Black/Red',
            colorHex: '#000000',
            stock: 25,
            price: 134.99,
            sku: 'NIKE-AM90-BLK-41',
          },
        ],
      },
    },
  });

  // Product 2: Adidas Ultraboost 22
  const adidasUltraboost = await prisma.product.create({
    data: {
      name: 'Adidas Ultraboost 22',
      slug: 'adidas-ultraboost-22',
      description:
        'These adidas running shoes deliver unrivaled comfort and energy return. The Linear Energy Push system and optimized Boost midsole team up to give you a powerfully smooth and responsive ride.',
      basePrice: 189.99,
      categoryId: categories[1].id, // Running Shoes
      brandId: brands[1].id, // Adidas
      gender: Gender.MEN,
      upperMaterial: 'Primeknit Textile',
      soleMaterial: 'Boost Foam',
      heelHeight: 4.0,
      closureType: 'Laces',
      isFeatured: true,
      isActive: true,
      metaTitle: 'Adidas Ultraboost 22 - Premium Running Shoes | SaintDeals',
      metaDescription:
        'Experience ultimate comfort with Adidas Ultraboost 22 running shoes featuring Boost technology and responsive cushioning.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5',
            alt: 'Adidas Ultraboost 22 - Front View',
            isPrimary: true,
            order: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa',
            alt: 'Adidas Ultraboost 22 - Side View',
            isPrimary: false,
            order: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_41)!.id,
            color: 'Core Black',
            colorHex: '#000000',
            stock: 15,
            price: 189.99,
            sku: 'ADIDAS-UB22-BLK-41',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_42)!.id,
            color: 'Core Black',
            colorHex: '#000000',
            stock: 20,
            price: 189.99,
            sku: 'ADIDAS-UB22-BLK-42',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_43)!.id,
            color: 'Core Black',
            colorHex: '#000000',
            stock: 18,
            price: 189.99,
            sku: 'ADIDAS-UB22-BLK-43',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_42)!.id,
            color: 'Cloud White',
            colorHex: '#F5F5F5',
            stock: 22,
            price: 189.99,
            sku: 'ADIDAS-UB22-WHT-42',
          },
        ],
      },
    },
  });

  // Product 3: New Balance 574
  const newBalance574 = await prisma.product.create({
    data: {
      name: 'New Balance 574',
      slug: 'new-balance-574',
      description:
        'The 574 is a clean and classic die cut EVA runner that utilizes ENCAP cushioning technology. Built to be versatile and durable, this is a timeless classic.',
      basePrice: 84.99,
      categoryId: categories[0].id, // Sneakers
      brandId: brands[3].id, // New Balance
      gender: Gender.UNISEX,
      upperMaterial: 'Suede and Mesh',
      soleMaterial: 'EVA',
      heelHeight: 3.0,
      closureType: 'Laces',
      isFeatured: false,
      isActive: true,
      metaTitle: 'New Balance 574 - Classic Lifestyle Sneakers | SaintDeals',
      metaDescription:
        'Shop the iconic New Balance 574 with ENCAP cushioning and timeless design.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1539185441755-769473a23570',
            alt: 'New Balance 574 - Front View',
            isPrimary: true,
            order: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_39)!.id,
            color: 'Grey',
            colorHex: '#808080',
            stock: 30,
            price: 84.99,
            sku: 'NB-574-GREY-39',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_40)!.id,
            color: 'Grey',
            colorHex: '#808080',
            stock: 35,
            price: 84.99,
            sku: 'NB-574-GREY-40',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_41)!.id,
            color: 'Grey',
            colorHex: '#808080',
            stock: 40,
            price: 84.99,
            sku: 'NB-574-GREY-41',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_42)!.id,
            color: 'Navy',
            colorHex: '#000080',
            stock: 28,
            price: 84.99,
            sku: 'NB-574-NAVY-42',
          },
        ],
      },
    },
  });

  // Product 4: Converse Chuck Taylor All Star
  const converseChuckTaylor = await prisma.product.create({
    data: {
      name: 'Converse Chuck Taylor All Star',
      slug: 'converse-chuck-taylor-all-star',
      description:
        'The classic Chuck Taylor All Star features a timeless silhouette with a durable canvas upper, iconic rubber toe cap, and versatile style that goes with everything.',
      basePrice: 59.99,
      categoryId: categories[0].id, // Sneakers
      brandId: brands[4].id, // Converse
      gender: Gender.UNISEX,
      upperMaterial: 'Canvas',
      soleMaterial: 'Rubber',
      heelHeight: 2.5,
      closureType: 'Laces',
      isFeatured: true,
      isActive: true,
      metaTitle: 'Converse Chuck Taylor All Star - Classic Canvas Sneakers',
      metaDescription:
        'Shop the iconic Converse Chuck Taylor All Star sneakers with timeless canvas design.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782',
            alt: 'Converse Chuck Taylor - Front View',
            isPrimary: true,
            order: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7',
            alt: 'Converse Chuck Taylor - Detail View',
            isPrimary: false,
            order: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_38)!.id,
            color: 'Black',
            colorHex: '#000000',
            stock: 50,
            price: 59.99,
            sku: 'CONV-CT-BLK-38',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_39)!.id,
            color: 'Black',
            colorHex: '#000000',
            stock: 60,
            price: 59.99,
            sku: 'CONV-CT-BLK-39',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_40)!.id,
            color: 'Black',
            colorHex: '#000000',
            stock: 55,
            price: 59.99,
            sku: 'CONV-CT-BLK-40',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_39)!.id,
            color: 'White',
            colorHex: '#FFFFFF',
            stock: 45,
            price: 59.99,
            sku: 'CONV-CT-WHT-39',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_40)!.id,
            color: 'White',
            colorHex: '#FFFFFF',
            stock: 50,
            price: 59.99,
            sku: 'CONV-CT-WHT-40',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_39)!.id,
            color: 'Red',
            colorHex: '#FF0000',
            stock: 30,
            price: 59.99,
            sku: 'CONV-CT-RED-39',
          },
        ],
      },
    },
  });

  // Product 5: Vans Old Skool
  const vansOldSkool = await prisma.product.create({
    data: {
      name: 'Vans Old Skool',
      slug: 'vans-old-skool',
      description:
        'The Vans Old Skool has never been lacking in the attitude department. It brought the dawn of the classic Vans sidestripe when it debuted in 1977.',
      basePrice: 69.99,
      categoryId: categories[0].id, // Sneakers
      brandId: brands[5].id, // Vans
      gender: Gender.UNISEX,
      upperMaterial: 'Canvas and Suede',
      soleMaterial: 'Rubber',
      heelHeight: 2.8,
      closureType: 'Laces',
      isFeatured: true,
      isActive: true,
      metaTitle: 'Vans Old Skool - Classic Skate Shoes | SaintDeals',
      metaDescription:
        'Shop the iconic Vans Old Skool with the classic sidestripe design.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f',
            alt: 'Vans Old Skool - Front View',
            isPrimary: true,
            order: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_40)!.id,
            color: 'Black/White',
            colorHex: '#000000',
            stock: 40,
            price: 69.99,
            sku: 'VANS-OS-BLK-40',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_41)!.id,
            color: 'Black/White',
            colorHex: '#000000',
            stock: 45,
            price: 69.99,
            sku: 'VANS-OS-BLK-41',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_42)!.id,
            color: 'Black/White',
            colorHex: '#000000',
            stock: 38,
            price: 69.99,
            sku: 'VANS-OS-BLK-42',
          },
        ],
      },
    },
  });

  // Product 6: Puma Suede Classic
  const pumaSuede = await prisma.product.create({
    data: {
      name: 'Puma Suede Classic',
      slug: 'puma-suede-classic',
      description:
        'A timeless icon first worn by basketball players in the 1960s, the Puma Suede has been embraced by hip-hop artists, skaters, and street style enthusiasts alike.',
      basePrice: 74.99,
      categoryId: categories[0].id, // Sneakers
      brandId: brands[2].id, // Puma
      gender: Gender.UNISEX,
      upperMaterial: 'Suede',
      soleMaterial: 'Rubber',
      heelHeight: 2.5,
      closureType: 'Laces',
      isFeatured: false,
      isActive: true,
      metaTitle: 'Puma Suede Classic - Iconic Sneakers | SaintDeals',
      metaDescription:
        'Shop the timeless Puma Suede Classic with premium suede upper.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9',
            alt: 'Puma Suede Classic - Front View',
            isPrimary: true,
            order: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_40)!.id,
            color: 'Peacoat',
            colorHex: '#1B2845',
            stock: 25,
            price: 74.99,
            sku: 'PUMA-SUEDE-PCO-40',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_41)!.id,
            color: 'Peacoat',
            colorHex: '#1B2845',
            stock: 30,
            price: 74.99,
            sku: 'PUMA-SUEDE-PCO-41',
          },
          {
            sizeId: sizes.find((s) => s.sizeValue === ShoeSize.EU_42)!.id,
            color: 'High Risk Red',
            colorHex: '#C8102E',
            stock: 20,
            price: 74.99,
            sku: 'PUMA-SUEDE-RED-42',
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${6} products with variants and images`);

  // ============================================
  // 7. CREATE REVIEWS
  // ============================================
  console.log('⭐ Creating reviews...');
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        productId: nikeAirMax90.id,
        userId: customer1.id,
        rating: 5,
        title: 'Amazing comfort!',
        comment:
          'These Air Max 90s are incredibly comfortable. The cushioning is perfect for all-day wear.',
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        productId: nikeAirMax90.id,
        userId: customer2.id,
        rating: 4,
        title: 'Great quality',
        comment: 'Love the design and quality. Runs a bit large though.',
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        productId: adidasUltraboost.id,
        userId: customer1.id,
        rating: 5,
        title: 'Best running shoes ever!',
        comment:
          'The Boost technology is incredible. My knees feel much better after long runs.',
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        productId: converseChuckTaylor.id,
        userId: customer2.id,
        rating: 5,
        title: 'Classic never goes out of style',
        comment: 'Perfect for casual wear. True to size and very versatile.',
        isVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  // ============================================
  // 8. CREATE WISHLISTS
  // ============================================
  console.log('❤️ Creating wishlist items...');
  const wishlistItems = await Promise.all([
    prisma.wishlist.create({
      data: {
        userId: customer1.id,
        productId: vansOldSkool.id,
      },
    }),
    prisma.wishlist.create({
      data: {
        userId: customer1.id,
        productId: pumaSuede.id,
      },
    }),
    prisma.wishlist.create({
      data: {
        userId: customer2.id,
        productId: adidasUltraboost.id,
      },
    }),
  ]);

  console.log(`✅ Created ${wishlistItems.length} wishlist items`);

  // ============================================
  // 9. SUMMARY
  // ============================================
  console.log('\n✨ Seeding completed successfully! ✨\n');
  console.log('📊 Summary:');
  console.log(`   - Users: 4 (1 Super Admin, 1 Admin, 2 Customers)`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Brands: ${brands.length}`);
  console.log(`   - Sizes: ${sizes.length}`);
  console.log(`   - Products: 6 (with variants and images)`);
  console.log(`   - Reviews: ${reviews.length}`);
  console.log(`   - Wishlist Items: ${wishlistItems.length}\n`);
  console.log('🔐 Test Credentials:');
  console.log('   Super Admin: superadmin@saintdeals.com / Password123!');
  console.log('   Admin: admin@saintdeals.com / Password123!');
  console.log('   Customer: customer@example.com / Password123!');
  console.log('   Customer 2: jane.smith@example.com / Password123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
