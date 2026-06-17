import { describe, test, expect, beforeEach, afterEach } from "vitest";
import {items, resetState, createApp} from "../src/server.js";

let server;
let baseUrl;

beforeEach(async () => {
    resetState();
    const app = createApp();
    server = await new Promise(resolve => {
        const s = app.listen(3000, () => {
            baseUrl = `http://127.0.0.1:3000`;
            resolve(s);
        });
    });
    baseUrl = `http://127.0.0.1:3000`;
});


afterEach(async () => {
    await new Promise(resolve => {
        server.close(resolve);
    });
});

async function getJson(path) {
    const response = await fetch(`${baseUrl}${path}`,{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });

    const body = await response.json();

    return {
        status: response.status,
        body
    };
}

async function postJson(path, data) {
    const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const body = await response.json();

    return {
        status: response.status,
        body
    };
}

async function postRaw(path, rawBody) {
    const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: rawBody
    });

    const body = await response.json();

    return {
        status: response.status,
        body
    };
}

async function putJson(path, id, data) {
    const response = await fetch(`${baseUrl}${path}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const body = await response.json();

    return {
        status: response.status,
        body
    };
}

async function deleteItem(path, id) {
    const response = await fetch(`${baseUrl}${path}/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (response.status === 204) {
        return {
            status: response.status,
            body: null
        };
    }

    const body = await response.json();

    return {
        status: response.status,
        body
    };
}

describe("Lab 2 - REST Api", () => {
    // Test GET /health
    test("GET / health returns status ok", async () => {
        console.log("Testing GET /health");
        const { status, body } = await getJson("/health");
        expect(status).toBe(200);
        expect(body).toEqual({
            status: "ok"
        });
    });
    
    // Test GET /items 
    test("GET /items returns the same items", async () => {
        console.log("*** Testing GET /items ***");
        const { status, body: _items } = await getJson("/items");
        expect(status).toBe(200);
        expect(_items).toEqual(items);
    });

    
    // Test POST /items with valid data
    test("POST /items with valid data creates a new item", async () => {
        console.log("*** Testing POST /items with valid data ***");
        const newItem = { name: "New Item", quantity: 10};
        const { status, body: addedItem } = await postJson("/items", newItem);
        expect(status).toBe(201);
        expect(addedItem.name).toEqual(newItem.name);
        expect(addedItem.quantity).toEqual(newItem.quantity);
    });
    // Test POST /items with invalid data
    test("POST /items with invalid data returns 400", async () => {
        console.log("*** Testing POST /items with invalid data ***");
        const invalidItem = { name: "" }; // Missing quantity
        const { status } = await postJson("/items", invalidItem);
        expect(status).toBe(400);
    });
    // Test POST /items with missing data
    test("POST /items with missing data returns 400", async () => {
        console.log("*** Testing POST /items with missing data ***");
        const missingDataItem = {}; // Missing name and quantity
        const { status } = await postJson("/items", missingDataItem);
        expect(status).toBe(400);
    });
    // Test POST /items with invalid data
    test("POST /items with missing name returns 400", async () => {
        console.log("*** Testing POST /items with missing name ***");
        const missingNameItem = { quantity: 10 }; // Missing name
        const { status } = await postJson("/items", missingNameItem);
        expect(status).toBe(400);
    });
    // Test GET /items after creating an item
    test("GET /items after creating an item includes the new item", async () => {
        console.log("*** Testing GET /items after creating an item ***");
        const newItem = { name: "Another New Item", quantity: 10 };
        const { body: addedItem } = await postJson("/items", newItem);
        const { body: _items } = await getJson("/items");
        expect(_items).toContainEqual(addedItem);
    });
    
    // TEST Get /items/:id with an added item
    test("GET /items/:id with an added item returns the item", async () => {
        console.log("*** Testing GET /items/:id with an added item ***");
        const newItem = { name: "Item for GET by ID", quantity: 10 };
        const { body: addedItem } = await postJson("/items", newItem);
        const { body: fetchedItem } = await getJson(`/items/${addedItem.id}`);
        expect(fetchedItem).toEqual(addedItem);
    });
    
    // Test GET /items/:id with a valid ID
    test("GET /items/:id with a valid ID returns the item", async () => {
        console.log("*** Testing GET /items/:id with a valid ID ***");
        const newItem = { name: "Item for GET by valid ID", quantity: 10 };
        const { body: addedItem } = await postJson("/items", newItem);
        const { body: fetchedItem } = await getJson(`/items/${addedItem.id}`);
        expect(newItem.name).toBe(fetchedItem.name);
        expect(newItem.quantity).toBe(fetchedItem.quantity);
        expect(fetchedItem).toEqual(addedItem);
    });
    
    // Test GET /items/:id with an invalid ID
    test("GET /items/:id with an invalid ID returns 404", async () => {
        console.log("*** Testing GET /items/:id with an invalid ID ***");
        const { status } = await getJson("/items/9999");
        expect(status).toBe(404);
    });
    
    // Test PUT /items/:id with a valid ID and valid data
    test("PUT /items/:id with a valid ID and valid data updates the item", async () => {
        console.log("*** Testing PUT /items/:id with a valid ID and valid data ***");
        const newItem = { name: "Item for PUT", quantity: 10 };
        const {status: postStatus,  body: addedItem } = await postJson("/items", newItem);
        expect(postStatus).toBe(201); // Ensure the item was created successfully
        const updatedData = { name: "Updated Item", quantity: 20 };
        const {status: putStatus, body: updatedItem } = await putJson(`/items`, addedItem.id, updatedData);
        expect(putStatus).toBe(200); // Ensure the item was updated successfully
        expect(updatedItem).toEqual({ id: addedItem.id, ...updatedData });
    });
    
    // Test PUT /items/:id with a valid ID and invalid data
    test("PUT /items/:id with a valid ID and invalid data returns 400", async () => {
        console.log("*** Testing PUT /items/:id with a valid ID and invalid data ***");
        const newItem = { name: "Item for PUT invalid", quantity: 10 };
        const { body: addedItem } = await postJson("/items", newItem);
        const invalidData = { name: "", quantity: -1 }; // Invalid data
        const { status } = await putJson(`/items`, addedItem.id, invalidData);
        expect(status).toBe(400);
    });
    
    // Test PUT /items/:id with an invalid ID
    test("PUT /items/:id with an invalid ID returns 404", async () => {
        console.log("*** Testing PUT /items/:id with an invalid ID ***");
        const updatedData = { name: "Updated Item", quantity: 20 };
        const { status } = await putJson("/items", 9999, updatedData);
        expect(status).toBe(404);
    });
    
    // Test PUT /items/:id with an invalid ID and invalid data
    test("PUT /items/:id with an invalid ID and invalid data returns 400", async () => {
        console.log("*** Testing PUT /items/:id with an invalid ID and invalid data ***");
        const invalidData = { name: "", quantity: 0  }; // Invalid data
        const { status } = await putJson("/items", 9999, invalidData);
        expect(status).toBe(400);
    });
    
    // Test Delete /items/:id with a valid ID
    test("DELETE /items/:id with a valid ID deletes the item", async () => {
        console.log("*** Testing DELETE /items/:id with a valid ID ***");
        // Assume there is at least one item in the list
        const itemId = items[0].id;
        const { status } = await deleteItem("/items", itemId);
        expect(status).toBe(204);
        // Finally, check that the item is no longer in the list
        const { body: _items } = await getJson("/items");
        expect(_items.find(item => item.id === itemId)).toBeUndefined();
    });
    
    // Test GET /items when there are no items
    test("GET /items when there are no more items", async () => {
        console.log("*** Testing GET /items when there are no more items ***");
        // First, delete all existing items
        const { body: _items } = await getJson("/items");
        for (const item of _items) {
            await deleteItem("/items", item.id);
        }
        // Now, get the items again and expect an empty array   
        const { status, body } = await getJson("/items");
        expect(status).toBe(200);
        expect(body).toEqual([]);
    })
    
    // Test Delete /items/:id with an invalid ID
    test("DELETE /items/:id with an invalid ID returns 404", async () => {
        console.log("*** Testing DELETE /items/:id with an invalid ID ***");
        const invalidId = 9999; // Assuming this ID does not exist
        const { status } = await deleteItem("/items", invalidId);
        expect(status).toBe(404);
    });
    
    // Test DELETE an item that was added
    test("DELETE /items/:id with a newly created item deletes the item", async () => {
        console.log("*** Testing DELETE /items/:id with a newly created item ***");
        // First, add a new item
        const newItem = { name: "New Item", quantity: 10 };
        const { body: addedItem } = await postJson("/items", newItem);
        // Now, delete the newly created item
        const { status } = await deleteItem("/items", addedItem.id);
        expect(status).toBe(204);
        // Finally, check that the item is no longer in the list
        const { body: _items } = await getJson("/items");
        expect(_items.find(item => item.id === addedItem.id)).toBeUndefined();
    });
    
});