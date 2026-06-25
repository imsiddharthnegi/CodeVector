import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Route 1 - Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Route 2 - Get products
app.get('/products', async (req, res) => {
  try {
    const { category, cursor } = req.query;
    
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit <= 0) {
      limit = 20;
    } else if (limit > 100) {
      limit = 100;
    }

    let decodedCursor = null;
    if (cursor) {
      try {
        decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
        if (!decodedCursor.created_at || !decodedCursor.id) {
          return res.status(400).json({ error: "Invalid cursor" });
        }
      } catch (err) {
        return res.status(400).json({ error: "Invalid cursor" });
      }
    }

    let queryText = '';
    let queryParams = [];

    if (!decodedCursor) {
      queryText = `
        SELECT id, name, category, price, created_at, updated_at
        FROM products
        WHERE ($1::text IS NULL OR category = $1)
        ORDER BY created_at DESC, id DESC
        LIMIT $2
      `;
      queryParams = [category || null, limit];
    } else {
      queryText = `
        SELECT id, name, category, price, created_at, updated_at
        FROM products
        WHERE ($1::text IS NULL OR category = $1)
        AND (created_at, id) < ($2::timestamptz, $3::uuid)
        ORDER BY created_at DESC, id DESC
        LIMIT $4
      `;
      queryParams = [category || null, decodedCursor.created_at, decodedCursor.id, limit];
    }

    const { rows } = await pool.query(queryText, queryParams);

    const hasMore = rows.length === limit;
    let nextCursor = null;

    if (hasMore && rows.length > 0) {
      const lastItem = rows[rows.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          created_at: lastItem.created_at,
          id: lastItem.id,
        })
      ).toString('base64');
    }

    res.json({
      data: rows,
      pagination: {
        nextCursor,
        hasMore,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
