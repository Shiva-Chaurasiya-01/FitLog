from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))

    # Profile
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    goal: Mapped[str] = mapped_column(String(20), default="maintain")  # lose / maintain / gain
    activity_level: Mapped[str] = mapped_column(String(20), default="moderate")  # low / moderate / high

    # Daily nutrition targets
    calorie_target: Mapped[int] = mapped_column(Integer, default=2000)
    protein_target: Mapped[int] = mapped_column(Integer, default=120)
    carbs_target: Mapped[int] = mapped_column(Integer, default=250)
    fat_target: Mapped[int] = mapped_column(Integer, default=60)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    muscle_group: Mapped[str] = mapped_column(String(50))


class Workout(Base):
    __tablename__ = "workouts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    date: Mapped[date] = mapped_column(Date)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    sets: Mapped[list["WorkoutSet"]] = relationship(
        back_populates="workout", cascade="all, delete-orphan", order_by="WorkoutSet.id", lazy="selectin"
    )


class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id: Mapped[int] = mapped_column(primary_key=True)
    workout_id: Mapped[int] = mapped_column(ForeignKey("workouts.id", ondelete="CASCADE"), index=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id"))
    reps: Mapped[int] = mapped_column(Integer)
    weight_kg: Mapped[float] = mapped_column(Float, default=0)

    workout: Mapped["Workout"] = relationship(back_populates="sets")
    exercise: Mapped["Exercise"] = relationship(lazy="selectin")


class Food(Base):
    __tablename__ = "foods"

    id: Mapped[int] = mapped_column(primary_key=True)
    # user_id is empty for the built-in foods, and set for a user's custom foods
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name: Mapped[str] = mapped_column(String(100))
    serving: Mapped[str] = mapped_column(String(50))  # e.g. "100 g", "1 piece"
    calories: Mapped[float] = mapped_column(Float)
    protein: Mapped[float] = mapped_column(Float, default=0)
    carbs: Mapped[float] = mapped_column(Float, default=0)
    fat: Mapped[float] = mapped_column(Float, default=0)


class FoodLog(Base):
    __tablename__ = "food_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.id", ondelete="CASCADE"))
    date: Mapped[date] = mapped_column(Date)
    meal: Mapped[str] = mapped_column(String(20))  # breakfast / lunch / dinner / snack
    servings: Mapped[float] = mapped_column(Float, default=1)

    food: Mapped["Food"] = relationship(lazy="selectin")


class BodyMetric(Base):
    __tablename__ = "body_metrics"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    date: Mapped[date] = mapped_column(Date)
    weight_kg: Mapped[float] = mapped_column(Float)
    body_fat: Mapped[float | None] = mapped_column(Float, nullable=True)
    chest_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    waist_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    arm_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
