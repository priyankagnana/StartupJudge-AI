# StartupJudge AI

A multi-agent startup evaluation platform that simulates a virtual boardroom of 6 AI domain experts. Each agent has a distinct India-focused persona, evaluates your startup idea from their specialization, debates with other experts in a cross-examination round, and produces a final Go / Pivot / No-Go verdict with weighted risk scoring.

**Live:** [startup-judge-ai.vercel.app](https://startup-judge-ai.vercel.app)

---

## How It Works

```
User submits startup idea
       |
  [Questions] AI generates 5 contextual questions tailored to the idea
       |
  [Round 1] 6 experts evaluate independently — scores, risks, recommendations
       |
  [Round 2] Experts cross-examine and challenge each other's assumptions
       |
  [Decision] AI synthesizes final verdict with weighted risk scores
       |
  Chat UI shows live debate + dashboard with scoring breakdown
```

**Only 3 LLM API calls** power the entire simulation — one mega-prompt per round + one for decision synthesis. Each mega-prompt instructs the model to respond as all 6 experts simultaneously, returning structured JSON.

---

## Features

- **6 AI Domain Experts** — CFO, CTO, Legal, Marketing, HR, and Market Research with distinct Indian-context personas
- **2-Round Live Debate** — Independent evaluation followed by heated cross-examination where agents challenge each other
- **Dynamic Q&A** — AI-generated contextual questions tailored to each idea (MCQ + text input), with fixed fallback questions
- **Weighted Risk Scoring** — 6-domain scoring engine with conflict detection and disagreement index
- **Provider Fallback Chain** — Auto-cycles through 4 AI providers when one hits rate limits
- **Simulation History** — Save, view, and manage past evaluations with a sidebar
- **Authentication** — Email/password + Google OAuth sign-in
- **Dark / Light Theme** — Full theme toggle across all pages
- **Mobile Responsive** — Adaptive layout with slide-in sidebar, toggleable dashboard panel, and compact mobile header
- **Response Caching** — Identical ideas return instantly from in-memory cache (1-hour TTL)

---

## The Boardroom Panel

| Agent | Persona | Focus Area |
|-------|---------|------------|
| **Priya Sharma** | CFO, ex-Kotak investment banker | Unit economics in INR, CAC/LTV, burn rate, path to profitability |
| **Arjun Mehta** | CTO, ex-Flipkart, YC-backed | Tech stack, scalability, MVP timeline, API limits (UPI, Razorpay, Aadhaar) |
| **Kavita Iyer** | Legal, 10 yrs Indian tech law | DPDPA 2023, IT Act, RBI compliance, FSSAI, GST, data localization |
| **Rahul Kapoor** | Marketing, scaled 2 D2C startups | Go-to-market, Instagram/WhatsApp growth, pricing in Indian context |
| **Meera Patel** | HR, built teams 3 to 150 | Hiring plans, salaries in LPA, Tier 1/2 talent dynamics |
| **Vikram Rao** | Market Research, ex-Bain | Competitors by name, TAM sizing, Inc42/RedSeer data, market timing |

Each agent argues in character during Round 2 — Priya challenges anyone without numbers, Arjun calls out unrealistic timelines, Kavita flags legal risks everyone ignored.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS 4, Framer Motion, Lucide Icons, Axios |
| **Backend** | Node.js, Express 5, Passport.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (7-day expiry) + Google OAuth 2.0 |
| **AI Providers** | Groq (Llama 3.3 70B), Cerebras (Llama 3.1 8B), Gemini 2.5 Flash-Lite, OpenRouter (Gemma 4 31B) |
| **Deployment** | Frontend on Vercel, Backend on Render |

---

## Architecture

```
backend/src/
├── agents/           # 6 domain expert agents + base class + factory
├── providers/        # AI provider adapters (Cerebras, Gemini, Groq, OpenRouter)
├── services/
│   ├── orchestratorService   # Builds mega-prompts, runs 2-round debate
│   ├── decisionService       # AI-powered verdict synthesis
│   ├── questionService       # Dynamic Q&A generation per idea
│   ├── riskScorer            # Weighted 6-domain scoring
│   ├── conflictDetector      # Score variance + disagreement analysis
│   ├── memoryService         # Per-round response storage
│   └── cacheService          # In-memory TTL cache (1 hour)
├── controllers/      # Simulation + History request handlers
├── routes/           # /api/simulate, /api/auth, /api/history
├── models/           # User + Simulation (MongoDB schemas)
├── middleware/        # JWT auth middleware
├── config/           # Passport.js Google OAuth setup
└── utils/            # AI client with fallback chain, rate limiter

frontend/src/
├── pages/            # Landing, Simulation, Login, Signup, AuthCallback
├── components/       # ChatMessage, DebateTabs, RoundTab, VerdictTab,
│                     # DashboardPanel, QAFlow, AgentStatusList,
│                     # HistorySidebar, Navbar, HeroDebatePreview
├── context/          # AuthContext, SimulationContext, ThemeContext
└── services/         # API client, Auth service
```

### Design Patterns
- **Strategy** — Each AI provider implements a common `generate()` interface
- **Factory** — `AgentFactory` and `ProviderFactory` for dynamic instantiation
- **Adapter** — Provider layer abstracts 4 different AI APIs behind a unified interface
- **Service Layer** — Controllers delegate to services; services handle business logic
- **Observer** — SSE streaming endpoint emits events as agents complete

---

## Decision Scoring

The final verdict combines **algorithmic scoring** and **AI synthesis**:

| Dimension | Weight | Source Agent |
|-----------|--------|-------------|
| Financial Risk | 20% | CFO |
| Technical Feasibility | 18% | CTO |
| Competition | 17% | Market Research |
| Market Potential | 17% | Marketing |
| Legal Risk | 15% | Legal |
| Talent Risk | 13% | HR |

**Decision Thresholds:**
- **GO** (75+): Strong fundamentals, manageable risks
- **PIVOT** (40-74): Good core idea, needs significant changes
- **NO-GO** (<40): Fatal flaws that can't be fixed

**Conflict Detection:**
- Flags when any two agents' scores differ by >30 points
- Computes disagreement index (0-100%) from score standard deviation
- Surfaces explicit disagreements from Round 2 critiques

---

## Provider Fallback Chain

The system automatically cycles through providers when one hits rate limits:

```
Groq (primary) → Cerebras → Gemini → OpenRouter
```

Handles 429 (rate limit), 402 (payment required), and 5xx errors automatically. Users can also select a provider and enter their own API key from the settings panel.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- A free API key from at least one provider:
  - [Groq](https://console.groq.com/keys) (30 RPM free)
  - [Cerebras](https://cloud.cerebras.ai) (1M tokens/day free)
  - [Google AI Studio](https://aistudio.google.com/apikey) (1000 RPD free)

### Installation

```bash
git clone https://github.com/your-username/StartupJudge-AI.git
cd StartupJudge-AI

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### Configuration

**Backend** — Create `backend/.env`:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Auth
JWT_SECRET=your_random_secret_string
JWT_EXPIRES_IN=7d

# AI Providers (need at least one)
GROQ_API_KEY=your_groq_key
CEREBRAS_API_KEY=your_cerebras_key
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key
DEFAULT_PROVIDER=groq

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
CLIENT_URL=http://localhost:5173
```

**Frontend** — Optionally create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

### Running

```bash
# Terminal 1 — Backend (port 5001)
cd backend && npm start

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deployment

### Frontend (Vercel)
- Connect your GitHub repo, set root directory to `frontend`
- Add env var: `VITE_API_URL=https://your-backend-url.onrender.com/api`
- The `vercel.json` rewrite config handles client-side routing

### Backend (Render)
- Create a Web Service, set root directory to `backend`
- Add all env vars from the `.env` template above
- Set `GOOGLE_CALLBACK_URL` and `CLIENT_URL` to your production URLs

### Google OAuth (Production)
- In Google Cloud Console, add your production URLs to Authorized JavaScript Origins and Redirect URIs
- Publish the OAuth consent screen from "Testing" to "In production"

---

## API Endpoints

### Simulation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/simulate` | Run full simulation (sync) |
| POST | `/api/simulate/questions` | Generate dynamic Q&A questions |
| POST | `/api/simulate/round1` | Run Round 1 evaluation |
| POST | `/api/simulate/round2` | Run Round 2 cross-examination |
| POST | `/api/simulate/decide` | Generate final verdict |

### History (Auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | List user's simulations |
| GET | `/api/history/:id` | Get single simulation |
| POST | `/api/history` | Save simulation |
| PATCH | `/api/history/:id` | Update simulation |
| DELETE | `/api/history/:id` | Delete simulation |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/google` | Start Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback |

---

## License

MIT
