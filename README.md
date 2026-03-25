# StartupJudge AI

A multi-agent startup evaluation platform that simulates a virtual boardroom of 6 AI domain experts. Each agent has a distinct persona, evaluates your startup idea from their specialization, debates with other experts, and produces a final Go / Pivot / No-Go verdict with risk scoring.

**This is not a chatbot.** It is a multi-agent reasoning and decision workflow system built to demonstrate backend architecture, OOP design patterns, and AI orchestration.

---

## How It Works

```
User submits idea
       |
  [Round 1] 6 experts evaluate independently
       |
  [Round 2] Experts cross-examine and debate each other
       |
  [Decision] AI synthesizes final verdict with risk scores
       |
  Chat UI shows debate + dashboard with scoring
```

**Only 3 API calls** power the entire simulation — one mega-prompt per round, parsed into 6 individual agent responses.

---

## The Boardroom Panel

| Agent | Persona | Focus Area |
|-------|---------|------------|
| **Priya Sharma** | CFO, ex-Goldman Sachs | Unit economics, CAC/LTV, burn rate, path to profitability |
| **Arjun Mehta** | CTO, ex-Google engineer | Tech stack, API limits, MVP timeline, scalability |
| **Sarah Chen** | Legal Partner, tech law | GDPR, COPPA, platform ToS, IP risks, compliance |
| **Rahul Kapoor** | Marketing, scaled 2 startups | Go-to-market channels, pricing tiers, viral mechanics |
| **Meera Patel** | HR, built teams 3 to 150 | Hiring plan, salary ranges, talent gaps, team structure |
| **Vikram Rao** | Market Research, ex-McKinsey | Competitors by name, TAM sizing, market timing |

Each agent argues in character during Round 2 — Priya challenges anyone without numbers, Arjun calls out unrealistic timelines, Sarah flags legal risks everyone ignored.

---

## Tech Stack

### Backend
- **Runtime:** Node.js with Express 5
- **AI Providers:** Cerebras, Google Gemini, Groq (auto-fallback chain)
- **Architecture:** Service-oriented with controller-service-repository separation

### Frontend
- **Framework:** React 19 with Vite
- **Styling:** Inter font, dark theme, inline styles
- **Animations:** Framer Motion
- **Icons:** Lucide React

---

## Architecture

```
backend/
  src/
    agents/          # 6 domain expert agents + AgentFactory
    providers/       # AI provider adapters (Cerebras, Gemini, Groq)
    services/        # Orchestrator, Decision Engine, Risk Scorer,
                     # Conflict Detector, Memory, Cache
    controllers/     # Request handling + SSE streaming
    routes/          # API route definitions
    utils/           # AI client with fallback chain, rate limiter

frontend/
  src/
    components/      # ChatMessage, TypingIndicator, AgentStatusList,
                     # DashboardPanel
    pages/           # LandingPage, SimulationView
    services/        # API client
```

### Design Patterns Used
- **Strategy Pattern** — Each AI provider implements a common `generate()` interface
- **Factory Pattern** — `AgentFactory` registers and creates agents; `ProviderFactory` creates providers
- **Adapter Pattern** — Provider layer abstracts Gemini, Groq, and Cerebras behind a unified API
- **Service Layer** — Controllers delegate to services, services delegate to repositories
- **Observer Pattern** — SSE streaming endpoint emits events as agents complete

### Key Backend Modules

| Module | Purpose |
|--------|---------|
| `orchestratorService` | Runs 2-round debate with mega-prompt batching |
| `decisionService` | AI-powered verdict synthesis with algorithmic fallback |
| `riskScorer` | Weighted domain scoring across 6 dimensions |
| `conflictDetector` | Score-variance-based disagreement detection |
| `memoryService` | Per-round structured agent response storage |
| `cacheService` | In-memory TTL cache for repeated ideas |
| `aiClient` | Provider-agnostic AI calls with auto-fallback chain |
| `rateLimiter` | Concurrency-limited batch executor |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free API key from any one of:
  - [Cerebras](https://cloud.cerebras.ai) (1M tokens/day free)
  - [Google AI Studio](https://aistudio.google.com/apikey) (1000 RPD free)
  - [Groq](https://console.groq.com/keys) (30 RPM free)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/StartupJudge-AI.git
cd StartupJudge-AI

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
CEREBRAS_API_KEY=your_cerebras_key
DEFAULT_PROVIDER=cerebras
```

You only need **one** API key — the system auto-falls back through available providers.

### Running

```bash
# Terminal 1 — Backend (port 5001)
cd backend
npm start

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API

### `POST /api/simulate`

Runs a full simulation and returns results.

**Request:**
```json
{
  "idea": "An AI-powered tutoring platform for K-12 students",
  "provider": "cerebras",
  "apiKey": "optional-user-provided-key"
}
```

**Response:**
```json
{
  "idea": "...",
  "agents": {
    "CFO": { "round1": "...", "round1Parsed": { "assessment": "...", "score": 72, "risks": [...] }, "round2": "...", "round2Parsed": {...} },
    "CTO": {...},
    "Legal": {...},
    "Marketing": {...},
    "HR": {...},
    "Market Research": {...}
  },
  "finalDecision": {
    "score": 65,
    "decision": "PIVOT",
    "confidenceLevel": "HIGH",
    "summary": "...",
    "domainScores": { "financial": 70, "technical": 55, ... },
    "disagreementIndex": 35,
    "topConcern": { "domain": "legal", "detail": "..." },
    "suggestions": ["...", "...", "..."],
    "conflicts": ["CFO vs Marketing: ..."]
  }
}
```

### `POST /api/simulate/stream`

Same request format — returns Server-Sent Events for real-time progress.

---

## Decision Scoring

The final verdict combines **algorithmic scoring** and **AI synthesis**:

| Dimension | Weight | Source Agent |
|-----------|--------|-------------|
| Financial Risk | 20% | CFO |
| Technical Feasibility | 18% | CTO |
| Legal Risk | 15% | Legal |
| Market Potential | 17% | Marketing |
| Talent Risk | 13% | HR |
| Competition | 17% | Market Research |

**Scoring Rules:**
- **GO** (75+): Strong fundamentals, manageable risks
- **PIVOT** (40-74): Good core idea, needs significant changes
- **NO-GO** (<40): Fatal flaws that can't be fixed

---

## Provider Fallback Chain

The system automatically cycles through providers when one hits rate limits:

```
Cerebras (primary) → Gemini → Groq
```

Users can also select a provider and enter their own API key from the landing page settings.

---

## Project Structure Highlights

- **3 API calls per simulation** — Mega-prompt architecture batches all 6 agents into one call per round
- **Auto-fallback** — Handles 429 (rate limit) and 402 (payment required) errors across 3 providers
- **Response caching** — Identical ideas return instantly from in-memory cache (1-hour TTL)
- **Animated chat UI** — Messages appear one-by-one with typing indicators after results load
- **Rate limit UX** — Clear error screen with links to get free API keys when quota is exhausted

---

## License

MIT
