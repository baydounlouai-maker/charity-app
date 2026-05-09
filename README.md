# United Charity

A platform connecting donors with charity events. Charities post fundraising events; donors browse, filter, and contribute.

**Stack:** Node.js · Express · MySQL · Vanilla HTML/CSS/JS

---

## Local Setup

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- MySQL 8.0+

### 1. Create the database

In MySQL, creates the `char_app` database.

### 2. Configure the connection

Edit `config/config.js` and set your MySQL credentials:

```js
DB: {
    host: 'localhost',
    user: 'root',                       // <--- your mysql server user
    password: 'your_mysql_password',    // <--- your mysql server password
    database: 'char_app',
    ...
}
```

### 3. Install backend dependencies

In the root of the project, run:

```bash
npm run install
```

### 4. Start the server

In the root of the project, run:

```bash
npm start
```

The server starts at **http://localhost:3001** by default and serves both the API and the frontend.
Database initialization and demo data is seeded automatically on the first run.

#### Note

If port `3001` is blocked or already used in your machine, you can change the port to use inside `config/config.js` and then change it to the new port when you open the **http://localhost:<new-port>** site in your browser.

---

## Demo Accounts

Seeded automatically on first run. Admin password can be overridden with `ADMIN_PASSWORD`.

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin` |
| Charity | `hopefoundation` | `demo` |
| Donor | `marc_gives` | `demo` |

