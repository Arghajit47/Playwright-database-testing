const { test: base, expect } = require("@playwright/test");
const { Client } = require("pg");
require("dotenv").config();

// Extend the base Playwright test
const test = base.extend({
  // Define our custom 'db' fixture with worker scope for connection reuse
  db: [
    async ({}, use) => {
      // 1. Setup: Connect to Supabase
      if (!process.env.SUPABASE_DB_URL) {
        throw new Error("SUPABASE_DB_URL is not set");
      }
      const client = new Client({
        connectionString: process.env.SUPABASE_DB_URL,
      });
      await client.connect();

      // 2. Execute: Pass the connected client to the tests running in this worker
      await use(client);

      // 3. Teardown: Close the connection after all tests in this worker finish
      await client.end();
    },
    { scope: "worker" },
  ],
});

module.exports = { test, expect };
