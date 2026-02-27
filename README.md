# E-commerce Backend API

A complete, production-ready E-commerce backend built with Node.js v22, Express.js, and MongoDB. Features JWT authentication, role-based access control, comprehensive product management, shopping cart, wishlist, order management, and payment integration.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Deployment](#deployment)

## Features

### User Management
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin/User)
- ✅ User profile management
- ✅ Password change functionality
- ✅ User account deletion

### Product Management
- ✅ CRUD operations for products
- ✅ Product categories
- ✅ Product search and filtering
- ✅ Product reviews and ratings
- ✅ Stock management
- ✅ Product images and attributes
- ✅ Product slug generation

### Cart Management
- ✅ Add/update/remove items from cart
- ✅ Cart total calculation
- ✅ Cart clear functionality
- ✅ Persistent cart storage

### Wishlist Management
- ✅ Add/remove products to/from wishlist
- ✅ View wishlist
- ✅ Check if product is in wishlist

### Order Management
- ✅ Create orders from cart
- ✅ Order history and tracking
- ✅ Order status management
- ✅ Order cancellation with refunds
- ✅ Tax and shipping calculations
- ✅ Order number generation

### Payment Integration
- ✅ Stripe payment integration
- ✅ Razorpay payment integration (alternative)
- ✅ Payment status tracking
- ✅ Transaction ID management

### Security
- ✅ Password hashing with bcryptjs
- ✅ Request validation with Joi
- ✅ JWT token verification
- ✅ Role-based authorization
- ✅ Error handling middleware
- ✅ CORS protection

## Tech Stack

- **Runtime**: Node.js v22
- **Framework**: Express.js v4
- **Database**: MongoDB with Mongoose v7
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Payment**: Stripe SDK
- **Environment**: dotenv
- **CORS**: cors middleware

## Project Structure

```
EcomBE/
├── config/
│   └── database.js              # MongoDB connection
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── userController.js        # User management
│   ├── productController.js     # Product CRUD
│   ├── categoryController.js    # Category management
│   ├── cartController.js        # Cart operations
│   ├── wishlistController.js    # Wishlist operations
│   ├── orderController.js       # Order management
│   └── paymentController.js     # Payment processing
├── middleware/
│   ├── auth.js                  # JWT verification
│   ├── roleCheck.js             # Role authorization
│   ├── validate.js              # Request validation
│   └── errorHandler.js          # Error handling
├── models/
│   ├── User.js                  # User schema
│   ├── Product.js               # Product schema
│   ├── Category.js              # Category schema
│   ├── Cart.js                  # Cart schema
│   ├── Wishlist.js              # Wishlist schema
│   └── Order.js                 # Order schema
├── routes/
│   ├── authRoutes.js            # Auth endpoints
│   ├── userRoutes.js            # User endpoints
│   ├── productRoutes.js         # Product endpoints
│   ├── categoryRoutes.js        # Category endpoints
│   ├── cartRoutes.js            # Cart endpoints
│   ├── wishlistRoutes.js        # Wishlist endpoints
│   ├── orderRoutes.js           # Order endpoints
│   └── paymentRoutes.js         # Payment endpoints
├── utils/
│   ├── ApiError.js              # Custom error class
│   ├── ApiResponse.js           # Standard response format
│   └── validationSchemas.js     # Joi validation schemas
├── server.js                    # Application entry point
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
└── README.md                    # Documentation
```

## Installation

### Prerequisites
- Node.js v22 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Steps

1. **Clone or Extract the project**
```bash
cd EcomBE
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

5. **Run the server**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:5000`

## Configuration

### Environment Variables (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here

# Razorpay (Optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Server
PORT=5000
API_URL=http://localhost:5000

# Pagination
ITEMS_PER_PAGE=12
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}

Response: { token, user }
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { token, user }
```

#### Get Profile
```
GET /auth/profile
Authorization: Bearer {token}

Response: { user }
```

#### Update Profile
```
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  }
}

Response: { user }
```

#### Change Password
```
POST /auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}

Response: {}
```

### Product Routes

#### Get All Products
```
GET /products?page=1&limit=12&category=categoryId&search=query&sortBy=-createdAt

Response: { products, pagination }
```

#### Get Product by ID
```
GET /products/:id

Response: { product }
```

#### Get Product by Slug
```
GET /products/slug/:slug

Response: { product }
```

#### Create Product (Admin only)
```
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 999,
  "originalPrice": 1299,
  "discount": 10,
  "category": "categoryId",
  "stock": 50,
  "sku": "SKU-123",
  "attributes": {
    "size": ["S", "M", "L"],
    "color": ["Red", "Blue"],
    "material": "Cotton"
  }
}

Response: { product }
```

#### Update Product (Admin only)
```
PUT /products/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Product",
  "price": 899,
  "stock": 40
}

Response: { product }
```

#### Delete Product (Admin only)
```
DELETE /products/:id
Authorization: Bearer {token}

Response: { product }
```

#### Search Products
```
GET /products/search?q=keyword&page=1&limit=12

Response: { products, pagination }
```

#### Add Product Review
```
POST /products/:id/review
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great product!"
}

Response: { product }
```

#### Get Products by Category
```
GET /products/category/:categoryId?page=1&limit=12&sortBy=-createdAt

Response: { products, pagination }
```

### Category Routes

#### Get All Categories
```
GET /categories?page=1&limit=10

Response: { categories, pagination }
```

#### Get Category by ID
```
GET /categories/:id

Response: { category }
```

#### Get Category by Slug
```
GET /categories/slug/:slug

Response: { category }
```

#### Create Category (Admin only)
```
POST /categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Electronics",
  "description": "All electronic items",
  "image": "image_url"
}

Response: { category }
```

#### Update Category (Admin only)
```
PUT /categories/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Category",
  "description": "Updated description"
}

Response: { category }
```

#### Delete Category (Admin only)
```
DELETE /categories/:id
Authorization: Bearer {token}

Response: { category }
```

### Cart Routes

#### Get Cart
```
GET /cart
Authorization: Bearer {token}

Response: { cart }
```

#### Add to Cart
```
POST /cart/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "productId",
  "quantity": 2,
  "selectedAttributes": {
    "size": "M",
    "color": "Red"
  }
}

Response: { cart }
```

#### Update Cart Item
```
PUT /cart/items/:productId
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 5
}

Response: { cart }
```

#### Remove from Cart
```
DELETE /cart/items/:productId
Authorization: Bearer {token}

Response: { cart }
```

#### Clear Cart
```
DELETE /cart
Authorization: Bearer {token}

Response: { cart }
```

### Wishlist Routes

#### Get Wishlist
```
GET /wishlist
Authorization: Bearer {token}

Response: { wishlist }
```

#### Add to Wishlist
```
POST /wishlist/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "productId"
}

Response: { wishlist }
```

#### Remove from Wishlist
```
DELETE /wishlist/items/:productId
Authorization: Bearer {token}

Response: { wishlist }
```

#### Check if Product in Wishlist
```
GET /wishlist/check/:productId
Authorization: Bearer {token}

Response: { inWishlist: boolean }
```

#### Clear Wishlist
```
DELETE /wishlist
Authorization: Bearer {token}

Response: { wishlist }
```

### Order Routes

#### Create Order
```
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "billingAddress": { ... }, // optional
  "paymentMethod": "credit_card"
}

Response: { order }
```

#### Get User Orders
```
GET /orders/user/orders?page=1&limit=10&status=pending
Authorization: Bearer {token}

Response: { orders, pagination }
```

#### Get Order by ID
```
GET /orders/:id
Authorization: Bearer {token}

Response: { order }
```

#### Track Order
```
GET /orders/track/:orderNumber

Response: { order }
```

#### Cancel Order
```
POST /orders/:id/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "cancelReason": "Changed my mind"
}

Response: { order }
```

#### Get All Orders (Admin only)
```
GET /orders?page=1&limit=10&status=pending&paymentStatus=completed
Authorization: Bearer {token}

Response: { orders, pagination }
```

#### Update Order Status (Admin only)
```
PUT /orders/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "shipped"
}

Response: { order }
```

#### Update Payment Status (Admin only)
```
PUT /orders/:id/payment-status
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentStatus": "completed",
  "transactionId": "txn_123"
}

Response: { order }
```

### Payment Routes

#### Stripe: Create Payment Intent
```
POST /payments/stripe/create-payment-intent
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "orderId",
  "amount": 999.99
}

Response: { clientSecret, paymentIntentId }
```

#### Stripe: Confirm Payment
```
POST /payments/stripe/confirm-payment
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "orderId",
  "paymentIntentId": "pi_123"
}

Response: { order }
```

#### Stripe: Get Payment Status
```
GET /payments/stripe/:paymentIntentId
Authorization: Bearer {token}

Response: { status, amount, currency }
```

#### Razorpay: Create Payment Intent
```
POST /payments/razorpay/create-payment-intent
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "orderId"
}

Response: { razorpayOrderId, amount, currency, keyId }
```

#### Razorpay: Verify Payment
```
POST /payments/razorpay/verify-payment
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "orderId",
  "razorpayPaymentId": "pay_123",
  "razorpaySignature": "signature"
}

Response: { order }
```

### User Management Routes (Admin only)

#### Get All Users
```
GET /users?page=1&limit=10
Authorization: Bearer {token}

Response: { users, pagination }
```

#### Get User by ID
```
GET /users/:id
Authorization: Bearer {token}

Response: { user }
```

#### Update User Role
```
PUT /users/:id/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "admin"
}

Response: { user }
```

#### Deactivate User
```
PUT /users/:id/deactivate
Authorization: Bearer {token}

Response: { user }
```

## Database Schema

### User Schema
- firstName: String (required)
- lastName: String (required)
- email: String (unique, required)
- password: String (hashed)
- phone: String
- profileImage: String
- role: String (enum: 'user', 'admin')
- address: Object
- isActive: Boolean
- emailVerified: Boolean
- createdAt: Date
- updatedAt: Date

### Product Schema
- name: String (required)
- description: String (required)
- slug: String (unique)
- price: Number (required)
- originalPrice: Number
- discount: Number
- category: ObjectId (ref: Category)
- images: Array
- stock: Number (required)
- sku: String (unique)
- rating: Number (0-5)
- reviews: Array
- attributes: Object
- isActive: Boolean
- createdBy: ObjectId (ref: User)
- createdAt: Date
- updatedAt: Date

### Category Schema
- name: String (unique, required)
- description: String
- slug: String (unique)
- image: String
- isActive: Boolean
- createdAt: Date
- updatedAt: Date

### Cart Schema
- userId: ObjectId (ref: User, unique)
- items: Array
- totalPrice: Number
- totalDiscount: Number
- couponCode: String
- couponDiscount: Number
- createdAt: Date
- updatedAt: Date

### Wishlist Schema
- userId: ObjectId (ref: User, unique)
- products: Array
- createdAt: Date
- updatedAt: Date

### Order Schema
- orderNumber: String (unique)
- userId: ObjectId (ref: User)
- items: Array
- subtotal: Number
- tax: Number
- shippingCost: Number
- discount: Number
- total: Number
- shippingAddress: Object
- billingAddress: Object
- paymentMethod: String
- paymentStatus: String
- paymentId: String
- transactionId: String
- status: String
- trackingNumber: String
- createdAt: Date
- updatedAt: Date

## Authentication

### JWT Token
- Issued on successful login/registration
- Valid for 7 days (configurable)
- Include in Authorization header: `Bearer {token}`
- Decoded to extract user ID and role

### Roles
- **user**: Can browse products, manage cart/wishlist, place orders
- **admin**: Can manage products, categories, users, and view all orders

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Error Codes
- 400: Bad Request (validation error)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Deployment

### Heroku Deployment
1. Create Heroku app
2. Set environment variables
3. Deploy with Git

### AWS Deployment
1. Deploy to EC2 or Elastic Beanstalk
2. Configure MongoDB Atlas
3. Set up environment variables
4. Use PM2 for process management

### Docker Deployment
```dockerfile
FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Testing the API

### Using curl
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "password":"password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"password123"
  }'
```

### Using Postman
1. Import API collection
2. Set base URL to `http://localhost:5000/api`
3. Create environment variables for token
4. Test endpoints with request/response examples

## Security Best Practices

1. ✅ Change JWT_SECRET in production
2. ✅ Use HTTPS in production
3. ✅ Enable MongoDB authentication
4. ✅ Validate all inputs with Joi
5. ✅ Use bcrypt for password hashing
6. ✅ Implement rate limiting (not included)
7. ✅ Use environment variables for secrets
8. ✅ Enable CORS for trusted domains only
9. ✅ Implement request logging
10. ✅ Regular security audits

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Advanced search with filters
- [ ] Image upload to S3
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Analytics dashboard
- [ ] Coupons and discount codes
- [ ] Wishlist sharing
- [ ] Product recommendations
- [ ] User reviews with images
- [ ] Bulk order management
- [ ] Subscription products
- [ ] API documentation with Swagger

## Support & Contribution

For issues or contributions, please create an issue or pull request.

## License

ISC License - Feel free to use this project for your own purposes.
