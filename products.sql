DROP DATABASE IF EXISTS bamazon;
-- Creates the "bamazon" database --
CREATE DATABASE bamazon;

-- Makes it so all of the following code will affect bamazon --
USE bamazon;

-- Creates the table "products" within bamazon --
CREATE TABLE products (
  -- Creates a numeric column called "item_id" which will automatically increment its default value as we create new rows --
  item_id INTEGER(11) AUTO_INCREMENT NOT NULL,

  product_name VARCHAR(150) NOT NULL,

  department_name VARCHAR(40) NOT NULL,

  price DECIMAL(10,2) DEFAULT 0,

  stock_quantity INTEGER(10) NOT NULL,
  -- Sets item_id as this table's primary key which means all data contained within it will be unique --
  PRIMARY KEY (item_id)
);

-- Creates new rows containing data in all named columns --
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Wilson Official NFL Football", "Sports", 99.95, 100), 
("Kindle Oasis E-reader", "Electronics", 199.99, 250),
("Wilson Evolution Game Ball", "Sports", 59.95, 250),
("Ninento Switch Console", "Electronics", 399.90, 100),
("Smartwool Men's PhD Outdoor Light Mini Socks", "Clothing", 18.95, 250),
("Apple AirPods with Charging Case", "Electronics", 159.00, 150),
("SmartWool Men's NTS Mid 250 Crew Top", "Clothing", 128.95, 200),
("Wilson Pro Tennis Racquet Over Grip, Pack of 3", "Sports", 7.96, 250),
("G Gradual Men's 7 inch Workout Running Shorts", "Clothing", 16.99, 250),
("PS4 Controller - A&O DualShock 4 Wireless Controller for Playstation 4", "Electronics", 29.99, 150);

DELETE FROM products WHERE item_id > 10;
-- view table --
SELECT * FROM products;
