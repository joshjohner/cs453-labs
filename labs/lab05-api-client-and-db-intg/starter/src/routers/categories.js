import express from 'express';
import { validateCategory, validateCategoryId, verifyCategoryExists } from "../validation/category.js";


export function createCategoryRouter(pool) {
    const router = express.Router();

    router.get("/api/categories", async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT id, name
                FROM categories
                ORDER BY id ASC
            `); 
            
            res.status(200).json({ categories: result.rows });
        } catch (error) {
            console.error("Failed to load categories:", error);
            res.status(500).json({
                error: "Internal Server Error",
                message: "Failed to load categories."
            });
        }
    });

    router.get("/api/categories/:id", validateCategoryId, verifyCategoryExists(pool), async (req, res) => {
        res.json({ category: req.category });
    });

    router.post("/api/categories", validateCategory, async (req, res) => {
        const { name } = req.body;

        try {
            const result = await pool.query(
                `
                INSERT INTO categories (name)
                VALUES ($1)
                RETURNING id, name
                `,
                [name]
            );
            res.status(201).json({ category: result.rows[0] });
        } catch (error) {
            console.error("Failed to create category:", error);
            res.status(500).json({
                error: "Internal Server Error",
                message: "Failed to create category."
            });
        }
    });

    router.put("/api/categories/:id", validateCategoryId, validateCategory, verifyCategoryExists(pool), async (req, res) => {
        const { id, name } = req;

        try {
            const result = await pool.query(
                `
                UPDATE categories
                SET name = $1
                WHERE id = $2
                RETURNING id, name
                `,
                [name, id]
            );
            res.status(200).json({ category: result.rows[0] });
        } catch (error) {
            console.error("Failed to update category:", error);
            res.status(500).json({
                error: "Internal Server Error",
                message: "Failed to update category."
            });
        }
    });

    return router;
}