"""
配置管理
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    database_name: str = "renqing"

    # API
    api_title: str = "人情簿 API"
    api_version: str = "1.0.0"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
