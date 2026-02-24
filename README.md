# Anoma Agent

A personal AI assistant web app with persistent memory, powered by Claude and Convex.

## Setup

1. **Get an Anthropic API key** from https://console.anthropic.com

2. **Add your API key** to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the app**:
   ```bash
   npm run dev
   ```
   This starts both the Convex backend and Next.js frontend. On first run, Convex will prompt you to create a project — follow the prompts in the terminal.

5. **Open** http://localhost:3000

## Features

- Chat with Claude (claude-sonnet-4-6)
- Persistent memory — the agent saves and recalls information across sessions
- Multiple chat sessions with sidebar navigation
- Streaming responses via SSE
- Token usage and cost tracking per message
- Dark theme UI

## Tech Stack

- **Next.js** — React frontend + API routes
- **Convex** — Real-time database for sessions, messages, and memories
- **Anthropic SDK** — Claude API for the AI agent
- **Tailwind CSS** — Styling

## Project Structure

```
.agent/skills/     — Agent skill definitions
convex/            — Database schema and functions
src/app/           — Next.js pages and API routes
src/components/    — React components
src/lib/           — Agent logic, memory tools, utilities
SOUL.md            — Agent personality configuration
```
