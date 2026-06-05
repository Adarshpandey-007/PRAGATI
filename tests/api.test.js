const test = require("node:test");
const assert = require("node:assert");
const { spawn } = require("node:child_process");
const path = require("path");

const TEST_PORT = 4001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

test.describe("PRAGATI Backend API Integration Tests", () => {
  let serverProcess;

  // Start the backend server before running tests
  test.before(() => {
    return new Promise((resolve, reject) => {
      console.log("Starting backend server on port", TEST_PORT, "...");
      
      const serverPath = path.join(__dirname, "..", "backend", "src", "server.js");
      serverProcess = spawn("node", [serverPath], {
        env: {
          ...process.env,
          PORT: TEST_PORT,
          NODE_ENV: "test",
          // Use developer secret for test integrity
          AUTH_JWT_SECRET: "test-secret-key-sih-2026-pragati-platform-development"
        },
        stdio: "inherit"
      });

      // Wait 1.5 seconds for server to bind to port
      setTimeout(() => {
        console.log("Server spun up successfully, starting tests...");
        resolve();
      }, 1500);

      serverProcess.on("error", (err) => {
        console.error("Failed to start server process:", err);
        reject(err);
      });
    });
  });

  // Kill backend server process after testing finishes
  test.after(() => {
    if (serverProcess) {
      console.log("Stopping backend server...");
      serverProcess.kill();
    }
  });

  test("GET /api/health returns status ok", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.deepStrictEqual(body, { status: "ok" });
  });

  test("GET /api/programs returns programs array", async () => {
    const res = await fetch(`${BASE_URL}/api/programs`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(Array.isArray(body), true);
    if (body.length > 0) {
      assert.ok(body[0].slug);
      assert.ok(body[0].title);
    }
  });

  test("POST /api/auth/login returns JWT token for valid credentials", async () => {
    const loginPayload = {
      email: "admin@mock.test",
      password: "AdminPass123!"
    };

    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginPayload)
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.token);
    assert.strictEqual(body.role, "ADMIN");
  });

  test("GET /api/auth/users fails without token", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/users`);
    assert.strictEqual(res.status, 401);
  });

  test("GET /api/auth/users returns users list with admin token", async () => {
    // First log in to get a token
    const loginPayload = {
      email: "admin@mock.test",
      password: "AdminPass123!"
    };

    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginPayload)
    });
    const { token } = await loginRes.json();

    // Fetch users with JWT auth header
    const res = await fetch(`${BASE_URL}/api/auth/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(Array.isArray(body), true);
    assert.ok(body.length > 0);
    assert.strictEqual(body[0].role, "ADMIN");
  });
});
