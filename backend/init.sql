CREATE DATABASE IF NOT EXISTS char_app;
USE char_app;

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(100)  NOT NULL UNIQUE,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id  INT NOT NULL,
  role_id  INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

INSERT IGNORE INTO roles (name) VALUES ('Admin'), ('Charity'), ('Donor');

CREATE TABLE IF NOT EXISTS categories (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

INSERT IGNORE INTO categories (name) VALUES
  ('Food'), ('Supplies'), ('Clothing'), ('Shelter'), ('Medical'), ('Education'), ('Other');

CREATE TABLE IF NOT EXISTS user_addresses (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  label      VARCHAR(100) NOT NULL,
  street     VARCHAR(255) NOT NULL,
  city       VARCHAR(100) NOT NULL,
  state      VARCHAR(100),
  zip        VARCHAR(20),
  country    VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_contacts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  label      VARCHAR(100) NOT NULL,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255),
  phone      VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS requests (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  charity_id  INT NOT NULL,
  category_id INT NOT NULL,
  description TEXT NOT NULL,
  due_date    DATE NOT NULL,
  status      ENUM('Pending', 'Approved', 'Rejected', 'Finalized', 'Cancelled') NOT NULL DEFAULT 'Pending',
  address_id  INT NOT NULL,
  contact_id  INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (charity_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (address_id)  REFERENCES user_addresses(id),
  FOREIGN KEY (contact_id)  REFERENCES user_contacts(id)
);

CREATE TABLE IF NOT EXISTS donations (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  request_id       INT NOT NULL,
  donation_type    ENUM('monetary', 'resources') NOT NULL,
  monetary_amount  DECIMAL(10, 2),
  description      TEXT NOT NULL,
  donation_date    DATE NOT NULL,
  status           ENUM('Pending', 'Accepted', 'Rejected', 'Finalized', 'Cancelled') NOT NULL DEFAULT 'Pending',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);
