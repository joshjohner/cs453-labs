import express from "express";
import { validateId, validateItem, validatePartialItem, verifyItemExists } from "../validation/item.js";

export function createItemRouter(pool) {
    const router = express.Router();

    // Starter route: return every item from the database.
    router.get("/api/items", async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT id, name, quantity
                FROM items
                ORDER BY id ASC
            `);

            res.status(200).json({ items: result.rows });
        } catch (error) {
            console.error("Failed to load items:", error);
            res.status(500).json({
                error: "Internal Server Error",
                message: "Failed to load items."
            });
        }
    });

    // Starter route: create one item so the client can demonstrate a write.
    router.post("/api/items", validateItem, async (req, res) => {
        const { name, quantity } = req.body;

        try {
            const result = await pool.query(
                `
                INSERT INTO items (name, quantity)
                VALUES ($1, $2)
                RETURNING id, name, quantity
                `,
                [name, quantity]
            );

            res.status(201).json({ item: result.rows[0] });
        } catch (error) {
            console.error("Failed to add item:", error);
            res.status(500).json({
                error: "Internal Server Error",
                message: "Failed to add item."
        });
        }
    });

    // TODO: Return one item by ID.
    router.get("/api/items/:id", validateId, verifyItemExists(pool), async (req, res) => {
        res.json({ item: req.item });
    });

    // TODO: Replace one item by ID.
    router.put("/api/items/:id", validateId, validateItem, verifyItemExists(pool), async (req, res) => {
        console.log("PUT /api/items/:id called with", { body: req.body, id: req.id});
        const {id, name, quantity} = req;

        try {
            const result = await pool.query(
                `
                UPDATE items
                SET name = $1,
                    quantity = $2
                WHERE id = $3
                RETURNING id, name, quantity
                `,
                [name, quantity, id]
            );

            res.status(200).json({ item: result.rows[0] });
        } catch (error) {
            console.error("Failed to replace item:", error);
            res.status(500).json({
                error: "Internal Server Error",
                message: "Failed to replace item."
            });
        }
    });

    // TODO: Partially update one item by ID.
    router.patch("/api/items/:id", validateId, validatePartialItem, verifyItemExists(pool), async (req, res) => {
        console.log("PATCH /api/items/:id called with", { body: req.body, id: req.id});
        
        const {name, quantity, item} = req;
        const updatedItem = { ...item, name: name ?? item.name, quantity: quantity ?? item.quantity };
        try {
            const result = await pool.query(
                `
                UPDATE items
                SET name = $1,
                    quantity = $2
                WHERE id = $3
                RETURNING id, name, quantity
                `,
                [updatedItem.name, updatedItem.quantity, updatedItem.id]
            );
            res.status(200).json({ item: result.rows[0] });
        } catch (error) {
            console.error("Failed to update item:", error);
            res.status(500).json({
                error: "Internal Server Error",
                message: "Failed to update item."
            });
        }
    });

    // TODO: Delete one item by ID.
    router.delete("/api/items/:id", validateId, verifyItemExists(pool), async (req, res) => {
        const id = req.id;

        try {
            await pool.query(
                `
                DELETE FROM items
                WHERE id = $1
                `,
                [id]
            );  
            res.status(204).end();
        } catch (error) {
            console.error("Failed to delete item:", error);
            res.status(500).json({
                error: "Internal Server Error",
                message: "Failed to delete item."
            });
        }
    });

    return router;
}