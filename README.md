# Digital Dispatch System

## Render Deployment

1. Push to GitHub.
2. Render.com → New → Web Service → Connect repo.
3. **New → PostgreSQL** (dispatch-db).
4. Dashboard → Environment → Add:
   - `DATABASE_URL` from Postgres INTERNAL DATABASE URL.
5. Deploy → Live at `https://your-app.onrender.com/login.html` (admin/admin).

## Local Dev
```
npm start  # http://localhost:3000/login.html
```

## Features
- PWA dashboard
- Realtime Socket.io
- Persistent Postgres
- Relative APIs (Render ready)
