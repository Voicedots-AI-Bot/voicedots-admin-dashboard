from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ELEVENLABS_API_KEY: str
    AGENT_ID: str
    DATABASE_URL: str
    FRONTEND_ORIGIN: str
    WEBHOOK_SECRET: str
    STUDENTS_IDS: list[str]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()