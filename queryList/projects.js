export const getAllProjectsDetails = `SELECT * FROM projects;`;
export const getHighPriorityProjects = `select title from projects where priority = 1;`;
export const getProjectsSortedByStartDate = `select * from projects order by start_date desc;`;
