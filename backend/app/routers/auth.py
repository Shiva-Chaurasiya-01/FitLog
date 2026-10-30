from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import LoginIn, ProfileUpdate, RegisterIn, TokenOut, UserOut
from app.security import create_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Auth & Profile"])


@router.post("/register", response_model=TokenOut)
async def register(data: RegisterIn, db: AsyncSession = Depends(get_db)):
    email = data.email.lower()
    existing = await db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = User(name=data.name, email=email, password_hash=hash_password(data.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"access_token": create_token(user.id), "user": user}


@router.post("/login", response_model=TokenOut)
async def login(data: LoginIn, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == data.email.lower()))
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    return {"access_token": create_token(user.id), "user": user}


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserOut)
async def update_me(
    data: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Only update the fields that were sent
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user
