const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const dns = require("dns").promises;
require("dotenv").config();

async function globalTeardown() {
  console.log("🔄 Restoring database from backup...");

  const dbUrl = process.env.SUPABASE_DB_URL;
  const backupPath = path.join(process.cwd(), "supabase_public_backup.sql");

  try {
    const dbParams = new URL(dbUrl);

    // Force IPv4 resolution to prevent "Network is unreachable" errors in CI (GHA)
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

    // Execute the SQL file against your database
    // -q (quiet) suppresses the massive wall of text that psql usually outputs
    const brewPath = "/opt/homebrew/opt/postgresql@16/bin/psql";
    const psqlPath = fs.existsSync(brewPath) ? brewPath : "psql";

    const command = `${psqlPath} -q -f "${backupPath}"`;

    execSync(command, { stdio: "pipe", env: pgEnv });

    console.log("✅ Database fully restored to its pre-test state.");
  } catch (error) {
    console.error(
      "❌ Failed to restore database. Ensure psql is installed and credentials are correct.",
    );
    console.error(error.message);
    throw error;
  }
}

module.exports = globalTeardown;

if (require.main === module) {
  globalTeardown()
    .then(() => {
      console.log("🚀 Custom direct teardown completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Custom direct teardown failed:", err);
      process.exit(1);
    });
}
