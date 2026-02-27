from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ELEVENLABS_API_KEY: str
    AGENT_ID: str
    DATABASE_URL: str
    FRONTEND_ORIGIN: str
    WEBHOOK_SECRET: str
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()