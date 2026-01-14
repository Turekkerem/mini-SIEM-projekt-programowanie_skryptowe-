import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-bardzo-tajny')
    
    # Baza danych
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///../instance/lab7.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Konfiguracja SSH (Domyślne dla Vagranta)
    SSH_DEFAULT_USER = os.getenv('SSH_DEFAULT_USER', 'kali')
    SSH_DEFAULT_PORT = int(os.getenv('SSH_DEFAULT_PORT', 22))


    # Folder na logi (Parquet)
    STORAGE_FOLDER = Path.cwd() / 'storage' # Domyślny folder na logi

    SSH_DEFAULT_USER = 'kali' 
    SSH_DEFAULT_PORT = 22
    SSH_PASSWORD = "kali"   
    SSH_KEY_FILE = None
