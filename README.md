
# Chimney CRM (Next.js + Tailwind, JS only)

**Fully Vercel-ready**. No WebSockets; real-time feel via 15s polling.

## Quick Start (Local)
```bash
npm install
# put your .env.local with MONGO_URI and JWT_SECRET
npm run dev
```

## Default Admin
- username: `admin`
- password: `Chimneysolution@123#` (seeded on first login)

## Notes
- Serverless API under `/pages/api/*`.
- Pagination on technician forwarded calls: shows 4 items, rest in pages.
- CSV export available in admin lists.
- Digital signatures captured as data-URL images and visible in admin.
- Search & date filters available in Service Forms and Payments.
- All imports are relative (no `@` aliases).
