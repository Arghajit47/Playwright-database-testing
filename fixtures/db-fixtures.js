const { test: base, expect } = require("@playwright/test");
const { Client } = require("pg");
require("dotenv").config();

// Extend the base Playwright test
const test = base.extend({
  // Define our custom 'db' fixture
  db: async ({}, use) => {
    // 1. Setup: Connect to Supabase
    const client = new Client({
      connectionString: process.env.SUPABASE_DB_URL,
    });
    await client.connect();

    // 2. Execute: Pass the connected client to the test
    await use(client);

    // 3. Teardown: Close the connection after the test finishes
    await client.end();
  },
});

module.exports = { test, expect };
