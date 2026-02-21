const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const dns = require("dns").promises;
require("dotenv").config();

async function globalSetup() {
  console.log("🔄 Creating native PostgreSQL backup...");

  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error("SUPABASE_DB_URL environment variable is required");
  }
  const backupPath = path.join(process.cwd(), "supabase_public_backup.sql");

  try {
    const dbParams = new URL(dbUrl);

    // Force IPv4 resolution to prevent "Network is unreachable" errors in CI (GHA)
    // which often occur when tools like pg_dump try to use IPv6.
    let ipV4Host = dbParams.hostname;
    try {
      const lookup = await dns.lookup(dbParams.hostname, { family: 4 });
      ipV4Host = lookup.address;
      console.log(`🌐 Resolved ${dbParams.hostname} to IPv4: ${ipV4Host}`);
    } catch (dnsError) {
      console.warn(
        `⚠️ Could not resolve ${dbParams.hostname} to IPv4. Falling back to hostname.`,
      );
      console.warn(dnsError.message);
    }

    const pgEnv = {
      ...process.env,
      PGPASSWORD: decodeURIComponent(dbParams.password),
      PGUSER: dbParams.username,
      PGHOST: ipV4Host,
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
    execSync(command, { stdio: "pipe", env: pgEnv, timeout: 30000 });

    console.log(`✅ Backup created successfully at: ${backupPath}`);
  } catch (error) {
    console.error(
      `❌ Failed to create database backup at: ${backupPath}. Ensure pg_dump is installed and credentials are correct.`,
    );
    if (error.stderr) {
      console.error(`PG_DUMP ERROR: ${error.stderr.toString()}`);
    } else if (error.stdout) {
      console.error(`PG_DUMP OUTPUT: ${error.stdout.toString()}`);
    }
    console.error(`Message: ${error.message}`);
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
