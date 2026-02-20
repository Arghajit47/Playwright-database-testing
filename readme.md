# Playwright PostgreSQL Automation

A professional-grade automated testing suite for PostgreSQL using Playwright. This repository demonstrates advanced database testing techniques, including DML/DDL operations, complex joins, automated backups, and detailed reporting via Playwright Pulse.

## 📁 Repository Structure

```text
|-- tests
|   |-- supabase.spec.js        # Core database test suite
|-- queryList                   # Organized SQL queries by entity
|   |-- departments.js
|   |-- employees.js
|   |-- projects.js
|   |-- tasks.js
|   |-- auditLogs.js
|   |-- joins.js
|-- fixtures
|   |-- db-fixtures.js          # Custom Playwright 'db' fixture
|-- global-functions            # Lifecycle hooks (Backup & Restore)
|   |-- global-setup.js
|   |-- global-teardown.js
|-- playwright.config.js        # Test configuration & reporters
|-- package.json
|-- .env                        # Local environment variables
|-- .github/workflows/          # CI/CD (GitHub Actions)
```

## 🚀 Key Features

- **Automated Lifecycle Hooks**: Native `pg_dump` and `psql` scripts manage database state, creating a backup before tests and restoring it after completion.
- **Complex Query Coverage**: Rigorous testing of Inner/Left/Right/Full/Cross joins, self-joins, DML triggers, and schema migrations.
- **Reporting**: Integrated **Playwright Pulse** for beautiful, data-driven test reports.
- **CI/CD Ready**: Optimized for GitHub Actions with IPv4 DNS resolution for Supabase connectivity.

## 🛠️ Getting Started

### 1. Installation

```bash
npm install
npx playwright install
```

### 2. Database Configuration

Create a `.env` file in the root directory and add your Supabase connection string:

```env
SUPABASE_DB_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

> [!TIP]
> **CI Tip**: For GitHub Actions, use the **Supavisor pooler** connection (Port `6543`) to ensure IPv4 compatibility:
> `aws-0-ap-south-1.pooler.supabase.com`

### 3. Running Tests

```bash
# Run all database tests
npm run test

# Direct Database Management (Native PG tools required)
npm run db:setup     # Manually trigger backup
npm run db:teardown  # Manually trigger restore
```

## 📊 Reporting

After the tests finish, you can generate and view professional reports:

```bash
# View standard Playwright HTML report
npx playwright show-report

# View Playwright Pulse report
npm run pulse-report
```

## 🔄 Workflow Overview (GitHub Actions)

The CI pipeline is fully automated and follows these steps:

1. **Infrastructure**: Sets up Node.js and PostgreSQL clients.
2. **Environment**: Sanitizes and verifies the connection host.
3. **Execution**:
   - `db:setup`: Creates a native backup of production-level tables.
   - `npx playwright test`: Executes all integration and constraint tests.
   - `db:teardown`: Restores the database to its pre-test state.
4. **Reporting**: Generates both static and dynamic Pulse reports for artifact upload.

## 📝 License

This project is licensed under the ISC License.
