from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Auth & Profile ----------

class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    age: int | None
    height_cm: float | None
    goal: str
    activity_level: str
    calorie_target: int
    protein_target: int
    carbs_target: int
    fat_target: int


class TokenOut(BaseModel):
    access_token: str
    user: UserOut


class ProfileUpdate(BaseModel):
    name: str | None = None
    age: int | None = None
    height_cm: float | None = None
    goal: str | None = None
    activity_level: str | None = None
    calorie_target: int | None = None
    protein_target: int | None = None
    carbs_target: int | None = None
    fat_target: int | None = None


# ---------- Workouts ----------

class ExerciseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    muscle_group: str


class SetIn(BaseModel):
    exercise_id: int
    reps: int = Field(gt=0)
    weight_kg: float = Field(ge=0, default=0)


class WorkoutIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    date: date
    notes: str | None = None
    sets: list[SetIn] = []


class SetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reps: int
    weight_kg: float
    exercise: ExerciseOut


class WorkoutOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    date: date
    notes: str | None
    sets: list[SetOut]


class ProgressPoint(BaseModel):
    date: date
    best_weight: float
    volume: float


# ---------- Nutrition ----------

class FoodIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    serving: str = "1 serving"
    calories: float = Field(ge=0)
    protein: float = Field(ge=0, default=0)
    carbs: float = Field(ge=0, default=0)
    fat: float = Field(ge=0, default=0)


class FoodOut(FoodIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None


class FoodLogIn(BaseModel):
    food_id: int
    date: date
    meal: str = "breakfast"
    servings: float = Field(gt=0, default=1)


class FoodLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date: date
    meal: str
    servings: float
    food: FoodOut


class NutritionTotals(BaseModel):
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0


class DaySummary(BaseModel):
    date: date
    totals: NutritionTotals
    targets: NutritionTotals


class WeekDay(BaseModel):
    date: date
    calories: float


# ---------- Body Metrics ----------

class MetricIn(BaseModel):
    date: date
    weight_kg: float = Field(gt=0)
    body_fat: float | None = None
    chest_cm: float | None = None
    waist_cm: float | None = None
    arm_cm: float | None = None


class MetricOut(MetricIn):
    model_config = ConfigDict(from_attributes=True)

    id: int


# ---------- Dashboard ----------

class DashboardOut(BaseModel):
    today: DaySummary
    workouts_this_week: int
    total_workouts: int
    last_workout: WorkoutOut | None
    latest_weight: float | None
    weight_change: float | None  # change since the first entry
