CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    username VARCHAR(16) NOT NULL
);

CREATE TABLE authentication (
    authentication_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL
);

CREATE TABLE manufacturer (
    manufacturer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE model (
    model_id SERIAL PRIMARY KEY,
    manufacturer INTEGER NOT NULL REFERENCES manufacturer(manufacturer_id),
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE asset (
    assset_id SERIAL PRIMARY KEY,
    name VARCHAR(15) NOT NULL UNIQUE,
    manufacturer INTEGER REFERENCES manufacturer(manufacturer_id),
    model INTEGER REFERENCES model(model_id),
    owner INTEGER REFERENCES users(user_id),
    creator INTEGER NOT NULL REFERENCES users(user_id),
    purchase_order VARCHAR(25)
);

CREATE TABLE logs (
    log_id SERIAL PRIMARY KEY,
    log TEXT NOT NULL,
    related_asset INTEGER REFERENCES asset(asset_id),
    date TIMESTAMP NOT NULL,
    employee_id INTEGER NOT NULL REFERENCES users(user_id)
);



