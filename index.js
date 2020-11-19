const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "company_db"
});

connection.connect(err => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    // connection.end();
    promptUser();
});

function promptUser() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "userChoice",
                message: "What would you like to do?",
                choices: [
                        "Update employee role",
                        "Add employee",
                        "Add department",
                        "Add role",
                        "View all employees",
                        "View all departments",
                        "View all roles",
                        "Quit"]
            }
        ])
        .then(answer => {
            switch (answer.userChoice) {
                case "Update employee role":
                    update();
                    break;
                case "Add employee":
                    handleAddEmployee();
                    break;
                case "Add department":
                    handleAddDept();
                    break;
                case "Add role":
                    addRole();
                    break;
                case "View all employees":
                    viewAll();
                    break;
                case "View all departments":
                    viewDepartments();
                    break;
                case "View all roles":
                    viewRoles();
                    break;
                case "Quit":
                    console.log("Goodbye!")
                default:
                    connection.end();
                    break;
            }
        }
    );
}

function addEmployee(first_name, last_name, role_id, manager_id) {
    connection.query(`INSERT INTO company_db.employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`, [first_name, last_name, role_id, manager_id], 
    (err, data) => {
        if (err) throw err;
        console.log();
        promptUser();
    });
}

function addRole() {
    connection.query(`SELECT name FROM company_db.department`,
    (err, data) => {
        if (err) {
            throw err;
        } else {
            handleAddRole(data.map(e => e.name));
        }
    });
}
function update() {
    connection.query(`SELECT CONCAT(first_name, " ", last_name) FROM company_db.employee`,
    (err, data) => {
        if (err) throw err;
        const employees = data.map(e => e[`CONCAT(first_name, " ", last_name)`])
        if (employees.length < 0) {
            console.log("No employees to update role.")
        } else {
            connection.query("SELECT title FROM company_db.role", (err, data) => {
                const roles = data.map(e => e.title);
                inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employeeSelect",
                        message: "Which employee role would you like to update?",
                        choices: employees
                     },
                     {
                        type: "list",
                        name: "roleSelect",
                        message: "What is this employee's new role??",
                        choices: roles
                     }
                ])
                .then(answers => {
                    const first = answers.employeeSelect.substring(0, answers.employeeSelect.indexOf(" "));
                    const last = answers.employeeSelect.substring(answers.employeeSelect.indexOf(" ") + 1);
                    connection.query(`SELECT id FROM company_db.role WHERE title = ?`, answers.roleSelect, (err, data) => {
                        const roleId = data[0].id;
                        connection.query("UPDATE company_db.employee SET role_id = ? WHERE first_name = ? AND last_name = ?", [roleId, first, last], (err, data) => {
                            console.log();
                            promptUser();
                        })
                    })
                })
            })
        }
    });
}

function viewAll() {
    console.log();
    connection.query(`SELECT employee.id, employee.first_name, employee.last_name, title, salary, name AS department, CONCAT(e.first_name," ", e.last_name) as manager
    FROM company_db.employee
    INNER JOIN company_db.role 
    ON company_db.role.id = company_db.employee.role_id
    INNER JOIN company_db.department 
    ON company_db.department.id = company_db.role.department_id
    LEFT JOIN company_db.employee e
    ON company_db.employee.manager_id = e.id`, (err, data) => {
        if (err) throw err;
        console.table(data);
        console.log();
        promptUser();
    });
}

function handleAddEmployee () {
    connection.query(`SELECT CONCAT(first_name, " ", last_name) FROM company_db.employee`, (err, data) => {
        const employees = data.map(e => e[`CONCAT(first_name, " ", last_name)`]);
        employees.push("none");
        connection.query(`SELECT title FROM company_db.role`, (err, data) => {
            const roles = data.map(e => e.title);
            if (roles.length < 1) {
                ("No roles found. Add roles before adding employees.");
                promptUser();
            } else {
                inquirer.prompt([
                    {
                        type: "input",
                        name: "firstName",
                        message: "What is the first name of the new employee?"
                    },
                    {
                        type: "input",
                        name: "lastName",
                        message: "What is the last name of the new employee?"
                    },
                    {
                        type: "list",
                        name: "roleSelect",
                        message: "What is this employee's role?",
                        choices: roles
                    },
                    {
                        type: "list",
                        name: "managerSelect",
                        message: "Who is this employee's manager?",
                        choices: employees
                    }
                    
                ])
                .then(answers => {
                    connection.query("SELECT id FROM company_db.role WHERE title = ?", answers.roleSelect, (err, roleId) => {
                        if (answers.managerSelect === "none") {
                                addEmployee(answers.firstName, answers.lastName, answers.roleSelect, null);
                        } else {
                                const first = answers.managerSelect.substring(0, answers.managerSelect.indexOf(" "));
                                const last = answers.managerSelect.substring(answers.managerSelect.indexOf(" ") + 1);
                                console.log(first, last);
                                connection.query("SELECT id FROM company_db.employee WHERE first_name = ? AND last_name = ?", [first, last],(err, managerId) => {
                                    addEmployee(answers.firstName, answers.lastName, roleId[0].id, managerId[0].id);
                                })
                        }
                    })
                });
            }
        })
    })
}

function handleAddDept () {
    inquirer.prompt([
        {
            type: "input",
            name: "deptName",
            message: "What is the name of the new department?"
        }
    ]).then(answers => {
        connection.query(`INSERT INTO company_db.department (name) VALUES (?)`, answers.deptName, (err, data) => {
                    if (err) throw err;
                    console.log();
                    promptUser();
        });
    })
}

function handleAddRole (deptArr) {
    if (deptArr.length < 1) {
        console.log("No departments found, please add departments before adding roles.");
        promptUser();
    } else {
        inquirer.prompt([
            {
                type: "input",
                name: "role",
                message: "What is the name of the new role?"
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary of the new role?"
            },
            {
                type: "list",
                name: "deptSelect",
                message: "What department does this role belong to?",
                choices: deptArr
            }
        ]).then(answers => {
            connection.query("SELECT id FROM company_db.department WHERE name = ?", answers.deptSelect, (err, deptId) => {
                connection.query("INSERT INTO role (title, salary, department_id) VALUES (?,?,?)", [answers.role, answers.salary, deptId[0].id], (err, data) => {
                    if(err) throw err;
                    console.log();
                    promptUser();
                })
            })
        })
    }
}

function viewDepartments() {
    connection.query("SELECT name FROM company_db.department", (err, data) => {
        console.table(data);
        promptUser();
    })
}

function viewRoles() {
    connection.query("SELECT title, salary, name AS department FROM company_db.role INNER JOIN company_db.department ON company_db.role.department_id = company_db.department.id", (err, data) => {
        console.table(data);
        promptUser();
    })
}