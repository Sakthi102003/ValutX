from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ValutX"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_RANDOM_KEY_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    # Database
    DATABASE_URL: str = "sqlite:///./valutx.db"

    # CORS
    # We include your production URL here as a default fallback
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://127.0.0.1:5173",
        "https://valut-x.vercel.app"
    ]

    class Config:
        case_sensitive = True
        # This allows you to pass a comma-separated string in Render
        # and Pydantic will try to parse it, but we'll handle it in main.py too.
        env_prefix = ""

settings = Settings()
