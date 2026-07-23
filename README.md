# Synthetic Intelligence — Autonomous Research Network

A multi-agent AI research platform built with a **Modern Enterprise AI** design system. Deploy specialized AI agents for deep research across biomedical, legal, market, academic, and software domains.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Status](https://img.shields.io/badge/status-development-amber)

---

## Architecture

The platform follows a **multi-agent orchestration architecture** where a supervisor agent routes queries to specialized domain agents:

```
User Query → Router Agent → Supervisor Agent → Domain Agent (e.g. Programming)
                                                    ↓
                                            Validator Agent
                                                    ↓
                                            Formatter Agent → Response
```

### Agent Types

| Agent | Status | Description |
|-------|--------|-------------|
| **Biomedical Agent** | 🚧 Coming Soon | Drug interaction analysis, genomic sequence analysis, clinical trial research |
| **Legal Agent** | 🚧 Coming Soon | Case law research, contract analysis, statutory interpretation |
| **Market Research Agent** | 🚧 Coming Soon | Market trend analysis, competitor intelligence, consumer sentiment |
| **Academic Research Agent** | 🚧 Coming Soon | Paper discovery, citation analysis, research gap identification |
| **Programming Agent** | ✅ **Active** | Code generation, debugging, architecture design, security analysis |

---

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite 8** for build tooling
- **Tailwind CSS v4** for styling
- **Zustand** for state management
- **React Query** for server state
- **React Router** for navigation
- **Lucide React** for icons
- **React Markdown** with GFM for rendering responses

### Backend
- **Node.js** with TypeScript
- **Express** for API routing
- **Prisma** for database ORM
- **Multi-agent pipeline** (Router → Supervisor → Domain Agent → Validator → Formatter)

---

## Design System

The UI follows the **DESIGN.md** specification — a **Refined Technical Minimalism** approach blending developer tool precision with executive dashboard elegance.

### Key Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--surface` | `#0b1326` | Base background |
| `--primary` | `#c3c0ff` | Primary actions, active states |
| `--primary-container` | `#4f46e5` | Buttons, interactive elements |
| `--secondary` | `#4cd7f6` | AI intelligence markers, status pips |
| `--tertiary` | `#4edea3` | Success states |

### Typography
- **Headings**: Plus Jakarta Sans (geometric, professional)
- **Body**: Inter (high x-height for legibility)
- **Code/Monospace**: JetBrains Mono (system output differentiation)

### Elevation
- **Level 0**: Base surface (`#0b1326`)
- **Level 1**: Cards with 1px border, no shadow
- **Level 2**: Glassmorphic overlays with `backdrop-filter: blur(12px)`

---

## Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/atharva1304/Multi-Agent-AI.git
cd Multi-Agent-AI

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

```bash
# Backend (backend/.env)
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend (frontend/.env)
# VITE_API_URL=http://localhost:3001/api
```

### Running the Application

```bash
# Terminal 1: Start the backend
cd backend
npm run dev

# Terminal 2: Start the frontend
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3001`.

---

## Project Structure

```
├── backend/
│   ├── prisma/              # Database schema
│   └── src/
│       ├── agents/          # Multi-agent pipeline
│       │   ├── router/      # Query routing
│       │   ├── supervisor/  # Agent supervision
│       │   ├── programming/ # Programming agent
│       │   ├── validator/   # Response validation
│       │   └── formatter/   # Response formatting
│       ├── controllers/     # API controllers
│       ├── middleware/      # Auth, error handling
│       ├── services/        # LLM, conversation
│       └── tools/           # Web search, etc.
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── agents/      # Agent cards, landing page
│       │   ├── chat/        # Chat interface components
│       │   ├── layout/      # Sidebar, navigation
│       │   └── ui/          # Button, Input primitives
│       ├── data/            # Agent definitions
│       ├── services/        # API client
│       ├── stores/          # Zustand state management
│       └── types/           # TypeScript definitions
└── DESIGN.md                # Design system specification
```

---

## Features

### ✅ Implemented
- **Agent Landing Page**: Grid of all 5 agent types with status indicators
- **Programming Agent**: Fully functional chat interface with code generation, debugging, and optimization
- **Multi-Agent Pipeline**: Router → Supervisor → Programming → Validator → Formatter
- **Dark Mode First**: Optimized for long-duration focus sessions
- **Response Citations**: References with source attribution
- **Confidence Scoring**: Response quality indicators
- **Conversation History**: Persistent chat history with sidebar navigation

### 🚧 In Development
- Biomedical, Legal, Market Research, and Academic Research agents
- Streaming responses
- File upload and analysis
- Agent collaboration workflows

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a message to the active agent |
| `GET` | `/api/history` | Get conversation history |
| `GET` | `/api/conversation/:id` | Get a specific conversation |
| `POST` | `/api/agent/programming` | Direct query to programming agent |

---

## License

MIT