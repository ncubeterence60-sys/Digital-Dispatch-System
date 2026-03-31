# Digital Dispatch System - Single Server Setup

## Local Run
```
npm install
npm start
```
Visit `http://localhost:3000/login.html`
- Login: admin/admin -> dashboard
- APIs: /login, /services, /providers, /requests (POST login form data)
- Realtime Socket.io trips
- Static frontend served from /public

## Render Deploy
- Connect repo to Render
- Build: `npm install`
- Start: `npm start`
- Single URL serves frontend + backend APIs

## Features
- SQLite DB auto-setup
- Providers/Requests management
- Mock WhatsApp/SMS
- Distance calc
- PWA ready (manifest.json, sw.js)

Done ✅

