from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ContentRadar API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    
    # Redis / Celery
    REDIS_URL: str
    
    # Security
    AUTH_SECRET: str
    FRONTEND_URL: str
    BACKEND_URL: str
    
    # Platform APIs
    YOUTUBE_CLIENT_ID: str | None = None
    YOUTUBE_CLIENT_SECRET: str | None = None
    TIKTOK_CLIENT_KEY: str | None = None
    TIKTOK_CLIENT_SECRET: str | None = None
    META_APP_ID: str | None = None
    META_APP_SECRET: str | None = None
    
    # Embeddings
    EMBEDDING_PROVIDER: str = "real"
    EMBEDDING_API_KEY: str | None = None

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
