from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ValutX"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_RANDOM_KEY_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    # Database
    DATABASE_URL: str = "sqlite:///./valutx.db"

    # CORS
    CORS_ORIGINS: list[str] | str = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    @property
    def get_cors_origins(self) -> list[str]:
        if isinstance(self.CORS_ORIGINS, str):
            # Split by comma and strip whitespace AND trailing slashes
            return [i.strip().rstrip("/") for i in self.CORS_ORIGINS.split(",") if i.strip()]
        # Also clean up the default list just in case
        return [i.rstrip("/") for i in self.CORS_ORIGINS]

    class Config:
        case_sensitive = True

settings = Settings()
