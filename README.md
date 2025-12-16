<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

<p align="center">
  🛍️ <strong>Saint Deals</strong> — A modern and scalable eCommerce platform specialized in selling shoes, 
<p align="center">
  🛍️ <strong>Saint Deals</strong> — A modern and scalable eCommerce platform specialized in selling shoes, 
  built with NestJS and Prisma ORM.
</p>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank">
    <img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" />
<p align="center">
  <img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" />
  <img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" />
  <img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" />
</p>
## 📝 Overview

**Saint Deals** is a full-featured backend API for managing an online **shoe store**.  
It provides a complete solution for handling **products, sizes, brands, discounts, orders, payments, reviews, and customers**, built with **NestJS**, **Prisma**, and **PostgreSQL**.

This system follows a modular architecture that ensures scalability, maintainability, and clean separation of concerns.

---

## ⚙️ Key Features

### 👤 User Management & Authentication

- Secure JWT-based authentication
- Role-based access (`CUSTOMER`, `ADMIN`, `SUPER_ADMIN`)
- Email verification and password recovery
- Address book for shipping and billing

### 👟 Product Management

- Products linked to **categories**, **brands**, and **sizes**
- Variants with stock, color, and price tracking
- Multiple images per product (with “isPrimary” flag)
- Gender targeting (`MEN`, `WOMEN`, `UNISEX`, `KIDS`)

### 🛒 Cart & Wishlist

- Persistent user cart system
- Wishlist with quick add/remove support
- Real-time quantity updates and variant tracking

### 💰 Orders & Payments

- Complete checkout flow with tax and shipping
- Payment support (Stripe, PayPal, or COD)
- Shipment and delivery status tracking
- Discount and coupon support

### ⭐ Reviews & Ratings

- Verified purchase reviews
- 1–5 star ratings and comments
- Aggregated average ratings per product

### 🎁 Discounts & Promotions

- Coupons with expiry, type (`PERCENT`, `FIXED`, `FREE_SHIPPING`)
- Min order value and usage count limits

---

## 🧱 Tech Stack

| Layer                | Technology                   |
| -------------------- | ---------------------------- |
| **Framework**        | [NestJS](https://nestjs.com) |
| **ORM**              | [Prisma](https://prisma.io)  |
| **Database**         | PostgreSQL                   |
| **Auth**             | JWT                          |
| **File Storage**     | Cloudinary                   |
| **Containerization** | Docker                       |
| **Language**         | TypeScript                   |

---

## 🧩 Database Models Overview

| Domain          | Models                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| **User System** | `User`, `Address`                                                        |
| **Products**    | `Product`, `Category`, `Brand`, `ProductVariant`, `ProductImage`, `Size` |
| **Cart**        | `Cart`, `CartItem`                                                       |
| **Orders**      | `Order`, `OrderItem`, `Shipment`, `Payment`                              |
| **Discounts**   | `Discount`                                                               |
| **Extras**      | `Review`, `Wishlist`                                                     |

---

## ⚙️ Project Setup

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Configure Environment Variables

Create a .env file in your root directory:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saintdeals"
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PORT=3000
NODE_ENV=development

```

### 3️⃣ Setup Prisma

```bash
# Generate Prisma client
pnpm run generate

# Run migrations
pnpm run migrate

# Seed database with sample data
pnpm run db:seed

# Open Prisma Studio (optional)
pnpm run studio

```

> **💡 Quick Start Tip**: Run `pnpm db:seed` after migrations to populate your database with sample products, categories, brands, and test users. See [SEED_REFERENCE.md](./SEED_REFERENCE.md) for details.

#### 🧠 Available NPM Scripts

| Command                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `pnpm run build`       | Build project (includes NestJS compilation) |
| `pnpm run format`      | Format code using Prettier                  |
| `pnpm run start`       | Start the application                       |
| `pnpm run start:dev`   | Start in development mode (with watch)      |
| `pnpm run start:debug` | Start with debugging mode                   |
| `pnpm run start:prod`  | Start production build                      |
| `pnpm run lint`        | Run ESLint and auto-fix issues              |
| `pnpm run test`        | Run all tests                               |
| `pnpm run test:watch`  | Run tests in watch mode                     |
| `pnpm run test:cov`    | Generate test coverage report               |
| `pnpm run test:debug`  | Debug Jest tests                            |
| `pnpm run test:e2e`    | Run end-to-end tests                        |
| `pnpm run migrate`     | Apply database migrations (dev)             |
| `pnpm run deploy`      | Apply database migrations (production)      |
| `pnpm run studio`      | Open Prisma Studio                          |
| `pnpm run generate`    | Generate Prisma client                      |
| `pnpm run reset`       | Reset and reapply database migrations       |
| `pnpm run seed`        | Seed database with sample data              |
| `pnpm run db:seed`     | Seed database using Prisma CLI              |

### 🚀 Running the Application

# Development Mode

```bash
pnpm run start:dev
```

# Production Mode

```bash
pnpm run build
pnpm run start:prod
```

# 🧪 Testing

```bash
# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Generate test coverage
pnpm run test:cov
```

### 📘 API Documentation

After running the app, access Swagger UI at:

```bash
http://localhost:3000/api

```

### 💬 Support

📧 muhozajohn4@gmail.com

👨‍💻 Developed by John Muhoza

### 📄 License

## This project is MIT licensed
