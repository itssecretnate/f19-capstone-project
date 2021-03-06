drop table if exists logs;
drop table if exists asset;
drop table if exists model;
drop table if exists manufacturer;
drop table if exists authentication;
drop table if exists users;


CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL
);

  CREATE TABLE authentication (
    authentication_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(16) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL
);

CREATE TABLE manufacturer (
    manufacturer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE model (
    model_id SERIAL PRIMARY KEY,
    manufacturer INTEGER NOT NULL REFERENCES manufacturer(manufacturer_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE asset (
    asset_id SERIAL PRIMARY KEY,
    name VARCHAR(15) NOT NULL UNIQUE,
    manufacturer INTEGER REFERENCES manufacturer(manufacturer_id) ON DELETE SET NULL,
    model INTEGER REFERENCES model(model_id) ON DELETE SET NULL,
    owner INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    creator INTEGER NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
    purchase_order VARCHAR(25)
);

CREATE TABLE logs (
    log_id SERIAL PRIMARY KEY,
    log TEXT NOT NULL,
    related_asset INTEGER REFERENCES asset(asset_id) ON DELETE SET NULL,
    date TIMESTAMP NOT NULL,
    employee_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE SET NULL
);

INSERT INTO users(first_name, last_name)
VALUES('Nathan', 'Mena');

INSERT INTO manufacturer(name)
VALUES('HP'), ('DELL'), ('Apple');

INSERT INTO model(manufacturer, name)
VALUES(3, 'MacBook Pro'), (1, 'PoS');

INSERT INTO asset(name, manufacturer, model, creator)
VALUES('TestAsset1', 3, 1, 1),
('TestAsset2', 1, 2, 1);

INSERT INTO asset(name, manufacturer, model, creator, owner)
VALUES('Nate Test', 1, 2, 1, 1);

INSERT INTO logs(log, related_asset, date, employee_id)
VALUES('Database Seeded! This asset may be related to dummy data.', 1, CURRENT_TIMESTAMP, 1),
('Database Seeded! This asset may be related to dummy data.', 2, CURRENT_TIMESTAMP, 1),
('Database Seeded! This asset may be related to dummy data.', 3, CURRENT_TIMESTAMP, 1);

