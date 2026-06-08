import http from "node:http";
import { fileURLToPath, fileURLToPathBuffer } from "node:url";

const DEFAULT_PORT = 3000;

const requestCounts = {
    total: 0, 
    getHealth: 0,
    getRequests: 0,
    postEcho: 0,
    postCalculate: 0
};

export function sendJson(res, statusCode, body) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(body));
}

export function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            if (body.trim() === "") {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch {
                reject(new Error("Invalid JSON"));
            }
        });

        req.on("error", reject);
    });
}

export function handleCalculate(body) {
    // TODO: Validate that operation, a, and b are present.
    // TODO: Validate that a and b are numbers.
    // TODO: Support add, subtract, multiply, and divide.
    // TODO: Return an error for unsupported operations.
    // TODO: Return an error for division by zero.

    return {
        statusCode: 501,
        response: {
            error: "Calculation not implemented yet"
        }
    };
}

export async function requestHandler(req, res) {
    requestCounts.total ++;

    const method = req.method;
    const url = req.url;

    if (method === "GET" && url === "/health") {
        requestCounts.getHealth ++;
        sendJson(res, 200, { status: "ok" });
        return;
    }

    if (method === "GET" && url === "/requests") {
        requestCounts.getRequests ++;
        sendJson(res, 200, { requests: requestCounts });
        return;
    }

    if (method === "POST" && url === "/echo") {
        try {
            const body = await readJsonBody(req);

            // TODO: Return the parsed JSON body back to the client.
            requestCounts.postEcho ++;
            sendJson(res, 501, { error: "Echo not implemented yet" });
        } catch {
            sendJson(res, 400, { error: "Invalid JSON" });
        }

        return;
    }

    if (method === "POST" && url === "/calculate") {
        try {
            const body = await readJsonBody(req);
            requestCounts.postCalculate ++;
            const result = handleCalculate(body);

            sendJson(res, result.statusCode, result.response);
        } catch {
            sendJson(res, 400, { error: "Invalid JSON" });
        }

        return;
    }

    sendJson(res, 404, { error: "Not found" });
}

export function createServer() {
    return http.createServer(requestHandler);
}

export function resetState() {
    for (const key in requestCounts) {
        requestCounts[key] = 0;
    }
}

const fileName = fileURLToPath(import.meta.url);

if (fileName === process.argv[1]) {
    const port = process.env.PORT || DEFAULT_PORT;
    const server = createServer();

    server.listen(port, () => {
        console.log(`HTTP JSON server listening on port ${port}`);
    });
}