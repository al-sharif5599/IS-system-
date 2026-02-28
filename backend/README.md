# Online Shop - Full-Stack E-Commerce System

A complete full-stack e-commerce platform built with Django REST Framework and React.

## Features

### Customer Features
- User registration and login (with email verification)
- Google OAuth authentication
- Password reset functionality
- Browse products with search and category filtering
- View product details
- Add products to cart
- Checkout and place orders
- Demo Mpesa payment integration
- View order history and status

### Admin Features
- Statistics dashboard (total users, products, orders, revenue)
- User management (view, block, remove users)
- Product management (approve/reject products with email notification)
- Order management

## Tech Stack

- **Backend:** Django + Django REST Framework (Python)
- **Database:** SQLite (default Django database)
- **Authentication:** JWT + Google OAuth 2.0
- **Frontend:** React 18 + Vite
- **Payment:** Demo M-Pesa Integration

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup

1. Navigate to backend directory:
```
bash
cd online_shop
```

2. Create virtual environment:
```
bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. Install dependencies:
```
bash
pip install -r requirements.txt
```

4. Configure environment variables:
Copy `.env.example` to `.env` and configure:
- SECRET_KEY
- DEBUG
- EMAIL settings
- Google OAuth credentials

5. Run migrations:
```
bash
python manage.py migrate
```

6. Create superuser:
```
bash
python manage.py createsuperuser
```

7. Run backend server:
```
bash
python manage.py runserver
```

Backend runs at: http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
```
bash
cd frontend
```

2. Install dependencies:
```
bash
npm install
```

3. Run development server:
```
bash
npm run dev
```

Frontend runs at: http://localhost:5173

## API Endpoints

### Authentication
- POST `/api/auth/register/` - User registration
- POST `/api/auth/login/` - JWT login
- POST `/api/auth/token/refresh/` - Refresh token
- POST `/api/auth/password-reset/` - Password reset request
- GET `/api/auth/me/` - Current user info

### Products
- GET `/api/products/` - List all approved products
- POST `/api/products/` - Create product (authenticated)
- GET `/api/products/my/` - My products
- POST `/api/products/{id}/approve/` - Approve product (admin)
- POST `/api/products/{id}/reject/` - Reject product (admin)
- GET `/api/products/pending/` - Pending products (admin)

### Orders
- GET `/api/orders/` - List orders
- POST `/api/orders/checkout/` - Place order
- POST `/api/orders/{id}/cancel/` - Cancel order

### Payments
- POST `/api/payments/initiate/` - Initiate M-Pesa payment
- GET `/api/payments/` - List payments

### Admin
- GET `/api/admin/stats/` - Dashboard statistics
- GET `/api/admin/users/` - List all users
- POST `/api/admin/users/{id}/block/` - Block user

## Project Structure

```
online_shop/
├── online_shop/          # Django project settings
├── accounts/            # User authentication
├── products/            # Product management
├── orders/              # Order management
├── payments/           # Payment handling
├── requirements.txt
└── manage.py

frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

## Deployment to Render

1. Set Root Directory to `backend`
2. Configure environment variables in Render dashboard (`PYTHON_VERSION=3.12.8` recommended)
3. Set build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
4. Set start command: `python manage.py migrate && gunicorn online_shop.wsgi:application`

## License

MIT License
