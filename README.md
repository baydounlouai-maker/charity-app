# United Charity

A platform connecting donors with charity events. Charities post fundraising events; donors browse, filter, and contribute.

**Stack:** Node.js · Express · MySQL · Vanilla HTML/CSS/JS

---

## Local Setup

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- MySQL 8.0+

**Install MySQL on Ubuntu/Debian:**

```bash
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql   # auto-start on boot
sudo mysql_secure_installation
```

### 1. Create the database

```bash
mysql -u root -p < backend/init.sql
```

This creates the `char_app` database, all tables, and seeds the default roles.

### 2. Configure the connection

Edit `backend/config/config.js` and set your MySQL credentials:

```js
DB: {
    host: 'localhost',
    user: 'root',
    password: 'your_mysql_password',
    database: 'char_app',
    ...
}
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Start the server

```bash
npm start
```

The server starts at **http://localhost:3001** and serves both the API and the frontend.
Demo data is seeded automatically on the first run.

---

## Demo Accounts

Seeded automatically on first run. Admin password can be overridden with `ADMIN_PASSWORD`.

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin` |
| Charity | `greenshelter` | `demo` |
| Charity | `foodforall` | `demo` |
| Charity | `hopeharbor` | `demo` |
| Donor | `marc` | `demo` |
| Donor | `alice` | `demo` |

