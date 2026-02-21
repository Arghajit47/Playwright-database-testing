// Import from your custom fixture, NOT @playwright/test
const { test, expect } = require("../fixtures/db-fixtures");
import {
  getAllDepartmentsDetails,
  getDepartmentsWithBudgetAbove10k,
  updateDepartmentNameById,
} from "../queryList/departments";
import {
  getAllEmployeesDetails,
  getInactiveEmployees,
  getEmployeesSortedByNameDesc,
  getEmployeesSortedByDeptAndSalary,
  insertNewEmployee,
  updateEmployeeById,
  deleteEmployeeById,
  addManagerIdColumn,
  updateManagerIdForHighIds,
} from "../queryList/employees";
import { getAllTasksDetails } from "../queryList/tasks";
import {
  getAllProjectsDetails,
  getHighPriorityProjects,
  getProjectsSortedByStartDate,
} from "../queryList/projects";
import { getAllAuditLogsDetails } from "../queryList/auditLogs";
import {
  innerJoinEmployeesDepartments,
  leftJoinEmployeesDepartments,
  rightJoinEmployeesDepartments,
  fullOuterJoinEmployeesDepartments,
  oldStyleJoinEmployeesDepartments,
  tasksWithProjectInfo,
  employeesWithManagerInfo,
  employeeProjectTaskDetails,
  departmentEmployeeTaskSummary,
} from "../queryList/joins";
import { pulse } from "@arghajit/playwright-pulse-report";

test.describe("Database Integration & Constraint Testing", () => {
  test("All DB tables are accessible", async ({ db }) => {
    pulse.severity("High");
    await test.step("Get all departments details", async () => {
      const departments = await db.query(getAllDepartmentsDetails);
      console.log("Departments:", JSON.stringify(departments.rows));
      expect(departments.rows).toBeDefined();
    });

    await test.step("Get all employees details", async () => {
      const employees = await db.query(getAllEmployeesDetails);
      console.log("Employees:", JSON.stringify(employees.rows));
      expect(employees.rows).toBeDefined();
    });

    await test.step("Get all tasks details", async () => {
      const tasks = await db.query(getAllTasksDetails);
      console.log("Tasks:", JSON.stringify(tasks.rows));
      expect(tasks.rows).toBeDefined();
    });

    await test.step("Get all projects details", async () => {
      const projects = await db.query(getAllProjectsDetails);
      console.log("Projects:", JSON.stringify(projects.rows));
      expect(projects.rows).toBeDefined();
    });

    await test.step("Get all audit logs details", async () => {
      const auditLogs = await db.query(getAllAuditLogsDetails);
      console.log("Audit Logs:", JSON.stringify(auditLogs.rows));
      expect(auditLogs.rows).toBeDefined();
    });
  });

  test("Filtering and Sorting Data", async ({ db }) => {
    pulse.severity("Low");
    await test.step("Filter departments by budget > 10k", async () => {
      const res = await db.query(getDepartmentsWithBudgetAbove10k);
      console.log("Departments > 10k:", JSON.stringify(res.rows));
      res.rows.forEach((dept) => {
        expect(Number(dept.budget || 10001)).toBeGreaterThan(10000);
      });
    });

    await test.step("Filter inactive employees", async () => {
      const res = await db.query(getInactiveEmployees);
      console.log("Inactive Employees:", JSON.stringify(res.rows));
      expect(res.rows).toBeDefined();
    });

    await test.step("Filter high priority projects", async () => {
      const res = await db.query(getHighPriorityProjects);
      console.log("High Priority Projects:", JSON.stringify(res.rows));
      expect(res.rows).toBeDefined();
    });

    await test.step("Sort employees by name desc", async () => {
      const res = await db.query(getEmployeesSortedByNameDesc);
      console.log("Employees (Name Desc):", JSON.stringify(res.rows));
      expect(res.rows.length).toBeGreaterThan(0);
      for (let i = 0; i < res.rows.length - 1; i++) {
        expect(res.rows[i].full_name >= res.rows[i + 1].full_name).toBeTruthy();
      }
    });

    await test.step("Sort projects by start date desc", async () => {
      const res = await db.query(getProjectsSortedByStartDate);
      console.log("Projects (Date Desc):", JSON.stringify(res.rows));
      expect(res.rows.length).toBeGreaterThan(0);
      for (let i = 0; i < res.rows.length - 1; i++) {
        const date1 = new Date(res.rows[i].start_date);
        const date2 = new Date(res.rows[i + 1].start_date);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    });

    await test.step("Sort employees by dept and salary", async () => {
      const res = await db.query(getEmployeesSortedByDeptAndSalary);
      console.log("Employees (Dept/Salary):", JSON.stringify(res.rows));
      expect(res.rows.length).toBeGreaterThan(0);
      for (let i = 0; i < res.rows.length - 1; i++) {
        const curr = res.rows[i];
        const next = res.rows[i + 1];

        if (curr.dept_id === next.dept_id) {
          // Within same department, salary should be Descending
          expect(Number(curr.salary)).toBeGreaterThanOrEqual(
            Number(next.salary),
          );
        } else {
          // Different departments should be Ascending
          expect(curr.dept_id).toBeLessThan(next.dept_id);
        }
      }
    });
  });

  test("DML Operations (Insert, Update, Delete)", async ({ db }) => {
    pulse.severity("Critical");
    const tempEmpId = 107;

    await test.step("Insert a new employee", async () => {
      await db.query(insertNewEmployee, [
        tempEmpId,
        "Argha Singha",
        null,
        97000,
        true,
      ]);
      const res = await db.query("SELECT * FROM employees WHERE id = $1", [
        tempEmpId,
      ]);
      expect(res.rows[0].full_name).toBe("Argha Singha");
    });

    await test.step("Update an existing employee", async () => {
      await db.query(updateEmployeeById, ["Jhon Doe", 1, 190000, 106]);
      const res = await db.query("SELECT * FROM employees WHERE id = 106");
      expect(res.rows[0].full_name).toBe("Jhon Doe");
    });

    await test.step("Delete the inserted employee", async () => {
      await db.query(deleteEmployeeById, [tempEmpId]);
      const res = await db.query("SELECT * FROM employees WHERE id = $1", [
        tempEmpId,
      ]);
      expect(res.rows.length).toBe(0);
    });

    await test.step("Update department name", async () => {
      await db.query(updateDepartmentNameById, ["Global Marketing", 4]);
      const res = await db.query("SELECT name FROM departments WHERE id = 4");
      expect(res.rows[0].name).toBe("Global Marketing");
    });
  });

  test("Joins and Relationships", async ({ db }) => {
    pulse.severity("Medium");
    await test.step("Inner Join employees and departments", async () => {
      const res = await db.query(innerJoinEmployeesDepartments);
      console.log("Inner Join Result:", JSON.stringify(res.rows));
      expect(res.rows.length).toBeGreaterThan(0);
    });

    await test.step("Left Join employees and departments", async () => {
      const res = await db.query(leftJoinEmployeesDepartments);
      console.log("Left Join Result:", JSON.stringify(res.rows));
      expect(res.rows.length).toBeGreaterThan(0);
    });

    await test.step("Right Join employees and departments", async () => {
      const res = await db.query(rightJoinEmployeesDepartments);
      console.log("Right Join Result:", JSON.stringify(res.rows));
      expect(res.rows.length).toBeGreaterThan(0);
    });

    await test.step("Full Outer Join employees and departments", async () => {
      const res = await db.query(fullOuterJoinEmployeesDepartments);
      console.log("Full Outer Join Result:", JSON.stringify(res.rows));
      expect(res.rows.length).toBeGreaterThan(0);
    });

    await test.step("Old Style Join using comma", async () => {
      const res = await db.query(oldStyleJoinEmployeesDepartments);
      console.log("Old Style Join Result:", JSON.stringify(res.rows));
      expect(res.rows.length).toBeGreaterThan(0);
    });
  });

  test("Complex Relationship Joins", async ({ db }) => {
    pulse.severity("Minor");
    await test.step("Tasks with associated project titles", async () => {
      const res = await db.query(tasksWithProjectInfo);
      console.log("Tasks with Projects:", JSON.stringify(res.rows));
      expect(res.rows.length).toBeGreaterThan(0);
      expect(res.rows[0].title).toBeDefined();
    });

    await test.step("Employees with their managers (Self-Join)", async () => {
      const res = await db.query(employeesWithManagerInfo);
      console.log("Employees with Managers:", JSON.stringify(res.rows));
      expect(res.rows.length).toBeGreaterThan(0);
      // Dana White should have Charlie Day as manager based on previous update
      const dana = res.rows.find((r) => r.employee === "Dana White");
      if (dana) expect(dana.manager).toBeDefined();
    });

    await test.step("Triple Table Join (Employee -> Task -> Project)", async () => {
      const res = await db.query(employeeProjectTaskDetails);
      console.log("Employee Project Task Details:", JSON.stringify(res.rows));
      expect(res.rows).toBeDefined();
    });

    await test.step("Aggregated Join (Department Task Summary)", async () => {
      const res = await db.query(departmentEmployeeTaskSummary);
      console.log("Department Task Summary:", JSON.stringify(res.rows));
      expect(res.rows.length).toBeGreaterThan(0);
      expect(res.rows[0].task_count).toBeDefined();
    });
  });

  test("Schema Modifications (DDL)", async ({ db }) => {
    pulse.severity("Medium");
    await test.step("Add manager_id column to employees", async () => {
      try {
        await db.query(addManagerIdColumn);
        console.log("Successfully added manager_id column");
      } catch (err) {
        if (err.message.includes("already exists")) {
          console.log("manager_id column already exists, skipping ADD");
        } else {
          throw err;
        }
      }
    });

    await test.step("Update manager_id for employees with high IDs", async () => {
      await db.query(updateManagerIdForHighIds, [104, 105]);
      const res = await db.query(
        "SELECT manager_id FROM employees WHERE id > 105",
      );
      res.rows.forEach((row) => {
        expect(row.manager_id).toBe(104);
      });
    });
  });
});
