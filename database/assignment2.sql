-- 1. Insert Tony Stark into the account table
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- 2. Update Tony Stark's account_type to "Admin"
UPDATE account
SET account_type = 'Admin'
WHERE account_id = (
        SELECT account_id
        FROM account
        WHERE account_email = 'tony@starkent.com'
    );
-- 3. Delete Tony Stark's account
DELETE FROM account
WHERE account_id = (
        SELECT account_id
        FROM account
        WHERE account_email = 'tony@starkent.com'
    );
-- 4. Update GM Hummer description
UPDATE inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_id = (
        SELECT inv_id
        FROM inventory
        WHERE inv_make = 'GM'
            AND inv_model = 'Hummer'
    );
-- 5. Select make, model, and classification for "Sport" category vehicles
SELECT i.inv_make,
    i.inv_model,
    c.classification_name
FROM inventory i
    INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';
-- 6. Update all inventory image paths
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');