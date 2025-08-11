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
    const tokenResult = await pool.query(
      "SELECT expires_at FROM tokens WHERE token = $1",
      [sentToken]
    );

    if (
      tokenResult.rows.length === 0 ||
      new Date(tokenResult.rows[0].expires_at) < new Date()
    ) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Forbidden: Invalid or expired token" }),
      };
    }

    // Fetch users
    const userResult = await pool.query("SELECT name, email FROM users");
    const users = userResult.rows;

    return {
      statusCode: 200,
      body: JSON.stringify({ users }),
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
