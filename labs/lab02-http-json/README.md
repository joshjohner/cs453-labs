# Lab 2 - 

### File Descriptions

| File                  | Purpose                                                    |
| --------------------- | ---------------------------------------------------------- |
| `src/server.js`       | Starts the HTTP server and handles incoming HTTP requests. |
| `test/server.test.js` | Contains automated tests for the HTTP JSON service.        |
| `package.json`        | Defines project metadata, dependencies, and npm scripts.   |

## Features

The HTTP server supports the following routes.

### `GET /health`

Returns a JSON response showing that the server is running.

Example response:

```json
{
  "status": "ok"
}
```

### `POST /echo`

Accepts a JSON request body and returns the same data back to the client.

Example request body:

```json
{
  "message": "hello"
}
```

Example response:

```json
{
  "message": "hello"
}
```

*Note : The route only accepts string data. Numerical data will return an error.*

### `POST /calculate`

Accepts a JSON request body with an operation and two numbers.

Example request body:

```json
{
  "operation": "add",
  "a": 2,
  "b": 3
}
```

Example response:

```json
{
  "result": 5
}
```

The server supports the following operations:

| Operation  | Meaning               |
| ---------- | --------------------- |
| `add`      | Add `a` and `b`       |
| `subtract` | Subtract `b` from `a` |
| `multiply` | Multiply `a` and `b`  |
| `divide`   | Divide `a` by `b`     |

### `GET /requests`

Returns information about how many requests the server has handled since it started.

Example response:

```json
{
    "requests": {
        "total": 9,
        "getHealth": 1,
        "getRequests": 4,
        "postEcho": 1,
        "postCalculate": 2,
        "calculationError": 2,
        "postUppercase": 1
    }
}
```

## Error Handling

The server will return errors for the following:

* Unknown routes.
* Unsupported HTTP methods.
* Invalid JSON.
* Missing required fields.
* Unsupported calculation operations.
* Division by zero.

Use reasonable HTTP status codes such as:

| Status Code | Meaning               |
| ----------- | --------------------- |
| `200`       | OK                    |
| `400`       | Bad request           |
| `404`       | Not found             |
| `405`       | Method not allowed    |
| `500`       | Internal server error |

Error responses should be returned as JSON.

Example error response:

```json
{
  "error": "Invalid JSON"
}
```


## Configuring the Port

The server uses port `3000` by default.

You can run the server on a different port by setting the `PORT` environment variable:

```bash
PORT=4000 npm run server
```

Then send requests to the new port:

```bash
curl http://localhost:4000/health
```

## Testing

This lab includes automated tests for the HTTP JSON service.

Run the tests from the starter directory:

```bash
npm test
```

Some tests may fail when you first receive the starter code. Your job is to update the implementation until the required tests pass.

The tests should check behavior such as:

* `GET /health` returns a JSON status response.
* `POST /echo` returns the submitted JSON data.
* `POST /calculate` performs supported calculations.
* Unknown routes return an error.
* Invalid JSON returns an error.
* The server does not crash on bad input.

You may also run the tests in watch mode if supported by the starter project:

```bash
npm run test:watch
```

## Reflection Questions

Answer the following questions in your submission:

1. What is the difference between a TCP message and an HTTP request?
  - An HTTP message is a TCP message in a specific format (specifically with header and a body)
2. What does the `Content-Type: application/json` header tell the server?
  - That the request body is being sent in the form of JSON
3. Why should a server return different HTTP status codes for different situations?
  - So that the request client can easily handle errors using a basic switch statement on universally defined error codes
4. What happens if the client sends invalid JSON?
  - The server JSON parser fails and returns an error code and a message informing the client of the invalid JSON.
5. How is this lab different from Lab 1?
  - In this lab, we are returning more structured data than simple messages. Calling code within the server relies on specifically defined properties to relay information. 
  - All responses are in JSON format. 

## Graduate Students

Graduate students should complete one additional feature.

Choose one of the following:

1. Add a new route, such as `GET /time` or `POST /uppercase`.
  - See /uppercase
2. Add one additional calculation operation and document it.
  - See /calculate { "operation" : "power" }
3. Improve the request counter so it tracks counts by route.
  - Additionally added logic to track calculation errors and total requests.
4. Add additional automated tests for error handling.
  - Echo with missing message
  - Echo with invalid message (numerical)
  - Test /uppercase
  - Uppercase with missing text
  - Uppercase with invalid text (numerical)
  - Updated /requests to include additional fields

