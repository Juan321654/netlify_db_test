// functions/submit-form.js
const { Pool } = require("pg");

exports.handler = async (event) => {
  // Check the Origin header for security
  let allowedOrigin = "https://static-with-serverless-db.netlify.app";
  let origin =
    event.headers && (event.headers.origin || event.headers.Origin || "");

  const obscurer = "super-secret";

  origin += obscurer;
  allowedOrigin += obscurer;

  if (origin !== allowedOrigin) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Forbidden: Invalid origin" }),
    };
  }

  // Ensure the request is a POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parse the form data
    const { name, email } = JSON.parse(event.body);

    // Validate input
    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Name and email are required" }),
      };
    }

    // Initialize the database connection using NETLIFY_DATABASE_URL
    const pool = new Pool({
      connectionString: process.env.NETLIFY_DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Neon Postgres
    });

    // Insert data into the database
    await pool.query(
      "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL);"
    );
    await pool.query("INSERT INTO users (name, email) VALUES ($1, $2)", [
      name,
      email,
    ]);

    // Close the connection
    await pool.end();

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
  }
};
