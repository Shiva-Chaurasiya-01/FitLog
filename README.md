# FitLog

A fitness and nutrition tracking app. Log workouts, track daily calories and macros, record body measurements, and see everything on one dashboard.

- **Backend:** FastAPI + async SQLAlchemy 2.0 + PostgreSQL (Neon), JWT login, Argon2 password hashing, managed with **uv**
- **Frontend:** React Native (Expo), JavaScript / JSX, black & purple theme

## Folder structure

```
FitLog/
├── backend/
│   ├── pyproject.toml        # Python packages (managed by uv)
│   ├── .env                  # Database URL and secret key (not shared)
│   ├── .env.example          # Example of the .env file
│   └── app/
│       ├── main.py           # Starts the API, creates tables, adds routers
│       ├── config.py         # Reads settings from .env
│       ├── database.py       # Database connection + create_tables()
│       ├── models.py         # Database tables
│       ├── schemas.py        # Request / response shapes (Pydantic)
│       ├── security.py       # Password hashing, JWT tokens, current user
│       ├── seed.py           # Built-in exercises and foods
│       └── routers/
│           ├── auth.py       # Register, login, profile
│           ├── workouts.py   # Exercises, workouts, exercise progress
│           ├── nutrition.py  # Foods, food logs, daily/weekly summary
│           ├── metrics.py    # Body weight and measurements
│           └── dashboard.py  # Everything for the home screen
│
└── frontend/
    ├── App.jsx               # App entry: navigation + login state
    ├── .env                  # Backend address
    └── src/
        ├── api.js            # Axios setup for calling the backend
        ├── theme.js          # Colors
        ├── utils.js          # Date helpers and popups
        ├── context/          # AuthContext (login / logout)
        ├── navigation/       # Bottom tabs + screen stack
        ├── components/       # Button, Input, Card, ProgressBar, BarChart...
        └── screens/
            ├── auth/         # Login, Register
            ├── workouts/     # Workout list, new workout, detail, progress
            ├── nutrition/    # Food diary, add food, custom food
            ├── HomeScreen.jsx     # Dashboard
            ├── MetricsScreen.jsx  # Body metrics
            └── ProfileScreen.jsx  # Profile and daily targets
```

## Modules

| Module | What it does |
|---|---|
| Auth & Profile | Sign up, log in, edit age/height/goal/activity and daily calorie & macro targets |
| Workout Tracking | Log workouts with exercises, sets, reps and weight. See history and best weight per exercise |
| Nutrition Logging | Add foods to breakfast/lunch/dinner/snacks, see calories and macros vs targets, 7-day chart. 30 built-in foods + your own custom foods |
| Body Metrics | Record weight, body fat, chest, waist, arm. See weight trend |
| Dashboard | Today's calories & macros, workouts this week, latest weight and change, last workout |

## How to run

### 1. Backend

You need [uv](https://docs.astral.sh/uv/) installed.

```bash
cd backend
uv sync
```

Copy `.env.example` to `.env` and put in your Neon database URL and a secret key. Then start the server:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Tables are created automatically when the server starts (no Alembic), and the built-in exercises and foods are added the first time.

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npx expo start
```

- Press **w** to open in the browser, or scan the QR code with the **Expo Go** app on your phone.
- **On a real phone:** `127.0.0.1` means the phone itself, so it can't reach your computer. Open `frontend/.env` and change it to your computer's Wi-Fi IP (find it with `ipconfig`), for example:
  ```
  EXPO_PUBLIC_API_URL=http://192.168.1.5:8000/api
  ```
  Then restart `npx expo start`. Phone and computer must be on the same Wi-Fi.

## API endpoints

All endpoints start with `/api`. Everything except register and login needs the header `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | /auth/register | Create account, returns token |
| POST | /auth/login | Log in, returns token |
| GET / PUT | /auth/me | Get / update profile and targets |
| GET | /exercises | List of exercises |
| GET | /exercises/{id}/progress | Best weight and volume per day |
| GET / POST | /workouts | List / create workout (with sets) |
| GET / DELETE | /workouts/{id} | Workout detail / delete |
| GET / POST | /foods | Search foods / add custom food |
| GET / POST | /food-logs | Food eaten on a day / log a food |
| DELETE | /food-logs/{id} | Remove a logged food |
| GET | /nutrition/summary | Totals vs targets for a day |
| GET | /nutrition/week | Calories for the last 7 days |
| GET / POST | /metrics | Body metric history / add entry |
| DELETE | /metrics/{id} | Delete an entry |
| GET | /dashboard | Data for the home screen |
# FitLog
