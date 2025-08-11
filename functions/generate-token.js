const { Pool } = require("pg");
const crypto = require("crypto");

exports.handler = async () => {
  // Generate a random token
  const token = crypto.randomBytes(16).toString("hex");

  // Initialize the database connection
  const pool = new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Create tokens table
    await pool.query(
      "CREATE TABLE IF NOT EXISTS tokens (token TEXT PRIMARY KEY, expires_at TIMESTAMP NOT NULL);"
    );

    // Set expiration (1 hour from now)
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    // Store token
    await pool.query("INSERT INTO tokens (token, expires_at) VALUES ($1, $2)", [
      token,
      expiresAt,
    ]);

    // Set token in an HTTP-only cookie
    const cookie = `formToken=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/`;

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  } finally {
    await pool.end();
  }
};
