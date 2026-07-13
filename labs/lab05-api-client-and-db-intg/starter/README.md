# Lab 5 

## How to Run

```bash
npm install
docker compose up -d
npm run api
npm run client
```

Open:

```text
http://localhost:5173
```

Postgres is exposed on:

```text
postgres://postgres:postgres@localhost:5433/lab05
```

## What I Added

- `GET /api/items/:id`
  - Added route (with id and item exists validation). Also, encorporated retrieving the category.
- `PUT /api/items/:id`
  - Added route (with id, item exists and validity check on put body). 
  - Encorporated updating the category. 
  - With more time, I would have added also a validity check on the category reference.
- `PATCH /api/items/:id`
  - Added route (with id, item exists and partial update validity check). 
  - Encorporated a patch option on the category.
  - With more time, I would have added also a validity check on the category reference. 
- `DELETE /api/items/:id`
  - Added route with id and item exists check
- Created and exported validation modules and added them to the routes
- Client-side UI for the GET, PUT, PATCH and DELETE routes. 
  - Started adding UI for the ability to POST, PUT and DELETE categories but ran out of time.

## Graduate Extension

Added 'categories' table to the database and created a relationship between items and categories. Created validation for
- Verify category id is valid 
- Verify category id refers to an actual category
- Verify new category body is valid
- Verify update category body is valid

Created routes for 
- `GET /api/categories` - gets the list of categories
- `GET /api/categories/{id}` - gets a category by id
- `PUT /api/categories/{id}` - updates a category
- `POST /api/categories` - creates a new category
- `DELETE /api/categories/{id}` - deletes a category

Updated items route
- `GET /api/items` to optionally accept a query parameter to filter for all items of a category


## Reflection Answers

### 1. What changed when the API moved from in-memory data to Postgres?

Persistence between server startup/shutdown cycles. It also added more complexity to the router and the validation.

### 2. When should you use `PUT` instead of `PATCH`?

When the entire object is to be replaced instead of just updating a single field in the row(s).

### 3. What kinds of validation belong in the API even if the browser client also validates input?

Any kind of validation that is enforced by business rules. The database will ensure data integrity, although handling data integrity in the validation middleware will make handling bad requests cleaner.

### 4. How does the browser client help you test the API differently than `curl` alone?

The browser forces additional security (specifically origin) and sends/receives headers. 

### 5. If you added an extension, what did you add and why?

I added categories. This was a simple 1-to-1 relationship, was fairly simple to implement. Implementing it on the client was SIGNIFICANTLY more difficult and quickly started to turn into spaghetti code (so it was partially abadoned). 
