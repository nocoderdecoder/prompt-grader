# PromptGrade

**Score your AI prompts. See what's weak. Get a better version instantly.**

![PromptGrade](https://via.placeholder.com/900x500/060606/c8ff00?text=PromptGrade+Screenshot)

---

## What It Does

Most people write weak prompts and wonder why their AI outputs are mediocre. PromptGrade fixes that.

Paste any prompt you have written for ChatGPT, Claude, or any LLM. PromptGrade will:

- Score it out of 100 across 5 key dimensions
- Tell you exactly what is weak in plain English
- Rewrite it into a clean, concise, high-performance prompt with negative prompting where needed
- Explain every change it made and why

## Live Demo

👉 [promptgrade.vercel.app](https://promptgrade.vercel.app)

---

## Tech Stack

- **Next.js 14** — Frontend + API routes
- **Claude API** (claude-sonnet-4) — Scoring, analysis, and rewriting
- **Vercel** — Hosting and deployment

---

## How It Works

```
User pastes prompt + optional context
        ↓
Next.js API route sends request to Claude API
        ↓
Claude scores across 5 dimensions, identifies weaknesses,
rewrites the prompt with negative prompting where helpful
        ↓
Structured JSON returned and rendered in clean UI
```

The 5 scoring dimensions:
1. **Clarity** — Is the ask clear and unambiguous?
2. **Specificity** — Is it specific enough to get a useful answer?
3. **Context** — Does it give the AI enough background?
4. **Output Guidance** — Does it specify what format or type of response is wanted?
5. **Constraints** — Does it set boundaries on what to include or avoid?

---

## Run Locally

```bash
git clone https://github.com/yourusername/prompt-grader
cd prompt-grader
npm install
cp .env.example .env.local
# Add your Anthropic API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add `ANTHROPIC_API_KEY` as an environment variable in your Vercel project settings.

---

## Built By

[Anshul Gupta](https://linkedin.com/in/anshulgupta) — Insights Manager at Google & AI Builder
