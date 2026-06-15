import express from "express";
import cors from "cors";

// In-memory data store for items
const items = [];

const PORT = process.env.PORT || 3000;

const app = express();

// This middleware tells Express to parse JSON request bodies.
app.use(express.json());

// Required for Postman 
app.use(cors());

// GET /health - Return a simple health check response
app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

// GET /items - Return all items
app.get("/items", (req, res) => {
    res.json({
        items
    });
});
// GET /items/:id - Return one item by ID
app.get("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = items.find(i => i.id === id);
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ error: "Item not found" });
    }
});

// Post /items - Create a new item
app.post("/items", (req, res) => {
    // Read the name and quantity from the request body
    const { name, quantity } = req.body;
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
    // Get the item ID from the URL parameters and find the item in the array
    const id = Number(req.params.id);
    const item = items.find(i => i.id === id);
    
    if (item) {
        // The item exists, so update its name and quantity based on the request body
        const { name, quantity } = req.body;
        item.name = name !== undefined ? name : item.name;
        item.quantity = quantity !== undefined ? quantity : item.quantity;
        res.json(item);
    } else {
        // The item does not exist, so return a 404 Not Found response
        res.status(404).json({ error: "Item not found" });
    }
});

// DELETE /items/:id - Delete an existing item
app.delete("/items/:id", (req, res) => {
    // Get the item ID from the URL parameters and find the item in the array
    const id = Number(req.params.id);
    const index = items.findIndex(i => i.id === id);

    if (index !== -1) {
        // The item exists, so remove it from the array and return it in the response
        const deletedItem = items.splice(index, 1);
        res.json(deletedItem[0]);
    } else {
        // The item does not exist, so return a 404 Not Found response
        res.status(404).json({ error: "Item not found" });
    }
});

// This catches requests that did not match any route above.
app.use((req, res) => {
    res.status(404).json({
        error: "Not found"
    });
});

// Start the server and listen for incoming requests.
const server = app.listen(PORT, () => {
    resetState();
    console.log(`Express routes example listening on port ${PORT}`);
});

// Server error handling
server.on("error", error => {
    console.error("Unable to start server:", error.message);
});

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