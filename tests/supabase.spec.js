// Import from your custom fixture, NOT @playwright/test
const { test, expect } = require("../fixtures/db-fixtures");

test.describe.only("Database Integration & Constraint Testing", () => {
  // --- 1. Testing Constraints (Employees Table) ---
  test("DB should enforce salary > 0 constraint", async ({ db }) => {
    try {
      // Attempt to insert an invalid salary
      await db.query(`
        INSERT INTO employees (full_name, dept_id, salary, is_active) 
        VALUES ('Invalid User', 1, -500, true)
      `);
      // If the above succeeds, the test must fail
      expect(true).toBe(false);
    } catch (error) {
      // Validate that PostgreSQL blocked it due to the specific CHECK constraint
      expect(error.message).toContain("violates check constraint");
    }
  });

  // --- 2. Testing Relational Cascades (Projects -> Tasks) ---
  test("DB should cascade delete tasks when a project is removed", async ({
    db,
  }) => {
    // 1. Insert a temporary project
    const projectRes = await db.query(`
      INSERT INTO projects (title, priority) VALUES ('Temp Project', 3) RETURNING id
    `);
    const projectId = projectRes.rows[0].id;

    // 2. Insert a temporary task linked to that project
    await db.query(
      `
      INSERT INTO tasks (project_id, description) VALUES ($1, 'Temp Task')
    `,
      [projectId],
    );

    // 3. Delete the project directly
    await db.query("DELETE FROM projects WHERE id = $1", [projectId]);

    // 4. Validate the Cascade: Ensure the task was automatically deleted
    const taskCheck = await db.query(
      "SELECT * FROM tasks WHERE project_id = $1",
      [projectId],
    );
    expect(taskCheck.rows.length).toBe(0);
  });

  // --- 3. Testing Triggers/Audit Logs (Departments Table) ---
  test("DB should log budget updates to the audit_logs table", async ({
    db,
  }) => {
    const deptId = 5; // 'HR' Department
    const newBudget = 20000.0;

    // 1. Fetch current budget to verify the "old_value" later
    const initialRes = await db.query(
      "SELECT budget FROM departments WHERE id = $1",
      [deptId],
    );
    const oldBudget = initialRes.rows[0].budget;

    // 2. Update the budget
    await db.query("UPDATE departments SET budget = $1 WHERE id = $2", [
      newBudget,
      deptId,
    ]);

    // 3. Query the audit_logs table to verify the trigger worked
    const auditRes = await db.query(`
      SELECT * FROM audit_logs 
      WHERE table_name = 'departments' AND action = 'UPDATE' 
      ORDER BY log_id DESC LIMIT 1
    `);

    expect(auditRes.rows.length).toBe(1);

    // 4. Validate the JSONB data exactly matches the old state
    const logEntry = auditRes.rows[0];
    expect(logEntry.old_value.budget).toBe(Number(oldBudget));
  });
});
