import express from "express";
import cors from "cors";
import pg from "pg";
import { pathToFileURL } from "url";
import { createItemRouter } from "./routers/item.js";
import { createCategoryRouter } from "./routers/categories.js";

const { Pool } = pg;

const PORT = process.env.PORT || 3000;

const pool = new Pool({
    host: process.env.PGHOST ?? "127.0.0.1",
    port: Number(process.env.PGPORT ?? 5433),
    database: process.env.PGDATABASE ?? "lab05",
    user: process.env.PGUSER ?? "postgres",
    password: process.env.PGPASSWORD ?? "postgres"
});

export function createApp() {
    const app = express();

    app.use(express.json());

    app.use(cors({
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
      ]
    }));

    app.get("/health", async (req, res) => {
      try {
        await pool.query("SELECT 1");
        res.json({ status: "ok" });
      } catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({
          status: "error",
          message: "Database connection failed."
        });
      }
    });

    const itemRouter = createItemRouter(pool);
    const categoryRouter = createCategoryRouter(pool);
    app.use(itemRouter);
    app.use(categoryRouter);

    return app;
}

export async function initializeDatabase() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity >= 0),
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    const { rows: categoryRows } = await pool.query("SELECT COUNT(*)::int AS count FROM categories");

    if (categoryRows[0].count === 0) {
      await pool.query(`
        INSERT INTO categories (name)
        VALUES ($1), ($2), ($3)
      `, ["IT", "Furniture", "Morale"]);
    }
    const { rows: itemRows } = await pool.query("SELECT COUNT(*)::int AS count FROM items");

    if (itemRows[0].count === 0) {
      await pool.query(
        `
          INSERT INTO items (name, quantity, category_id)
          VALUES ($1, $2, $3), ($4, $5, $6), ($7, $8, $9)
        `,
        ["Keyboard", 10, 1, "Mouse", 5, 1, "Monitor", 3, 1]
      );
    }
}

const isMainModule = import.meta.url === pathToFileURL(process.argv[1]).href;
console.log(`process.argv[1]: ${process.argv[1]}`);
console.log(`pathToFileURL(process.argv[1]).href: ${pathToFileURL(process.argv[1]).href}`);
console.log(`new URL(import.meta.url).pathname: ${new URL(import.meta.url).pathname}`);
console.log(`import.meta.url: ${import.meta.url}`);

if (isMainModule) {
    console.log("Starting Lab 5 API...");
    const app = createApp();
    console.log("Initializing database...");
    initializeDatabase()
      .then(() => {
        app.listen(PORT, () => {
          console.log(`Lab 5 API listening on http://localhost:${PORT}`);
        });
      })
      .catch((error) => {
        console.error("Server startup failed:", error);
        process.exit(1);
      });
}
else {
    console.log("Lab 5 API imported as a module.");
}
