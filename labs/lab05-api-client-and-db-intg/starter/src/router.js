import express from "express";

export function createRouter(pool) {
    const router = express.Router();

    // Starter route: return every item from the database.
    router.get("/api/items", async (req, res) => {
        try {
        const result = await pool.query(`
            SELECT id, name, quantity
            FROM items
            ORDER BY id ASC
        `);

        res.json({ items: result.rows });
        } catch (error) {
        console.error("Failed to load items:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to load items."
        });
        }
    });

    // Starter route: create one item so the client can demonstrate a write.
    router.post("/api/items", async (req, res) => {
        const name = req.body?.name?.trim();
        const quantity = Number(req.body?.quantity);

        if (!name || !Number.isInteger(quantity) || quantity < 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "A name and non-negative integer quantity are required."
        });
        }

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
    router.get("/api/items/:id", (req, res) => {
        res.status(501).json({ error: "Not implemented yet" });
    });

    // TODO: Replace one item by ID.
    router.put("/api/items/:id", (req, res) => {
        res.status(501).json({ error: "Not implemented yet" });
    });

    // TODO: Partially update one item by ID.
    router.patch("/api/items/:id", (req, res) => {
        res.status(501).json({ error: "Not implemented yet" });
    });

    // TODO: Delete one item by ID.
    router.delete("/api/items/:id", (req, res) => {
        res.status(501).json({ error: "Not implemented yet" });
    });

    return router;
}