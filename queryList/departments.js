export const getAllDepartmentsDetails = `SELECT * FROM departments;`;
export const getDepartmentsWithBudgetAbove10k = `select id, name from departments where budget > 10000.00`;
export const updateDepartmentNameById = `update departments set name = $1 where id = $2;`;
