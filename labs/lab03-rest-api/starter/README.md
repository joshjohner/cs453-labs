# Lab 3 REST API

## How to Run

```bash
npm install
npm run server
```

The server runs on:

```text
http://localhost:3000
```

## How to Test

```bash
npm test
```

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/items` | Return all items |
| GET | `/items/:id` | Return one item |
| POST | `/items` | Create one item |
| PUT | `/items/:id` | Update one item |
| DELETE | `/items/:id` | Delete one item |

## Reflection Answers

### 1. What makes this API more REST-like than the previous HTTP/JSON lab?

The previous web server had a "state" in that it tracked how many requests it had received. This necessitated a "resetState" method which could simulate resetting state for a new client. In the current API, there is not persistent state (except the in memory database, which simulates a data store and not state). Each request contains all information needed to complete the request. 

### 2. What is the purpose of a route parameter such as `/items/:id`?

The route parameter is used to search/filter/select a specific record or subset of records in the database. 

### 3. Why should `POST`, `PUT`, and `DELETE` use different HTTP methods?

Each serves a specific purpose as to what action the client is requesting the server to perform. This allows the server to reuse routes (item/:id) for different purposes. POST is used to create a new record, PUT modifies a record and DELETE removes a record. It simplifies the routing logic without sacrificing functionality. 

### 4. What is the difference between a `400` error and a `404` error?

A 404 error means that the route was not found (or that the route was found but the record was not found). The 400 error means that the route and record was found (if the action requires retrieving a record) but that some other part of the request did not satisfy the business logic (missing a parameter, parameter value outside of allowable limits etc). 

### 5. How does the OpenAPI file relate to your Express server code?

The OpenAPI file describes the routes the server provides as well as the data that is required to be provided in a request targeting each route. It also describes the shape (schema) of the data that is returned by the server. 

## Graduate Extension

  - POST /items checks to make sure that name is not null and that quantity is neither undefined nor less than 0. If either of these cases are true, the request short circuits and returns a 400 error.
  - PUT /items/:id performs a similar check to make sure that the request body contains actionable information. Realistically, the PUT does behave more like a PATCH in that it can update either the quantity or the name and only errors out if both the error and the name are invalid.
  
  # Tests
   - POST /items runs a test to make sure that invalid data (missing quantity for one test and missing name for another) returns the appropriate error.
   - GET /items/:id runs a test to make sure that an invalid id returns the appropriate error
   - PUT /items/:id runs tests to make sure that invalid data in the request body returns a 400 error (bad request) and that invalid id returns a 404. Also, verifies that invalid id takes precedence by sending an invalid id and bad request and verifies a 404 error.
   - DELETE /items/:id tests to make sure that an invalid id returns a 404 and that the system does not crash when all items have been deleted and a new delete request is recieved. 