import express from "express";
import { validateId, validateItem, validatePartialItem, verifyItemExists } from "../validation/item.js";

export function createItemRouter(pool) {
    const router = express.Router();

    // Starter route: return every item from the database.
    router.get("/api/items", async (req, res) => {
        const {category_id} = req.query;

        try {
            let result;
            if (category_id !== undefined) {
                result = await pool.query( `
                    SELECT items.id, items.name, items.quantity, c.id AS category_id, c.name AS category_name
                    FROM items
                    JOIN categories c ON items.category_id = c.id
                    WHERE c.id = $1
                    ORDER BY items.id ASC
                    `   
                , [category_id]);
                
            } else {
                result = await pool.query(`
                    SELECT items.id, items.name, items.quantity, c.id AS category_id, c.name AS category_name
                    FROM items
                    JOIN categories c ON items.category_id = c.id
                    ORDER BY items.id ASC
                `);
            }
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
        const { name, quantity, category_id } = req.body;

        try {
            const result = await pool.query(
                `
                INSERT INTO items (name, quantity, category_id)
                VALUES ($1, $2, $3)
                RETURNING id, name, quantity, category_id
                `,
                [name, quantity, category_id]
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
        const {id, name, quantity, category_id} = req;

        try {
            const result = await pool.query(
                `
                UPDATE items
                SET name = $1,
                    quantity = $2,
                    category_id = $3
                WHERE id = $4
                RETURNING id, name, quantity, category_id
                `,
                [name, quantity, category_id, id]
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
        
        const {name, quantity, category_id, item} = req;
        const updatedItem = { ...item, name: name ?? item.name, quantity: quantity ?? item.quantity, category_id: category_id ?? item.category_id };
        try {
            const result = await pool.query(
                `
                UPDATE items
                SET name = $1,
                    quantity = $2,
                    category_id = $3
                WHERE id = $4
                RETURNING id, name, quantity, category_id
                `,
                [updatedItem.name, updatedItem.quantity, updatedItem.category_id, updatedItem.id]
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