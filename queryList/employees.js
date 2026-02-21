export const getAllEmployeesDetails = `SELECT * FROM employees;`;
export const getInactiveEmployees = `select full_name from employees where is_active is false`;
export const getEmployeesSortedByNameDesc = `select full_name from employees order by full_name desc;`;
export const getEmployeesSortedByDeptAndSalary = `select * from employees order by dept_id asc, salary desc;`;
export const insertNewEmployee = `insert into employees (id, full_name, dept_id, salary, is_active) VALUES ($1, $2, $3, $4, $5);`;
export const updateEmployeeById = `update employees SET full_name = $1, dept_id = $2, salary = $3 where id = $4;`;
export const deleteEmployeeById = `delete from employees where id = $1;`;
export const addManagerIdColumn = `ALTER TABLE employees ADD manager_id int NULL DEFAULT NULL;`;
export const updateManagerIdForHighIds = `update employees set manager_id = $1 where id > $2;`;
