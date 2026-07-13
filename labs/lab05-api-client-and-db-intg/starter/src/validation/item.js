export function validateId(req, res, next) {
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

export function validateItem(req, res, next) {
    const name = req.body?.name;
    const quantity = Number(req.body?.quantity);    
    if (!name || isNaN(quantity) || quantity < 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "A name and non-negative integer quantity are required."
        });   
    }
    req.name = name;
    req.quantity = quantity;
    next();
}

export function validatePartialItem(req, res, next) {
    console.log("Validating partial item with body", req.body);
    const name = req.body?.name;
    const quantityRaw = req.body?.quantity;


    const noNameProvided = name === undefined;
    const noQuantityProvided = quantityRaw === undefined;

    if (noNameProvided && noQuantityProvided) { 
        return res.status(400).json({
            error: "Bad Request",
            message: "Must provide either a name or a quantity."
        });   
    }

    const nameIsBad = name !== undefined && !name;
    const quantityIsBad = quantityRaw !== undefined && (isNaN(Number(quantityRaw)) || Number(quantityRaw) < 0);

    if (nameIsBad || quantityIsBad) {
        return res.status(400).json({
            error: "Bad Request",
            message: "Name cannot be empty and quantity must be a non-negative integer."
        });   
    }

    req.name = name !== undefined ? name : req.item?.name;
    req.quantity = quantityRaw !== undefined ? Number(quantityRaw) : req.item?.quantity;
    next();
}

export function verifyItemExists(pool) {
    return async (req, res, next) => {
        if (!req.id) {
            return res.status(500).json({
                error: "Internal Server Error",
                message: "Well this is embarrasing... we forgot to validate the ID before checking if the item exists."
            });
        }
        try {
                const result = await pool.query(
                `
                SELECT id, name, quantity
                FROM items
                WHERE id = $1
                `,
                [req.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: "Not Found",
                    message: `Item with ID ${req.id} not found.`
                });
            }
            req.item = result.rows[0];
            next();
        } catch (err) {
            next(err);
        }
    };
}