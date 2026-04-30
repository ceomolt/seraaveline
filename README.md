# Sera Landing Page + AI Chat

Simple personal landing page for **Sera** with a secure AI chat proxy using Node.js + Express.

## Project Structure

```text
cursorproject/
  public/
    images/
      README.txt
      profile.jpg            # add this manually
    index.html
    style.css
    script.js
  .env.example
  package.json
  server.js
```

## Features

- Cozy aesthetic landing page (HTML/CSS/JS only)
- Responsive profile + social links + donate button
- AI chat UI with in-memory browser-tab-only history
- Secure backend proxy (`POST /api/chat`) so API key stays server-side
- Health check endpoint (`GET /health`)

## Setup (Local)

1. Install dependencies:
   - `npm install`
2. Create env file:
   - copy `.env.example` to `.env`
3. Fill `.env` values:
   - `AI_API_KEY` = your real API key
   - adjust `PORT`, `AI_BASE_URL`, `AI_MODEL` if needed
4. Start server:
   - `npm start`
5. Open:
   - `http://localhost:3000` (or your custom `PORT`)

## Environment Variables

- `PORT` - Express port (default: `3000`)
- `AI_BASE_URL` - upstream AI API base URL
- `AI_MODEL` - model name (`gpt-5.4`)
- `AI_API_KEY` - secret API key (never expose to frontend)

## Deploy on VPS

1. Upload project to VPS.
2. Install Node.js 18+.
3. In project folder:
   - `npm install`
4. Create `.env` from `.env.example` and set real values.
5. Start app:
   - `npm start`
6. (Recommended) Run with process manager:
   - `npm install -g pm2`
   - `pm2 start server.js --name sera-landing`
   - `pm2 save`
   - `pm2 startup`
7. Put Nginx/Caddy reverse proxy in front (optional but recommended) and forward to `localhost:PORT`.

## Security Notes

- Frontend only calls `/api/chat`.
- API key is never sent to the browser.
- Server validates messages and only forwards the latest 20 messages.
