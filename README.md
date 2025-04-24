# Inductiv AI Agent Persona

- [View Live Demo](https://inductive-ai-agent.vercel.app)

## Project Objective
A React-based AI agent application powered by the Gemini API.

## Features Implemented

- AI Agent Persona
- Interactive Chat UI
- Real LLM Responses
- Animations & Micro-Interactions
- Responsive Design
- Conversation History
- Theme Toggle

## Tech Stack

- Framework: React 19
- Language: TypeScript
- Styling: TailwindCSS v4, Shadcn UI
- Routing: react-router
- Animation: Framer Motion
- LLM Integration: Google Gemini API via `@google/genai` SDK
- Other Libraries: `uuid`, `lucide-react`, `clsx`, `tailwind-merge`

## Setup Instructions

1.  Clone the Repository:
    `git clone https://github.com/EmpSwarup/inductive-ai-agent`
    `cd inductive-ai-agent`

2.  Install Dependencies:
    `npm install`

3.  Set Up Environment Variable:
    Create a file named `.env` in the root of the project and add the Gemini API key as in .env.example.
    `CHATBOT_GEMINI_API_KEY=YOUR_API_KEY_HERE`

4.  Run the Development Server:
    `npm run dev`
    The application should now be running, usually at `http://localhost:5173`.

OR

Visit the Live Demo at https://inductive-ai-agent.vercel.app