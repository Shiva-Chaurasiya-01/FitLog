from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Exercise, User, Workout, WorkoutSet
from app.schemas import ExerciseOut, ProgressPoint, WorkoutIn, WorkoutOut
from app.security import get_current_user

router = APIRouter(tags=["Workouts"])


async def get_user_workout(db: AsyncSession, workout_id: int, user_id: int) -> Workout:
    workout = await db.scalar(
        select(Workout)
        .where(Workout.id == workout_id, Workout.user_id == user_id)
        .execution_options(populate_existing=True)
    )
    if workout is None:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout


@router.get("/exercises", response_model=list[ExerciseOut])
async def list_exercises(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.scalars(select(Exercise).order_by(Exercise.muscle_group, Exercise.name))
    return result.all()


@router.get("/exercises/{exercise_id}/progress", response_model=list[ProgressPoint])
async def exercise_progress(
    exercise_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # All sets of this exercise done by the user, oldest first
    rows = await db.execute(
        select(Workout.date, WorkoutSet.reps, WorkoutSet.weight_kg)
        .join(Workout, WorkoutSet.workout_id == Workout.id)
        .where(Workout.user_id == user.id, WorkoutSet.exercise_id == exercise_id)
        .order_by(Workout.date)
    )

    # Group by date: best weight lifted and total volume (reps x weight)
    progress = {}
    for workout_date, reps, weight in rows:
        if workout_date not in progress:
            progress[workout_date] = {"date": workout_date, "best_weight": 0, "volume": 0}
        point = progress[workout_date]
        point["best_weight"] = max(point["best_weight"], weight)
        point["volume"] += reps * weight
    return list(progress.values())


@router.get("/workouts", response_model=list[WorkoutOut])
async def list_workouts(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.scalars(
        select(Workout).where(Workout.user_id == user.id).order_by(Workout.date.desc(), Workout.id.desc())
    )
    return result.all()


@router.post("/workouts", response_model=WorkoutOut)
async def create_workout(
    data: WorkoutIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    workout = Workout(user_id=user.id, name=data.name, date=data.date, notes=data.notes)
    for s in data.sets:
        if await db.get(Exercise, s.exercise_id) is None:
            raise HTTPException(status_code=400, detail=f"Exercise {s.exercise_id} does not exist")
        workout.sets.append(WorkoutSet(exercise_id=s.exercise_id, reps=s.reps, weight_kg=s.weight_kg))

    db.add(workout)
    await db.commit()
    return await get_user_workout(db, workout.id, user.id)


@router.get("/workouts/{workout_id}", response_model=WorkoutOut)
async def get_workout(
    workout_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await get_user_workout(db, workout_id, user.id)


@router.delete("/workouts/{workout_id}")
async def delete_workout(
    workout_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    workout = await get_user_workout(db, workout_id, user.id)
    await db.delete(workout)
    await db.commit()
    return {"message": "Workout deleted"}
