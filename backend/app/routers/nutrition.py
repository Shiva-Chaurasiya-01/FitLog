from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Food, FoodLog, User
from app.schemas import DaySummary, FoodIn, FoodLogIn, FoodLogOut, FoodOut, WeekDay
from app.security import get_current_user

router = APIRouter(tags=["Nutrition"])

MEALS = ["breakfast", "lunch", "dinner", "snack"]


async def day_totals(db: AsyncSession, user_id: int, day: date) -> dict:
    # Adds up calories and macros of everything eaten on one day
    logs = await db.scalars(select(FoodLog).where(FoodLog.user_id == user_id, FoodLog.date == day))
    totals = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    for log in logs:
        totals["calories"] += log.food.calories * log.servings
        totals["protein"] += log.food.protein * log.servings
        totals["carbs"] += log.food.carbs * log.servings
        totals["fat"] += log.food.fat * log.servings
    return {key: round(value, 1) for key, value in totals.items()}


async def day_summary(db: AsyncSession, user: User, day: date) -> dict:
    return {
        "date": day,
        "totals": await day_totals(db, user.id, day),
        "targets": {
            "calories": user.calorie_target,
            "protein": user.protein_target,
            "carbs": user.carbs_target,
            "fat": user.fat_target,
        },
    }


# ---------- Foods ----------

@router.get("/foods", response_model=list[FoodOut])
async def list_foods(
    search: str = "",
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Built-in foods (no user) + this user's custom foods
    query = select(Food).where(or_(Food.user_id.is_(None), Food.user_id == user.id))
    if search:
        query = query.where(Food.name.ilike(f"%{search}%"))
    result = await db.scalars(query.order_by(Food.name))
    return result.all()


@router.post("/foods", response_model=FoodOut)
async def create_food(
    data: FoodIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    food = Food(user_id=user.id, **data.model_dump())
    db.add(food)
    await db.commit()
    await db.refresh(food)
    return food


# ---------- Food logs ----------

@router.get("/food-logs", response_model=list[FoodLogOut])
async def list_food_logs(
    day: date | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    day = day or date.today()
    result = await db.scalars(
        select(FoodLog).where(FoodLog.user_id == user.id, FoodLog.date == day).order_by(FoodLog.id)
    )
    return result.all()


@router.post("/food-logs", response_model=FoodLogOut)
async def create_food_log(
    data: FoodLogIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if data.meal not in MEALS:
        raise HTTPException(status_code=400, detail=f"Meal must be one of {MEALS}")

    food = await db.get(Food, data.food_id)
    if food is None or (food.user_id is not None and food.user_id != user.id):
        raise HTTPException(status_code=404, detail="Food not found")

    log = FoodLog(user_id=user.id, **data.model_dump())
    db.add(log)
    await db.commit()
    await db.refresh(log, ["food"])
    return log


@router.delete("/food-logs/{log_id}")
async def delete_food_log(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    log = await db.get(FoodLog, log_id)
    if log is None or log.user_id != user.id:
        raise HTTPException(status_code=404, detail="Food log not found")
    await db.delete(log)
    await db.commit()
    return {"message": "Food log deleted"}


# ---------- Summaries ----------

@router.get("/nutrition/summary", response_model=DaySummary)
async def nutrition_summary(
    day: date | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await day_summary(db, user, day or date.today())


@router.get("/nutrition/week", response_model=list[WeekDay])
async def nutrition_week(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    # Calories for the last 7 days, oldest first
    today = date.today()
    start = today - timedelta(days=6)
    calories = {start + timedelta(days=i): 0 for i in range(7)}

    # One query for the whole week, then add up per day
    logs = await db.scalars(
        select(FoodLog).where(FoodLog.user_id == user.id, FoodLog.date >= start, FoodLog.date <= today)
    )
    for log in logs:
        calories[log.date] += log.food.calories * log.servings

    return [{"date": day, "calories": round(total, 1)} for day, total in calories.items()]
