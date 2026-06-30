import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # API Keys & Secrets
    FAL_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None
    KLING_API_KEY: Optional[str] = None
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    WEBHOOK_SECRET: Optional[str] = "development-secret-token"

    # Base URLs
    KLING_BASE_URL: str = "https://api.klingai.com"
    WEBHOOK_BASE_URL: str = "http://localhost:8000"

    # Environment
    ENV: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def __init__(self, **values):
        super().__init__(**values)
        # Handle fal-client requirement for FAL_KEY environment variable
        if self.FAL_API_KEY:
            os.environ["FAL_KEY"] = self.FAL_API_KEY
        
        # Handle Google API Key synchronization / fallbacks
        if self.GEMINI_API_KEY and not self.GOOGLE_API_KEY:
            self.GOOGLE_API_KEY = self.GEMINI_API_KEY
        elif self.GOOGLE_API_KEY and not self.GEMINI_API_KEY:
            self.GEMINI_API_KEY = self.GOOGLE_API_KEY

        if self.GOOGLE_API_KEY:
            os.environ["GOOGLE_API_KEY"] = self.GOOGLE_API_KEY
        if self.GEMINI_API_KEY:
            os.environ["GEMINI_API_KEY"] = self.GEMINI_API_KEY


# Global settings instance
settings = Settings()
