@echo off
echo Activating virtual environment...
call venv\Scripts\activate.bat
set DEBUG=True
set FORCE_HTTPS=False
echo Starting Django server...
python manage.py runserver 8000
