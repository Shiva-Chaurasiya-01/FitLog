from sqlalchemy import func, select

from app.database import SessionLocal
from app.models import Exercise, Food

# (name, muscle group)
EXERCISES = [
    ("Bench Press", "Chest"),
    ("Incline Dumbbell Press", "Chest"),
    ("Push Up", "Chest"),
    ("Chest Fly", "Chest"),
    ("Deadlift", "Back"),
    ("Pull Up", "Back"),
    ("Lat Pulldown", "Back"),
    ("Barbell Row", "Back"),
    ("Seated Cable Row", "Back"),
    ("Squat", "Legs"),
    ("Leg Press", "Legs"),
    ("Lunges", "Legs"),
    ("Leg Curl", "Legs"),
    ("Leg Extension", "Legs"),
    ("Calf Raise", "Legs"),
    ("Overhead Press", "Shoulders"),
    ("Lateral Raise", "Shoulders"),
    ("Face Pull", "Shoulders"),
    ("Bicep Curl", "Arms"),
    ("Hammer Curl", "Arms"),
    ("Tricep Pushdown", "Arms"),
    ("Skull Crusher", "Arms"),
    ("Dips", "Arms"),
    ("Plank", "Core"),
    ("Crunches", "Core"),
    ("Hanging Leg Raise", "Core"),
]

# (name, serving, calories, protein, carbs, fat)
FOODS = [
    ("Roti (Chapati)", "1 piece", 120, 3, 18, 3.7),
    ("White Rice (cooked)", "1 cup", 205, 4.3, 45, 0.4),
    ("Brown Rice (cooked)", "1 cup", 216, 5, 45, 1.8),
    ("Dal (cooked)", "1 bowl", 180, 12, 30, 1.5),
    ("Rajma Curry", "1 bowl", 210, 9, 30, 6),
    ("Chole Curry", "1 bowl", 240, 10, 35, 7),
    ("Paneer", "100 g", 265, 18, 1.2, 20.8),
    ("Curd (Dahi)", "1 cup", 150, 8, 11, 8),
    ("Milk (toned)", "1 glass", 120, 6, 10, 6),
    ("Boiled Egg", "1 egg", 78, 6.3, 0.6, 5.3),
    ("Egg Omelette", "2 eggs", 190, 13, 1, 15),
    ("Chicken Breast (cooked)", "100 g", 165, 31, 0, 3.6),
    ("Chicken Curry", "1 bowl", 290, 25, 8, 17),
    ("Fish (cooked)", "100 g", 206, 22, 0, 12),
    ("Poha", "1 plate", 250, 5, 45, 6),
    ("Upma", "1 plate", 230, 6, 35, 7),
    ("Idli", "1 piece", 58, 2, 12, 0.4),
    ("Dosa (plain)", "1 piece", 168, 4, 29, 3.7),
    ("Oats (dry)", "40 g", 150, 5, 27, 2.5),
    ("Banana", "1 medium", 105, 1.3, 27, 0.4),
    ("Apple", "1 medium", 95, 0.5, 25, 0.3),
    ("Peanut Butter", "1 tbsp", 95, 4, 3, 8),
    ("Peanuts", "30 g", 170, 7.5, 5, 14),
    ("Almonds", "30 g", 170, 6, 6, 15),
    ("Whey Protein", "1 scoop", 120, 24, 3, 1.5),
    ("Bread (brown)", "1 slice", 75, 3, 13, 1),
    ("Soya Chunks (dry)", "50 g", 172, 26, 16, 0.3),
    ("Sprouts Salad", "1 bowl", 120, 8, 20, 1),
    ("Mixed Veg Sabzi", "1 bowl", 150, 4, 15, 8),
    ("Samosa", "1 piece", 260, 4, 30, 14),
]


async def seed_data():
    # Adds exercises and foods only when the tables are empty
    async with SessionLocal() as db:
        if await db.scalar(select(func.count(Exercise.id))) == 0:
            for name, muscle in EXERCISES:
                db.add(Exercise(name=name, muscle_group=muscle))

        if await db.scalar(select(func.count(Food.id)).where(Food.user_id.is_(None))) == 0:
            for name, serving, calories, protein, carbs, fat in FOODS:
                db.add(Food(name=name, serving=serving, calories=calories, protein=protein, carbs=carbs, fat=fat))

        await db.commit()
