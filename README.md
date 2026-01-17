# NestMart Engine 🚀

Professional multi-vendor marketplace platform built with NestJS and TypeScript. This platform supports multiple sellers, customers, and comprehensive e-commerce features with ACID transactions, role-based access control, and a complete order management system.

## Features

### Core Functionality
- ✅ **Multi-vendor Support**: Multiple sellers can create and manage their stores
- ✅ **User Management**: Super Admin, Seller, and Customer roles with RBAC
- ✅ **Product Management**: Full CRUD operations with search, filtering, and pagination
- ✅ **Order Management**: ACID transactions for order processing with stock management
- ✅ **Payment Integration**: Simulated payment gateway (Payme, Click, Credit Card)
- ✅ **Review System**: Product ratings and reviews with verified purchase badges
- ✅ **Address Management**: Multiple shipping addresses per user

### Technical Features
- ✅ **Global Validation Pipes**: Automatic data validation and transformation
- ✅ **Response Interceptors**: Standardized API response format
- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Soft Delete**: Deleted records are preserved for audit trail
- ✅ **ACID Transactions**: Guaranteed data consistency in order processing
- ✅ **Swagger Documentation**: Complete API documentation at `/api`
- ✅ **TypeORM with PostgreSQL**: Robust database layer with relationships
- ✅ **Role-Based Access Control (RBAC)**: Guards and decorators for route protection

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL
- **ORM**: TypeORM 0.3.x
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
src/
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators (Roles, CurrentUser, Public)
│   ├── enums/           # Enums (UserRole, OrderStatus, PaymentStatus)
│   ├── guards/          # Auth and role guards
│   └── interceptors/    # Response interceptor
├── config/              # Configuration files
│   └── database.config.ts
├── entities/            # TypeORM entities
│   ├── user.entity.ts
│   ├── store.entity.ts
│   ├── product.entity.ts
│   ├── order.entity.ts
│   ├── order-item.entity.ts
│   ├── review.entity.ts
│   ├── payment.entity.ts
│   ├── address.entity.ts
│   └── category.entity.ts
├── modules/             # Feature modules
│   ├── auth/            # Authentication (JWT, registration, login)
│   ├── user/            # User profile and addresses
│   ├── store/           # Store management
│   ├── product/         # Product CRUD and search
│   ├── order/           # Order processing with ACID transactions
│   ├── review/          # Product reviews and ratings
│   └── payment/         # Payment processing
└── main.ts              # Application entry point
```

## Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nestmart-engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=nestmart

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Application
   PORT=3000
   NODE_ENV=development

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Database Setup**
   Create a PostgreSQL database:
   ```sql
   CREATE DATABASE nestmart;
   ```
   
   The database schema will be automatically created by TypeORM on first run.

5. **Run the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

6. **Access Swagger API Documentation**
   Open your browser and navigate to:
   ```
   http://localhost:3000/api
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Users
- `GET /api/user/profile` - Get current user profile (Auth required)
- `PUT /api/user/profile` - Update user profile (Auth required)

### Addresses
- `POST /api/user/addresses` - Create address (Auth required)
- `GET /api/user/addresses` - Get all user addresses (Auth required)
- `GET /api/user/addresses/:id` - Get address by ID (Auth required)
- `PUT /api/user/addresses/:id` - Update address (Auth required)
- `DELETE /api/user/addresses/:id` - Delete address (Auth required)

### Stores
- `POST /api/stores` - Create store (Seller only)
- `GET /api/stores` - Get all active stores
- `GET /api/stores/my-store` - Get my store (Seller only)
- `GET /api/stores/:id` - Get store by ID
- `GET /api/stores/slug/:slug` - Get store by slug
- `PUT /api/stores/:id` - Update store (Owner or Admin)
- `DELETE /api/stores/:id` - Delete store (Owner or Admin)
- `PUT /api/stores/:id/approve` - Approve store (Super Admin only)
- `PUT /api/stores/:id/commission` - Set commission rate (Super Admin only)

### Products
- `POST /api/products/stores/:storeId` - Create product (Seller only)
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/stores/:storeId/my-products` - Get store products (Owner or Admin)
- `PUT /api/products/:id/stores/:storeId` - Update product (Owner only)
- `DELETE /api/products/:id/stores/:storeId` - Delete product (Owner only)

**Product Filtering Query Parameters:**
- `search` - Search by name, description, or brand
- `categoryId` - Filter by category
- `storeId` - Filter by store
- `brand` - Filter by brand
- `minPrice` / `maxPrice` - Price range
- `minRating` - Minimum rating
- `sortBy` - Sort field (price, rating, createdAt, sold)
- `sortOrder` - Sort order (ASC, DESC)
- `page` - Page number
- `limit` - Items per page

### Orders
- `POST /api/orders` - Create order (Customer only)
- `GET /api/orders` - Get all orders (filtered by role)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (Seller or Admin)
- `PUT /api/orders/:id/cancel` - Cancel order (Customer only)

### Reviews
- `POST /api/reviews` - Create review (Customer only)
- `GET /api/reviews` - Get all reviews (optional productId query)
- `GET /api/reviews/:id` - Get review by ID
- `PUT /api/reviews/:id` - Update review (Owner only)
- `DELETE /api/reviews/:id` - Delete review (Owner only)

### Payments
- `POST /api/payments` - Create payment (Customer only)
- `GET /api/payments` - Get all payments (optional orderId query)
- `GET /api/payments/:id` - Get payment by ID
- `PUT /api/payments/:id/verify` - Verify payment (Super Admin only)

## User Roles

### Super Admin
- Full system access
- Approve/reject stores
- Set commission rates
- View all orders and payments

### Seller
- Create and manage store
- Add/edit/delete products
- View store orders
- Update order status
- View store statistics

### Customer
- Browse products
- Add products to cart
- Create orders
- Make payments
- Leave reviews
- Manage addresses

## Database Schema

### Entities and Relationships
- **User** (1:1) **Store** - Each seller has one store
- **User** (1:N) **Order** - Customer has many orders
- **User** (1:N) **Address** - User has many addresses
- **User** (1:N) **Review** - User has many reviews
- **Store** (1:N) **Product** - Store has many products
- **Store** (1:N) **Order** - Store has many orders
- **Product** (N:1) **Category** - Product belongs to category
- **Product** (1:N) **OrderItem** - Product has many order items
- **Product** (1:N) **Review** - Product has many reviews
- **Order** (1:N) **OrderItem** - Order has many items
- **Order** (1:N) **Payment** - Order can have multiple payments
- **Order** (N:1) **Address** - Order has shipping address

## ACID Transactions

The order creation and cancellation processes use ACID transactions to ensure data consistency:

1. **Order Creation**:
   - Validates products exist and have sufficient stock
   - Locks products to prevent race conditions
   - Creates order and order items
   - Decreases product stock
   - Calculates totals and commission
   - All operations succeed or fail together

2. **Order Cancellation**:
   - Restores product stock
   - Updates order status
   - Maintains data integrity

## Development

### Available Scripts

```bash
# Development
npm run start:dev      # Start in watch mode

# Production
npm run build          # Build for production
npm run start:prod     # Start production server

# Testing
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests
npm run test:cov       # Run tests with coverage

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier

# Database
npm run migration:generate  # Generate migration
npm run migration:run       # Run migrations
npm run migration:revert    # Revert last migration
```

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Input validation with class-validator
- SQL injection protection via TypeORM
- CORS configuration
- Soft delete for audit trail

## Best Practices Implemented

1. **Separation of Concerns**: Modules are organized by feature
2. **DTO Validation**: All inputs validated using DTOs
3. **Error Handling**: Comprehensive error handling with proper HTTP status codes
4. **Type Safety**: Full TypeScript typing throughout
5. **Database Transactions**: ACID compliance for critical operations
6. **Code Reusability**: Shared guards, interceptors, and decorators
7. **API Documentation**: Swagger integration for automatic documentation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the UNLICENSED License - see the LICENSE file for details.

## Support

For support, email support@nestmart.com or create an issue in the repository.

## Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Database powered by [PostgreSQL](https://www.postgresql.org/)
- API documentation by [Swagger](https://swagger.io/)

---

**Built with ❤️ using NestJS and TypeScript**
