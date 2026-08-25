# Agentflow_AI 🚀

> **Autonomous Multi-Agent Workflow Automation Platform**  
> Powered by Node.js, Express, Socket.IO, Next.js 14, and React Flow.

---

## 🌟 Platform Overview

**Agentflow_AI** is a spec-driven, visual workflow automation engine. It empowers operators to build, generate, execute, and monitor multi-agent pipelines through an interactive drag-and-drop canvas, natural language AI prompts, real-time Socket.IO log streaming, and connected third-party integrations.

---

## ✨ Key Capabilities

1. **🎨 Visual Builder Canvas (`/workflows/[id]`)**
   - Built on React Flow (`@xyflow/react`) with custom drag-and-drop node palettes:
     - **Trigger Nodes**: Webhook, Schedule, Manual, Event.
     - **Action Nodes**: HTTP Request, Email Digest, Slack Alert, Database Query.
     - **AI Nodes**: Planner, Execution Engine, Gemini Classifier, Summarizer.
     - **Logic Nodes**: Condition, Branch, Delay, Loop.
   - **Interactive Removable Edges**: One-click `'×'` deletion buttons on connection lines and <kbd>Delete</kbd>/<kbd>Backspace</kbd> key support.

2. **🤖 AI Prompt-to-Workflow Generator (`/workflows/builder`)**
   - Converts plain English natural language prompts into complete, valid React Flow DAG graphs (with nodes, edges, positions, and parameters).
   - Built-in OpenRouter / Google Gemini SDK support with deterministic fallback builders.
   - Includes one-click **"Launch in Visual Builder"** action.

3. **⛓️ 5-Agent Multi-Agent Orchestration Chain**
   - **Planner Agent**: Analyzes DAG graph topology, performs topological sorting, and calculates confidence scores (96%).
   - **Execution Agent**: Dispatches step logic for all node categories with mock fallback handling when external API keys are absent.
   - **Validation Agent**: Asserts step output payload schemas and status codes.
   - **Recovery Agent**: Handles node exceptions with automatic retries and self-healing.
   - **Monitoring Agent**: Emits real-time timeline logs and status transitions (`RUNNING`, `COMPLETED`, `FAILED`) to Socket.IO.

4. **📡 Real-Time Live Execution Viewer (`/executions/[id]`)**
   - Socket.IO real-time stream room (`execution_${id}`) updating node status glows:
     - **Blue Pulse**: Step currently executing.
     - **Green Ring**: Step completed & schema validated.
     - **Red Ring**: Step failed.
   - Right-side timeline drawer displaying live agent logs tagged by agent name badges (**Planner**, **Execution**, **Validation**, **Recovery**, **Monitoring**).

5. **📊 Execution Analytics & Metrics (`/executions`)**
   - Real-time KPI cards tracking **Total Runs**, **Success Rate %**, **Avg Execution Time (ms)**, and **Failure Breakdown**.

6. **🔌 Integrations Hub (`/integrations`)**
   - Manage API keys and Webhook URLs for **Gmail**, **Slack**, **Discord**, **Google Sheets**, **OpenAI**, and **Gemini**.
   - Includes status toggles (`Connected` / `Not Connected`), connection testing, and encrypted credential indicators.

7. **💾 Persistent In-Memory Fallback & Auto-Seeding**
   - Runs seamlessly offline or without a local MongoDB daemon using the built-in `inMemoryStore` fallback.
   - Pre-populates default operator credentials (`chandana.chandu.06.11@gmail.com` / `password123`) and 2 complete ready-to-run workflows (*Customer Support Automation* & *Lead Notification Pipeline*).

---

## 🛠️ Architecture Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, React 18, React Flow (`@xyflow/react`), Zustand, TailwindCSS, Lucide Icons, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO Server, JWT Authentication, Helmet, Morgan, Express Validator |
| **Persistence** | MongoDB + Mongoose (with automatic `inMemoryStore` fallback) |
| **AI SDKs** | Google Generative AI (`@google/generative-ai`), OpenRouter API |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Start Backend Server
```bash
cd server
npm install
npm run dev
```
*Server starts on `http://localhost:5000`.*

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*Client starts on `http://localhost:3000`.*

---

## 🔑 Default Seed Account

The platform automatically seeds a default operator account on startup:

- **Email**: `chandana.chandu.06.11@gmail.com`
- **Password**: `password123`

---

## 🗺️ Application Sitemap

- `/` — Landing Dashboard & Agent Health Overview
- `/workflows` — Workflows Dashboard & Pipeline List
- `/workflows/[id]` — Visual React Flow Canvas Builder
- `/workflows/builder` — AI Prompt-to-Workflow Generator
- `/executions` — Execution Log History & Analytics KPI Cards
- `/executions/[id]` — Real-Time Live Execution Viewer & Socket.IO Stream
- `/integrations` — Connected Services & API Key Hub

---

## 🧪 Verification & Testing

To run the automated backend unit & end-to-end verification scripts:

```bash
# Verify Phase 4 Multi-Agent Engine
node scratch/test_phase4_backend.js

# Verify Phase 5 Integrations & E2E Pipeline
node scratch/test_phase5_e2e.js

# Verify Persistent Seed Data & Auto-Login
node scratch/test_seed_verification.js
```

---

## 📄 License
MIT License. Built with ❤️ for Agentflow_AI.
