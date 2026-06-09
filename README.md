# 🏎️ F1 Nexus — Full-Stack Formula 1 Analytics Platform

<p align="center">
  <a href="https://f1-nexus-wheat.vercel.app/"><img alt="Live Demo" src="https://img.shields.io/badge/Live_Demo-f1--nexus.vercel.app-e00700?style=for-the-badge&logo=vercel&logoColor=white"></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white">
  <img alt="Python" src="https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-555?style=for-the-badge">
</p>

> A full-stack Formula 1 analytics platform: **live timing**, championship standings, telemetry visualisation, ML race predictions, Monte-Carlo strategy simulation, AI-generated race analysis, and session email reminders.

**▶ Live app: [f1-nexus-wheat.vercel.app](https://f1-nexus-wheat.vercel.app/)**

![F1 Nexus App Preview](App%20Design/Promotions/93shots_so.png)

![F1 Nexus App Preview 2](App%20Design/Promotions/731shots_so.png)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Hub** | Live championship standings, next-race countdown, last-race results, sprint winner, and a rolling F1 news ticker |
| **Live Timing** | Real-time timing tower, track map, sector times, and race-control feed during a live session (polls OpenF1 every 3s); next-race countdown when idle |
| **Telemetry** | Lap-by-lap speed, throttle, brake, gear, RPM and track-position charts per driver per session (FastF1) |
| **Race Predictor** | XGBoost model trained on 2024–25 data, augmented with live 2026 standings — outputs win / podium probabilities |
| **Strategy Simulator** | Monte-Carlo tyre-strategy simulation — pick driver, track, compounds and stops to get a predicted finish |
| **AI Analyst** | LLM-generated post-race analysis (pit stops, sector deltas, top-3 breakdown) via Ollama / Llama 3.2, with a rule-based fallback |
| **Paddock** | 2026 driver grid with portraits, country flags, team colours, live WDC/WCC positions and career-stat modals |
| **Historical** | Head-to-head constructor comparison across every F1 era (1950–present) |
| **Email Reminders** | Subscribe to get an email 15 minutes before Qualifying, Sprint and Race sessions (Resend) |

---

## 🧱 Tech Stack

### Frontend
- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4**
- Deployed on **Vercel**

### Backend
- **FastAPI** (Python 3.11) · async background scheduler
- **FastF1** — official telemetry & session data
- **XGBoost + scikit-learn** — prediction model
- **Ollama / Llama 3.2** — AI race analyst (optional)
- **PostgreSQL** (prod) / **SQLite** (local) — subscriber storage via SQLAlchemy
- **Resend** — transactional reminder emails
- Deployed on **Render** (Docker) · also runs via Docker Compose

### Data Sources
| Source | Usage |
|---|---|
| [Jolpica / Ergast F1 API](https://api.jolpi.ca) | Standings, schedule, race results |
| [FastF1](https://github.com/theOehrly/Fast-F1) | Telemetry, lap times, sector data |
| [OpenF1 API](https://openf1.org) | Real-time live-session data |
| [flagcdn.com](https://flagcdn.com) | Country flag images |

---

## 🗂️ Project Structure

```
F1-Nexus Full Stack Analytics App/
├── backend/                    # FastAPI backend
│   ├── main.py                 # App entry point + reminder scheduler
│   ├── config.py               # Settings (pydantic-settings, reads env)
│   ├── database.py             # SQLAlchemy engine (Postgres or SQLite)
│   ├── models.py               # DB models (Subscriber, etc.)
│   ├── Dockerfile              # Multi-stage production image
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/                # standings, races, telemetry, predictor,
│   │                           #   strategy, analyst, news, subscribers
│   └── services/               # fastf1, jolpica, openf1, prediction model,
│                               #   strategy engine, ai analyst
├── f1-nexus/                   # Next.js frontend
│   └── src/app/                # hub, live, telemetry, predictor, strategy,
│                               #   analyst, paddock, historical, team/[id]
├── render.yaml                 # Render blueprint (web service + Postgres)
├── docker-compose.yml          # Full-stack local Docker setup
└── .env.example
```

---

## 🚀 Deployment

The app is split into two independently deployed pieces:

| Piece | Host | What it serves |
|---|---|---|
| Frontend (`f1-nexus/`) | **Vercel** | The Next.js UI |
| Backend (`backend/`)   | **Render** | FastAPI + Postgres |

### 1 · Backend → Render (Blueprint)

The repo ships a [`render.yaml`](render.yaml) blueprint that provisions **both** a free Postgres database and the Docker web service in one click.

1. Push this repo to GitHub.
2. Go to the [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
3. Select this repository. Render reads `render.yaml` and creates:
   - `f1nexus-db` — a free PostgreSQL instance
   - `f1nexus-api` — the FastAPI web service (built from `backend/Dockerfile`)
4. After the first build, open the **`f1nexus-api` service → Environment** and set the one secret value:

   | Variable | Value |
   |---|---|
   | `RESEND_API_KEY` | your key from [resend.com/api-keys](https://resend.com/api-keys) |

   Everything else (`DATABASE_URL`, `USE_OLLAMA`, `RESEND_FROM_EMAIL`, `APP_URL`) is wired automatically by the blueprint.
5. Render gives you a public URL like `https://f1nexus-api.onrender.com`. Hit `…/health` to confirm it returns `{"status":"ok"}`.

> **Free-tier notes:** the web service spins down after ~15 min of inactivity and cold-starts on the next request (first hit may take ~30–50 s). Render's free Postgres expires after ~30 days unless upgraded.

> **Prefer manual setup?** Create a Web Service → **Docker** runtime → root directory `backend/`. Render injects `$PORT` and the Dockerfile's shell-form `CMD` binds to it automatically. Then add the env vars from the table in [Environment Variables](#-environment-variables).

### 2 · Frontend → Vercel

1. Import the repo on [vercel.com](https://vercel.com) and set the **Root Directory** to `f1-nexus`.
2. Add an environment variable:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | your Render URL, e.g. `https://f1nexus-api.onrender.com` |

3. Deploy. Vercel auto-detects Next.js — no extra build config needed.

> ⚠️ `NEXT_PUBLIC_*` vars are baked in at **build time**. After changing the backend URL, trigger a **redeploy** so the new value is bundled.

---

## 🔐 Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | _(empty → SQLite)_ | Postgres connection string. Auto-set by Render. Legacy `postgres://` URLs are normalised. |
| `RESEND_API_KEY` | _(empty)_ | Resend API key for reminder emails. Emails are skipped if unset. |
| `RESEND_FROM_EMAIL` | `F1 Nexus <onboarding@resend.dev>` | Sender — must use a Resend-verified domain in production. |
| `APP_URL` | `http://localhost:3000` | Public frontend URL used in email CTA links. |
| `USE_OLLAMA` | `true` | Set `false` on hosts without an Ollama server (the analyst falls back to its rule-based writer). |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL (when enabled). |
| `OLLAMA_MODEL` | `llama3.2` | Model used for AI analysis. |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL (baked in at build time). |

---

## 💻 Local Development

### Prerequisites
- Node.js 20+
- Python 3.11+
- [Ollama](https://ollama.com) — optional, only for the AI Analyst feature

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env              # add RESEND_API_KEY if you want emails

# Optional — for the AI Analyst:
ollama pull llama3.2

uvicorn main:app --reload --port 8000
```

Backend → `http://localhost:8000` · API docs → `http://localhost:8000/docs`

### Frontend

```bash
cd f1-nexus
npm install
cp .env.example .env.local        # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Frontend → `http://localhost:3000`

### Docker Compose (full stack + Ollama)

```bash
cp .env.example .env              # set RESEND_API_KEY etc.
docker-compose up --build
docker exec f1-nexus-ollama ollama pull llama3.2   # first run only
```

| Service | Container | Port |
|---|---|---|
| Frontend | `f1-nexus-frontend` | `3000` |
| Backend | `f1-nexus-backend` | `8000` |
| Ollama | `f1-nexus-ollama` | `11434` |

---

## 📬 Email Reminders

Subscribers receive an email **15 minutes before** Qualifying, Sprint Qualifying, Sprint and Race sessions. A background task inside the FastAPI process polls the schedule every 60 seconds — no external cron required. Emails are sent via [Resend](https://resend.com); if `RESEND_API_KEY` is unset, subscriptions still work but no mail is sent.

---

## 📄 License

MIT
