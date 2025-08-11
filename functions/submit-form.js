const { Pool } = require("pg");

exports.handler = async (event) => {
  // Check the token from header
  const sentToken = event.headers["x-form-token"];
  if (!sentToken) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Forbidden: Missing token" }),
    };
  }

  // Initialize the database connection
  const pool = new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Verify token in database
    const result = await pool.query(
      "SELECT expires_at FROM tokens WHERE token = $1",
      [sentToken]
    );

    if (
      result.rows.length === 0 ||
      new Date(result.rows[0].expires_at) < new Date()
    ) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Forbidden: Invalid or expired token" }),
      };
    }

    // Ensure the request is a POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    // Parse the form data
    const { name, email } = JSON.parse(event.body);

    // Validate input
    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Name and email are required" }),
      };
    }

    // Create users table
    await pool.query(
      "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL);"
    );

    // Insert data
    await pool.query("INSERT INTO users (name, email) VALUES ($1, $2)", [
      name,
      email,
    ]);

    // Optionally, delete used token
    await pool.query("DELETE FROM tokens WHERE token = $1", [sentToken]);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Form submission saved successfully" }),
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
