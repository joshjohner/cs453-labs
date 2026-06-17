import express from "express";
import cors from "cors";

// In-memory data store for items
export const items = [];

const PORT = process.env.PORT || 3000;

const app = createApp();


// Start the server and listen for incoming requests.
const server = app.listen(PORT, () => {
    resetState();
});

// Server error handling
server.on("error", error => {
    console.error("Unable to start server:", error.message);
});

export function createApp(){
    const app = express();
    
    // This middleware tells Express to parse JSON request bodies.
    app.use(express.json());
    
    // Required for Postman 
    app.use(cors());
    
    // This middleware tells Express to parse JSON request bodies.
    app.use(express.json());
    
    // Required for Postman 
    app.use(cors());
    
    // GET /health - Return a simple health check response
    app.get("/health", (req, res) => {
        console.log("Health check requested");
        res.json({
            status: "ok"
        });
    });
    
    // GET /items - Return all items
    app.get("/items", (req, res) => {
        console.log("Fetching all items");
        res.json(items);
    });
    // GET /items/:id - Return one item by ID
    app.get("/items/:id", (req, res) => {
        const id = Number(req.params.id);
        console.log(`Fetching item with ID: ${id}`);
        const item = items.find(i => i.id === id);
        if (item) {
            console.log(`Item found: ${JSON.stringify(item)}`);
            res.json(item);
        } else {
            console.log(`Item with ID: ${id} not found`);
            res.status(404).json({ error: "Item not found" });
        }
    });
    
    // Post /items - Create a new item
    app.post("/items", (req, res) => {
        // Read the name and quantity from the request body
        const { name, quantity } = req.body;
        
        // Validate the name and quantity
        if (!name || quantity === undefined || quantity < 0) {
            console.log(`Invalid item data: ${JSON.stringify(req.body)}`);
            return res.status(400).json({ error: "Invalid item data" });
        }
        
        console.log(`Creating a new item with data: ${JSON.stringify(req.body)}`);
        // Create a new item with a unique ID and add it to the items array
        const newItem = {
            id: items.length + 1,
            name,
            quantity
        };
        //Add the item to the array and return it in the response
        items.push(newItem);
        res.status(201).json(newItem);
    });
    
    // PUT /items/:id - Update an existing item
    app.put("/items/:id", (req, res) => {
        console.log(`Received request to update item with ID: ${req.params.id}`);
        const { name, quantity } = req.body;

        if ((name === undefined && quantity === undefined) || (name === "" || quantity < 0)) {
            console.log(`Invalid update data: ${JSON.stringify(req.body)}`);
            return res.status(400).json({ error: "Invalid update data" });
        }

        // Get the item ID from the URL parameters and find the item in the array
        const id = Number(req.params.id);
        const item = items.find(i => i.id === id);
        console.log(`Updating item with ID: ${id} with data: ${JSON.stringify(req.body)}`);
        if (item) {
            // The item exists, so update its name and quantity based on the request body
            console.log(`Current item data: ${JSON.stringify(item)}`);
            item.name = name !== undefined ? name : item.name;
            item.quantity = quantity !== undefined ? quantity : item.quantity;
            res.status(200).json(item);
        } else {
            console.log(`Item with ID: ${id} not found`);
            // The item does not exist, so return a 404 Not Found response
            res.status(404).json({ error: "Item not found" });
        }
    });
    
    // DELETE /items/:id - Delete an existing item
    app.delete("/items/:id", (req, res) => {
        // Get the item ID from the URL parameters and find the item in the array
        const id = Number(req.params.id);
        const index = items.findIndex(i => i.id === id);
        console.log(`Deleting item with ID: ${id}`);
        if (index !== -1) {
            // The item exists, so remove it from the array inform the client of the successful operation
            const deletedItem = items.splice(index, 1);
            console.log(`Deleted item: ${JSON.stringify(deletedItem[0])}`);
            res.status(204).send();
        } else {
            // The item does not exist, so return a 404 Not Found response
            console.log(`Item with ID: ${id} not found`);
            res.status(404).json({ error: "Item not found" });
        }
    });
    
    // This catches requests that did not match any route above.
    app.use((req, res) => {
        console.log(`Request for unknown route: ${req.method} ${req.url}`);
        res.status(404).json({
            error: "Route Not found"
        });
    });

    return app;
}

export function resetState(){
    items.length = 0;
    items.push(
        {
            id: 1,
            name: "Beer",
            quantity: 24
        },
        {
            id: 2,
            name: "Chips",
            quantity: 10
        },
        {
            id: 3,
            name: "Burgers",
            quantity: 5
        }
    );
}