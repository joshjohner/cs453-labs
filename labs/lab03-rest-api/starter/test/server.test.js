import { describe, test, expect, beforeEach, afterEach } from "vitest";
import {items, createServer} from "../src/server.js";

let server;
let baseUrl;

beforeEach(async () => {
    resetState();

    server = createServer();

    await new Promise(resolve => {
        server.listen(0, () => {
            const address = server.address();
            baseUrl = `http://127.0.0.1:${address.port}`;
            resolve();
        });
    });
});

afterEach(async () => {
    await new Promise(resolve => {
        server.close(resolve);
    });
});

async function getJson(path) {
    const response = await fetch(`${baseUrl}${path}`);
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

describe("Lab 2 - REST Api", () => {
    // Test GET /health
    test("GET / health returns status ok", async () => {
        const { status, body } = await getJson("/health");
        expect(status).toBe(200);
        expect(body).toEqual({
            status: "ok"
        });
    });
    // Test GET /items 
    
    // Test GET /items when there are no items

    // Test POST /items with valid data

    // Test POST /items with invalid data

    // Test GET /items after creating an item

    // TEST Get /items/:id with an added item

    // Test GET /items/:id with a valid ID

    // Test GET /items/:id with an invalid ID

    // Test PUT /items/:id with a valid ID and valid data

    // Test PUT /items/:id with a valid ID and invalid data

    // Test PUT /items/:id with an invalid ID

    // Test Delete /items/:id with a valid ID

    // Test Delete /items/:id with an invalid ID

    // Test DELETE an item that was added

});