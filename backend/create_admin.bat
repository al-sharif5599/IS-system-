@echo off
echo Creating admin user...
call venv\Scripts\activate.bat
python manage.py shell -c "from accounts.models import User; User.objects.filter(email='admin@admin.com').exists() or User.objects.create_superuser('admin@admin.com', 'admin123', is_staff=True, is_superuser=True, is_admin=True)"
echo.
echo Admin user created!
echo Email: admin@admin.com
echo Password: admin123
pause
