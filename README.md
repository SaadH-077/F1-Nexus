# F1 Nexus

A full-stack Formula 1 analytics platform featuring live standings, race results, telemetry visualisation, race predictions, strategy simulation, AI-generated race analysis, and session email reminders.

---

## Features

| Feature | Description |
|---|---|
| **Hub** | Live championship standings, next race countdown, last race results, sprint winner, latest F1 news |
| **Telemetry** | Lap-by-lap speed, throttle, brake, gear, RPM and track position charts per driver per session |
| **Race Predictor** | XGBoost model trained on 2024–25 season data, augmented with live 2026 standings, outputs win/podium probabilities |
| **Strategy Simulator** | Monte Carlo tyre strategy simulation — pick driver, track, compounds, stops and get predicted finish |
| **AI Analyst** | LLM-generated post-race analysis (pit stops, sector deltas, top 3 breakdown) powered by Llama 3.2 via Ollama |
| **Paddock** | 2026 driver grid with portraits, country flags, team colours and career stats |
| **Historical** | Head-to-head constructor comparison across all F1 eras (1950–present) |
| **Email Reminders** | Subscribe to receive an email 15 minutes before Qualifying, Sprint, and Race sessions |

---

## Tech Stack

### Frontend
- **Next.js 16** (App Router, React 19, TypeScript)
- **Tailwind CSS v4**
- Deployed on **Vercel** (recommended)

### Backend
- **FastAPI** (Python 3.11)
- **FastF1** — official F1 telemetry & session data
- **XGBoost + scikit-learn** — prediction model
- **Ollama / Llama 3.2** — AI race analyst
- **SQLite** — subscriber storage
- **SMTP** — session reminder emails
- Deployed on **Railway / Render / Docker** (recommended)

---

## Project Structure

```
AntiGravity-Test/
├── backend/                    # FastAPI backend
│   ├── main.py                 # App entry point + scheduler
│   ├── config.py               # Settings (reads .env)
│   ├── database.py             # SQLAlchemy engine + session
│   ├── models.py               # DB models (Subscriber, etc.)
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example            # Copy to .env and fill in secrets
│   ├── routers/
│   │   ├── standings.py        # Driver & constructor standings
│   │   ├── races.py            # Schedule, results, next race
│   │   ├── telemetry.py        # FastF1 lap telemetry
│   │   ├── predictor.py        # Win/podium probability model
│   │   ├── strategy.py         # Monte Carlo tyre strategy
│   │   ├── analyst.py          # AI race analysis
│   │   ├── news.py             # F1 news aggregation
│   │   └── subscribers.py      # Email subscription + reminders
│   └── services/
│       ├── fastf1_service.py   # FastF1 session loader
│       ├── jolpica_client.py   # Jolpica/Ergast F1 API client
│       ├── openf1_client.py    # OpenF1 API client
│       ├── prediction_model.py # XGBoost predictor logic
│       ├── strategy_engine.py  # Strategy simulation engine
│       └── ai_analyst.py       # Ollama LLM analysis
├── f1-nexus/                   # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Hub (home)
│   │   │   ├── telemetry/      # Telemetry viewer
│   │   │   ├── predictor/      # Race predictor
│   │   │   ├── strategy/       # Strategy simulator
│   │   │   ├── analyst/        # AI analyst
│   │   │   ├── paddock/        # 2026 driver grid
│   │   │   ├── historical/     # Constructor comparison
│   │   │   └── team/[id]/      # Team detail page
│   │   ├── components/         # Shared UI components
│   │   └── lib/
│   │       ├── api.ts          # All backend API calls + types
│   │       └── articles.ts     # Static article data
│   └── public/
│       ├── circuits/           # Track layout images (.webp)
│       ├── drivers/            # Driver portrait photos (.webp)
│       ├── logos/              # Constructor logos (.webp)
│       └── tracks/             # Track map images (.png)
└── docker-compose.yml          # Full-stack Docker setup
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- [Ollama](https://ollama.com) (for AI analyst feature)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/f1-nexus.git
cd f1-nexus
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure secrets
cp .env.example .env
# Edit .env — add SMTP credentials if you want email reminders

# Pull the AI model (optional — needed for AI Analyst feature)
ollama pull llama3.2

# Start the backend
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### 3. Frontend setup

```bash
cd f1-nexus
npm install

# Optional: point at a remote backend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
```

Frontend runs at `http://localhost:3000`

### 4. Docker (full-stack)

The entire stack — frontend, backend, and Ollama LLM — runs in containers orchestrated by Docker Compose.

```bash
# 1. Copy and configure the environment file
cp .env.example .env
# Edit .env with your SMTP credentials and desired settings

# 2. Build and start all services
docker-compose up --build

# 3. On first run, pull the AI model into Ollama
docker exec f1-nexus-ollama ollama pull llama3.2
```

| Service | Container | Port |
|---|---|---|
| Next.js Frontend | `f1-nexus-frontend` | `3000` |
| FastAPI Backend | `f1-nexus-backend` | `8000` |
| Ollama (LLM) | `f1-nexus-ollama` | `11434` |

**Useful Docker commands:**

```bash
# Run in background (detached)
docker-compose up -d --build

# View logs for a specific service
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (full reset including cache and DB)
docker-compose down -v

# Rebuild a single service after a code change
docker-compose up -d --build backend
```

**What's inside each image:**

- **Backend** — Multi-stage Python 3.11-slim. Stage 1 compiles dependencies with gcc; Stage 2 copies only the installed packages (no build tools). Runs as a non-root user. FastF1 cache and the SQLite subscriber database are persisted in a named Docker volume.
- **Frontend** — Multi-stage Node 20-alpine. Stage 1 installs deps, Stage 2 runs `next build` with `output: "standalone"`, Stage 3 copies only the self-contained bundle (~50 MB vs 500 MB full build). Runs as a non-root user.
- **Ollama** — Official image with model weights stored in a named volume so they survive container restarts.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | _(empty)_ | Your email address |
| `SMTP_PASS` | _(empty)_ | Gmail App Password |
| `SMTP_FROM_NAME` | `F1 Nexus` | Sender display name |
| `APP_URL` | `http://localhost:3000` | Public URL shown in reminder emails |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.2` | Model used for AI analysis |

**Gmail App Password setup:**
1. Enable 2-Factor Authentication on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate a password for "Mail" and paste it as `SMTP_PASS`

### Frontend (`f1-nexus/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## Email Reminders

Subscribers receive an email **15 minutes before** each of these sessions:
- Free Practice sessions
- Sprint Qualifying
- Sprint Race
- Qualifying
- Race

The scheduler runs as a background task inside the FastAPI process (no external cron required).

---

## Deployment

### Frontend → Vercel

1. Push the repo to GitHub
2. Import the `f1-nexus` folder as a new project on [vercel.com](https://vercel.com)
3. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL in Vercel environment variables

### Backend → Railway / Render

1. Connect your GitHub repo
2. Set the root directory to `backend/`
3. Set the start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
4. Add all environment variables from `.env.example`

### Full-stack → Docker (VPS / Cloud VM)

Deploy on any Linux server with Docker installed (DigitalOcean Droplet, AWS EC2, etc.):

```bash
# On your server
git clone https://github.com/your-username/f1-nexus.git
cd f1-nexus
cp .env.example .env
nano .env              # Set SMTP credentials and APP_URL to your domain

docker-compose up -d --build

# Pull the LLM (once)
docker exec f1-nexus-ollama ollama pull llama3.2
```

Point your domain / reverse proxy (nginx, Caddy) at:
- `localhost:3000` → frontend
- `localhost:8000` → backend API

---

## Data Sources

| Source | Usage |
|---|---|
| [FastF1](https://github.com/theOehrly/Fast-F1) | Telemetry, lap times, sector data |
| [Jolpica/Ergast F1 API](https://api.jolpi.ca) | Standings, schedule, race results |
| [OpenF1 API](https://openf1.org) | Real-time session data |
| [flagcdn.com](https://flagcdn.com) | Country flag images |
| [Wikipedia](https://en.wikipedia.org) | Circuit information |

---

## License

MIT
