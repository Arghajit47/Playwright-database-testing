export const innerJoinEmployeesDepartments = `Select employees.id, employees.full_name, employees.salary, departments.name, departments.budget, departments.head_id, departments.created_at from employees inner join departments on employees.dept_id = departments.id;`;
export const leftJoinEmployeesDepartments = `select employees.id, employees.full_name, employees.salary, departments.name, departments.budget, departments.head_id, departments.created_at from employees left join departments on employees.dept_id = departments.id;`;
export const rightJoinEmployeesDepartments = `select employees.id, employees.full_name, employees.salary, departments.name, departments.budget, departments.head_id, departments.created_at from employees right join departments on employees.dept_id = departments.id;`;
export const fullOuterJoinEmployeesDepartments = `select employees.id, employees.full_name, employees.salary, departments.name, departments.budget, departments.head_id, departments.created_at from employees full outer join departments on employees.dept_id = departments.id;`;
export const oldStyleJoinEmployeesDepartments = `select * from employees e, departments d where e.dept_id = d.id;`;

// New complex joins
export const tasksWithProjectInfo = `SELECT t.description, p.title FROM tasks t JOIN projects p ON t.project_id = p.id;`;
export const employeesWithManagerInfo = `SELECT e.full_name AS employee, m.full_name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;`;
export const employeeProjectTaskDetails = `SELECT e.full_name, p.title, t.description FROM employees e JOIN tasks t ON e.id = t.assigned_to JOIN projects p ON t.project_id = p.id;`;
export const departmentEmployeeTaskSummary = `SELECT d.name AS department, e.full_name, COUNT(t.id) as task_count FROM departments d LEFT JOIN employees e ON d.id = e.dept_id LEFT JOIN tasks t ON e.id = t.assigned_to GROUP BY d.name, e.full_name ORDER BY d.name;`;
