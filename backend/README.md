# Online Shop - Full-Stack E-Commerce System

A complete full-stack e-commerce platform built with Django REST Framework and React.

## Features

### Customer Features
- User registration and login
- Browse products with search and category filtering
- View product details
- Post products with images and videos
- View own posted products and status (pending/approved/rejected)

### Admin Features
- Statistics dashboard (users and products)
- User management (view, block, remove users)
- Product management (approve pending products)

## Tech Stack

- **Backend:** Django + Django REST Framework (Python)
- **Database:** SQLite (default Django database)
- **Authentication:** JWT
- **Frontend:** React 18 + Vite

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
- GET `/api/auth/me/` - Current user info

### Products
- GET `/api/products/` - List all approved products
- POST `/api/products/` - Create product (authenticated)
- GET `/api/products/my/` - My products
- POST `/api/products/{id}/approve/` - Approve product (admin)
- GET `/api/products/pending/` - Pending products (admin)

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
