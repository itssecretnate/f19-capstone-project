SELECT authentication.user_id, users.first_name, users.last_name, email, is_admin FROM authentication
  LEFT OUTER JOIN users ON authentication.user_id = users.user_id
  WHERE authentication.username = 'natemena' AND 'test' = authentication.password; -- USERNAME and PASSWORD.


-- Create new user command
WITH new_user AS (
INSERT INTO users(first_name, last_name)
VALUES('Jimmy', 'John')
RETURNING user_id)
 
INSERT INTO authentication(user_id, email, username, password, is_admin)
SELECT user_id, 'test@test.com', 'JimmyJohn', 'password', false FROM new_user;