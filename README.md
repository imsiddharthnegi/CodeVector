# CodeVector Task — Product Browser API

https://codevector-fnhw.onrender.com/

### Tech Stack
- Node.js + Express
- PostgreSQL (Neon)
- Hosted on Render

### Setup
1. Clone the repo
2. Run `npm install`
3. Add `DATABASE_URL` to `.env`
4. Run `npm run seed`
5. Run `npm run dev`

### API Endpoints

#### `GET /health`
Returns `{ "ok": true }`

#### `GET /products`
Query params:
- `cursor` (optional) - pagination cursor
- `category` (optional) - filter by category
- `limit` (optional, default 20) - items per page

Example response:
```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "string or null",
    "hasMore": true,
    "limit": 20
  }
}
```

### Bonus UI

A simple product browser interface is served at the root URL `/`.

Features:
- Browse all 200,000 products with cursor pagination
- Filter by category
- Dark themed, responsive card grid
- Built with vanilla HTML/CSS/JS, served statically from Express

### Why Cursor Pagination
OFFSET pagination breaks when new data is inserted during browsing — rows shift and users see duplicates or miss products. Cursor pagination anchors to a specific point in the dataset using created_at + id, so it stays stable regardless of new inserts.

### What I'd Improve With More Time
- Add rate limiting
- Add input validation with zod
- Add more filter options (price range, sort order)
- Add a proper UI
