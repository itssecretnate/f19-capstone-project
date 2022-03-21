INSERT INTO users(first_name, last_name, username)
VALUES('Nathan', 'Mena', 'natemena');

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