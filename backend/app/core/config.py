from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ValutX"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_RANDOM_KEY_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    # Database
    DATABASE_URL: str = "sqlite:///./valutx.db"

    class Config:
        case_sensitive = True

settings = Settings()
