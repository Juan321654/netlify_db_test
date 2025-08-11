# Static Site with Secure Netlify Functions & DB

A static site (`index.html`, `script.js`) uses Netlify Functions to save form data to a Neon Postgres DB (created from the netlify dashboard to attach to the hosted static site). API access is restricted to the hosted site (`https://static-with-serverless-db.netlify.app`).

- **Functions**:
  - `generate-token.js`: Creates a random token, stores it in an HTTP-only cookie, and saves it to a DB `tokens` table (expires in 1h).
  - `submit-form.js`: Verifies the token (header + cookie + DB check) before saving form data to the `users` table.
- **Security**: Token in cookie ensures only the site can call the API. No hardcoded tokens or user login required.
- **Setup**: Deploy `index.html`, `script.js`, `functions/*.js`, `package.json` to Netlify. Set `NETLIFY_DATABASE_URL` in Netlify env vars.

Test: Load site, submit form. API rejects external calls (e.g., Postman) without valid token.