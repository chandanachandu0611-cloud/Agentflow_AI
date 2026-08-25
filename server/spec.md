# Agentic AI Automation Platform (Agentflow_AI) Specification

## Tech Stack
- Frontend: Next.js (Pages Router), React 19, Tailwind CSS, Zustand, Axios, React Flow (@xyflow/react), Socket.IO client, lucide-react.
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, BullMQ, ioredis, Socket.IO, helmet, express-validator, bcryptjs.
- AI & Agents: OpenRouter API, Google Generative AI SDK (Gemini), LangChain / LangGraph.
- Third-Party Integrations: Gmail, Slack, Discord, Google Sheets (OAuth 2.0 with token encryption at rest).

## Architecture & Folder Structure
- client/ : Next.js frontend with AppShell, NodePalette, NodeConfigPanel, WorkflowCanvas, Zustand stores, and Socket.IO listeners.
- server/ : Express backend with modular routes, controllers, services, agents, queues, and MongoDB models.

## Multi-Agent Execution Pipeline
1. Planner Agent: Determines node execution order and confidence scores.
2. Execution Agent: Dispatches actions to connected third-party integrations or AI providers.
3. Validation Agent: Asserts output structures match expected schemas.
4. Recovery Agent: Classifies runtime errors and triggers retries or escalations.
5. Monitoring Agent: Emits timeline log events to Socket.IO.

## Development Phases
- Phase 1: Project setup, client/server scaffolding, in-memory/MongoDB setup, JWT authentication, and AppShell.
- Phase 2: Workflow CRUD and React Flow drag-and-drop canvas with node palette and config panel.
- Phase 3: AI prompt-to-workflow generation (Gemini/OpenRouter with deterministic rule fallback).
- Phase 4: Multi-agent execution engine with lifecycle controls (pause, resume, cancel).
- Phase 5: Third-party OAuth integrations & real-time Socket.IO execution log streaming.
- Phase 6: BullMQ background queues, notifications drawer, and production deployment.