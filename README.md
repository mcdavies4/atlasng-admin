# Atlas Admin Dashboard

React + Vite admin console for managing the Atlas logistics bot.

## Features
- **Dashboard** — live stats: deliveries today, active riders, revenue, recent jobs feed
- **Riders** — add, verify, toggle availability, edit coverage zones
- **Jobs** — full job log with status filter and inline status updates
- **Realtime** — dashboard and jobs update live via Supabase Realtime

## Setup

### 1. Install
```bash
npm install
cp .env.example .env
```

### 2. Fill .env
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key   # use anon key, NOT service role
VITE_ADMIN_PASSWORD=choose_a_strong_password
```

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy to Vercel
1. Push to GitHub
2. New project on vercel.com → import repo
3. Add the 3 environment variables
4. Deploy

---

## Atlas Backend Updates

Two files need to be added/updated in your Atlas Railway backend:

### Add: `src/riders/commands.js`
Copy `src/riders/commands.js` from this package into your Atlas backend.

### Replace: `src/bot/webhook.js`
Replace your existing `src/bot/webhook.js` with `updated-webhook.js` from this package.

This enables riders to text **AVAILABLE**, **OFFLINE**, or **STATUS** to the Atlas WhatsApp number to manage their own availability.

---

## Rider WhatsApp Commands
| Command | Action |
|---------|--------|
| `AVAILABLE` or `ONLINE` | Set rider as available |
| `OFFLINE` or `STOP` | Set rider as unavailable |
| `STATUS` | Check current status |
