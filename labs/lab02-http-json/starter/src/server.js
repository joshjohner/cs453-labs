import http from "node:http";
import { fileURLToPath, fileURLToPathBuffer } from "node:url";

const DEFAULT_PORT = 3000;

// In-memory request counts for each endpoint.
//  *** Graduate Extension ***
const requestCounts = {
    total: 0, 
    getHealth: 0,
    getRequests: 0,
    postEcho: 0,
    postCalculate: 0,
    calculationError: 0,
    postUppercase: 0
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

// Handle the /calculate endpoint logic separately to keep the request handler cleaner and easier to test.
export function handleCalculate(body) {

    // Extract the operation and operands from the request body.
    const {operation, a, b} = body;

    // Default error response if validation fails.
    let responseObject = {
        error: "Must include an operator and two numerical operands"
    }

    // Validate the input: check for missing fields, non-numeric values
    if (!operation || (a === undefined || !Number.isFinite(a)) || (b === undefined || !Number.isFinite(b))) 
    {
        requestCounts.calculationError++;
        return {
            statusCode: 400,
            response : responseObject
        };
    }
    
    // Perform the calculation based on the specified operation.
    switch (operation) {
        case "add":
            responseObject = { result : a + b};
            break;
    
        case "subtract":
            responseObject = { result : a - b};
            break;
        
        case "multiply":
            responseObject = { result : a * b};
            break;

        case "divide": 
            if (b === 0)
            {
                requestCounts.calculationError++;
                return {
                    statusCode: 400, 
                    response : {
                        error : "Cannot divide by 0"
                    }
                }
            }
            responseObject = { result : a / b};
            break;

        case "power":
            if (b < 0 || !Number.isInteger(a)) {
                requestCounts.calculationError++;
                return {
                    statusCode: 400, 
                    response : {
                        error : "Power is only defined for non-negative integer exponents."
                    }
                };
            }
            responseObject = { result: Math.pow(a, b) };
            break;

        // If the operation is not recognized, return an error.
        default:
            requestCounts.calculationError++;
            return {
                statusCode : 400,
                response : {
                    error : "Unsupported operation."
                }
            }
            break;
        }
    
    // If we reach this point, the calculation was successful. Return the result.
    return {
        statusCode: 200,
        response: responseObject
    };
}


// Main request handler for the server.
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

            if (!body.message || typeof body.message !== "string") {
                sendJson(res, 400, { error: "Must include a message field of type string." });
                return;
            }

            // TODO: Return the parsed JSON body back to the client.
            requestCounts.postEcho ++;
            sendJson(res, 200, { message: body.message });
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
            requestCounts.calculationError++;
            sendJson(res, 400, { error: "Invalid JSON" });
        }

        return;
    }

    // *** Graduate Extension ***
    if (method === "POST" && url === "/uppercase") 
    {
        try {
            const body = await readJsonBody(req);
            requestCounts.postUppercase ++;
            if (!body.text || typeof body.text !== "string") {
                sendJson(res, 400, { error: "Must include a text field of type string" });
                return;
            }

            sendJson(res, 200, { result: body.text.toUpperCase() });
        } catch {
            sendJson(res, 400, { error: "Invalid JSON" });
        }
        return;
    }

    sendJson(res, 404, { error: "Not found" });
}

// Create and export the server instance for testing purposes.
export function createServer() {
    return http.createServer(requestHandler);
}

// Reset the server state (request counts) for testing purposes.
export function resetState() {
    for (const key in requestCounts) {
        requestCounts[key] = 0;
    }
}

// Support for Windows and Unix file paths to allow running the server directly with `node src/server.js` in addition to using `npm start`.
const fileName = fileURLToPath(import.meta.url);
if (fileName === process.argv[1]) {
    const port = process.env.PORT || DEFAULT_PORT;
    const server = createServer();

    server.listen(port, () => {
        console.log(`HTTP JSON server listening on port ${port}`);
    });
}