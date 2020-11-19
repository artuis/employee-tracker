-- Drops the company if it already exists --
DROP DATABASE IF EXISTS company_db;

-- Create the database task_saver_db and specified it for use.
CREATE DATABASE company_db;

USE company_db;


-- Create department table
CREATE TABLE department (
    id int NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

-- Create role table
CREATE TABLE role (
    id int NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(6, 2),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES department(id),
    PRIMARY KEY (id)
);



-- Create employee table
CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT,
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id),
    PRIMARY KEY (id)
);


INSERT INTO department (name)
    VALUES 
        ("Building"),
        ("Destroying"),
        ("Recycling");

INSERT INTO role (title, salary, department_id) 
    VALUES 
        ("Builder", 10000.00, 0),
        ("Destroyer", 20000.00, 1),
        ("Recycler", 30000.00, 2)


            
