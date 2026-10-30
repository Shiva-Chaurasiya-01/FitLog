from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import BodyMetric, User, Workout
from app.routers.nutrition import day_summary
from app.schemas import DashboardOut
from app.security import get_current_user

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard", response_model=DashboardOut)
async def dashboard(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())  # Monday of this week

    total_workouts = await db.scalar(select(func.count(Workout.id)).where(Workout.user_id == user.id))
    workouts_this_week = await db.scalar(
        select(func.count(Workout.id)).where(Workout.user_id == user.id, Workout.date >= week_start)
    )
    last_workout = await db.scalar(
        select(Workout).where(Workout.user_id == user.id).order_by(Workout.date.desc(), Workout.id.desc()).limit(1)
    )

    metrics = (
        await db.scalars(
            select(BodyMetric).where(BodyMetric.user_id == user.id).order_by(BodyMetric.date, BodyMetric.id)
        )
    ).all()
    latest_weight = metrics[-1].weight_kg if metrics else None
    weight_change = round(metrics[-1].weight_kg - metrics[0].weight_kg, 1) if metrics else None

    return {
        "today": await day_summary(db, user, today),
        "workouts_this_week": workouts_this_week,
        "total_workouts": total_workouts,
        "last_workout": last_workout,
        "latest_weight": latest_weight,
        "weight_change": weight_change,
    }
