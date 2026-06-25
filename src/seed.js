import dotenv from 'dotenv';
dotenv.config();

import pool from './db.js';

async function seed() {
  try {
    console.log("Creating table and indexes...");

    // Step 1: Create the products table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Step 2: Create two indexes if they don't exist
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_products_created_at_id 
      ON products (created_at DESC, id DESC);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category_created_at_id 
      ON products (category, created_at DESC, id DESC);
    `);

    console.log("Seeding 200,000 products...");
    const startTime = Date.now();

    // Step 3: Insert 200,000 products using a single Postgres generate_series query
    await pool.query(`
      INSERT INTO products (name, category, price, created_at, updated_at)
      SELECT
        'Product ' || i,
        (ARRAY['Electronics','Clothing','Books','Home & Garden','Sports','Toys','Beauty','Automotive'])[floor(random() * 8 + 1)],
        ROUND((random() * 990 + 10)::NUMERIC, 2),
        NOW() - (random() * INTERVAL '365 days'),
        NOW() - (random() * INTERVAL '30 days')
      FROM generate_series(1, 200000) AS s(i);
    `);

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Seeding took ${duration} ms`);

    console.log("Done!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
