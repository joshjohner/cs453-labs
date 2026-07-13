export function validateCategory(req, res, next) {
    const name = req.body?.name;
    if (!name) {
        return res.status(400).json({
            error: "Bad Request",
            message: "A name is required."
        });   
    }
    next();
}


export function validateCategoryId(req, res, next) {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "ID must be a positive integer."
        });
    }
    req.id = id;
    next();
}

export function verifyCategoryExists(pool) {
    return async (req, res, next) => {
        if (!req.id) {
            return res.status(500).json({
                error: "Internal Server Error",
                message: "Category ID is missing in request."
            });
        }
        try {
            const result = await pool.query(
                `
                SELECT id, name
                FROM categories
                WHERE id = $1
                `,
                [req.id]
            );  
            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "Category not found."
                });
            }
            req.category = result.rows[0];
            next();
        } catch (error) {
            next(error);
        }
    };
}
