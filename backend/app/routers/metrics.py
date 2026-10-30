from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import BodyMetric, User
from app.schemas import MetricIn, MetricOut
from app.security import get_current_user

router = APIRouter(prefix="/metrics", tags=["Body Metrics"])


@router.get("", response_model=list[MetricOut])
async def list_metrics(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    # Oldest first, so the app can draw a trend from left to right
    result = await db.scalars(
        select(BodyMetric).where(BodyMetric.user_id == user.id).order_by(BodyMetric.date, BodyMetric.id)
    )
    return result.all()


@router.post("", response_model=MetricOut)
async def create_metric(
    data: MetricIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    metric = BodyMetric(user_id=user.id, **data.model_dump())
    db.add(metric)
    await db.commit()
    await db.refresh(metric)
    return metric


@router.delete("/{metric_id}")
async def delete_metric(
    metric_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    metric = await db.get(BodyMetric, metric_id)
    if metric is None or metric.user_id != user.id:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.delete(metric)
    await db.commit()
    return {"message": "Entry deleted"}
