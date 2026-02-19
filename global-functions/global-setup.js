const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
require("dotenv").config();

async function globalSetup() {
  console.log("🔄 Creating native PostgreSQL backup...");

  const dbUrl = process.env.SUPABASE_DB_URL;
  const backupPath = path.join(process.cwd(), "supabase_public_backup.sql");

  try {
    const dbParams = new URL(dbUrl);
    const pgEnv = {
      ...process.env,
      PGPASSWORD: decodeURIComponent(dbParams.password),
      PGUSER: dbParams.username,
      PGHOST: dbParams.hostname,
      PGPORT: dbParams.port,
      PGDATABASE: dbParams.pathname.split("/")[1],
    };

    // Explanation of flags:
    // --clean         : Drop tables before recreating them during restore
    // --if-exists     : Don't throw errors if a table doesn't exist yet when dropping
    // --file          : Where to save the SQL dump
    // -t <table_name> : ONLY backup the specified tables
    const tables = [
      "departments",
      "employees",
      "projects",
      "tasks",
      "audit_logs",
    ];
    const tableFlags = tables.map((t) => `-t ${t}`).join(" ");
    const brewPath = "/opt/homebrew/opt/postgresql@16/bin/pg_dump";
    const pgDumpPath = fs.existsSync(brewPath) ? brewPath : "pg_dump";

    const command = `${pgDumpPath} ${tableFlags} --clean --if-exists --file="${backupPath}"`;

    // Execute the command synchronously with PG environment variables
    execSync(command, { stdio: "pipe", env: pgEnv });

    console.log(`✅ Backup created successfully at: ${backupPath}`);
  } catch (error) {
    console.error(
      "❌ Failed to create database backup. Ensure pg_dump is installed and credentials are correct.",
    );
    console.error(error.message);
    throw error;
  }
}

module.exports = globalSetup;

if (require.main === module) {
  globalSetup()
    .then(() => {
      console.log("🚀 Custom direct setup completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Custom direct setup failed:", err);
      process.exit(1);
    });
}
