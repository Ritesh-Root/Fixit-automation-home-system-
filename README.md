# FixIt — Say it. We fix it.

AI-powered home service booking agent. Describe your problem in one sentence — FixIt finds top-rated vendors, compares pricing, and books instantly. Zero forms. Zero calls.

## How It Works

1. **Describe your problem** — "My AC is making a weird noise"
2. **AI finds & books** — FixIt classifies the issue, searches vendors, compares ratings
3. **Sit back & relax** — Booking confirmed, track your technician in real-time

## Features

- Natural language booking through chat
- AI vendor matching across 6 categories (AC Repair, Plumbing, Electrician, House Cleaning, Pest Control, Appliance Repair)
- Real-time booking confirmation & tracking
- In-chat payment processing
- Glassmorphic mobile-first UI

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React, TypeScript |
| Backend | Python, FastAPI |
| AI Engine | Google Gemini with function calling |
| Design | Custom glassmorphic system (Lumina Frost) |

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # add your Gemini API key
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── backend/          # FastAPI + Gemini AI agent
│   ├── main.py       # Server entry point
│   ├── agent/        # AI agent pipeline
│   └── tools/        # Function calling tools
├── frontend/         # Next.js glassmorphic UI
│   └── src/app/
│       ├── page.tsx          # Landing page
│       ├── chat/page.tsx     # Chat interface
│       └── bookings/page.tsx # Bookings dashboard
└── .gitignore
```

## Screenshots

The UI features a glassmorphic design with pastel pink/cyan gradients, frosted glass panels, and Material Symbols icons.

---

Built for **MidNight Hackers 2026**
