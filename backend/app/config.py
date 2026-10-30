from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # These values are read from the .env file
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 1 day

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
