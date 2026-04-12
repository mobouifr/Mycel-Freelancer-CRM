# What's Wrong According to School Rules: Risk Assessment

Based on the `ProjectRequirementAndModulesPoints.md` file, the evaluation criteria are extremely strict. A single missed rule usually results in an automatic 0. 

Here is the assessment of where our project currently risks breaking the rules, ranked by risk level, and what we need to verify before the final evaluation:

## 🚨 CRITICAL RISKS (Will cause an instant 0)

### 1. "No warnings or errors should appear in the browser console."
*   **The Risk:** Evaluators will open Chrome DevTools (F12) immediately. If they see *any* yellow warnings or red errors while clicking around (e.g., React `missing key in list`, `Hydration mismatch`, or 404s for missing images), they will fail the project.
*   **Action Item:** The team needs to click through **every single page and modal** in the deployed production environment with the console open just to be sure. Fix any unused imports or stray `console.log()` statements leftover from debugging.

### 2. "For the backend, HTTPS must be used everywhere."
*   **The Risk:** In standard DevOps, modern apps use an Nginx reverse proxy that handles the HTTPS/SSL certificate, and then internally routes standard HTTP to the Node.js backend container (`http://backend:3001`). 
*   **Action Item:** Some extremely strict evaluators interpret "everywhere" literally—meaning the NestJS backend container itself must be configured with HTTPS certificates, not just Nginx. We must either be prepared to defend the Nginx Reverse Proxy architecture as an industry standard, or simply mount our SSL certificates into the NestJS container and bind it to `https://` to be 100% bulletproof.

### 3. "Privacy Policy and Terms of Service... Not be placeholder or empty pages."
*   **The Risk:** We have `PrivacyPolicy.tsx` and `TermsOfService.tsx` created. However, if these pages say "Lorem Ipsum" or are generic templates with empty brackets `[Your Company Name]`, the evaluator will reject the project.
*   **Action Item:** Open these pages and write actual, relevant content. Because it is a CRM, the privacy policy must mention how client data, emails, and notes are stored and secured. Additionally, ensure these links are highly visible (e.g., in the Footer and on the Login/Signup page).

---

## ⚠️ MEDIUM RISKS (Could fail depending on the evaluator)

### 4. "Real-time updates are reflected across all connected users when applicable."
*   **The Risk:** Since this is a Freelancer CRM, users don't share accounts. However, if a user is logged in on their phone and their laptop at the same time, and they create a Calendar Event on the laptop, does it instantly pop up on the phone without refreshing? 
*   **Action Item:** We have a `VITE_WS_URL` in our `.env`, suggesting we have WebSockets. Make sure WebSockets are broadcasting creations/deletions (like new Notes or Events) to *all* active sessions for that specific `userId`.

### 5. "No data corruption or race conditions occur with simultaneous user actions."
*   **The Risk:** If we have logic that reads a value, modifies it in memory, and writes it back (e.g., updating a client's total billed amount: `const newTotal = oldTotal + 100; await db.update(newTotal)`), doing this rapidly from two tabs will cause the database to save the wrong number.
*   **Action Item:** Search the backend for any financial, xp/leveling, or metrics logic. Make sure Prisma is utilizing atomic operations for math (e.g., using `increment: { amount: 100 }` directly in the database call) rather than doing the math in JavaScript.

### 6. "All forms and user inputs must be properly validated in both the frontend and backend."
*   **The Risk:** The evaluator will attempt to bypass our frontend React validation and send a naked POST request holding a 5,000-character string or SQL injection directly to our API via Postman/cURL.
*   **Action Item:** Ensure the NestJS backend uses DTOs strictly alongside `class-validator` decorations (`@IsString()`, `@MaxLength(255)`, `@IsEmail()`) on **every single POST/PUT endpoint**. If the backend doesn't reject bad data with a 400 status code, we will lose points.

---

## ✅ Things we are currently doing perfectly:
*   **Docker & Single Command:** Our `docker-compose.yml` allows a single-command spin-up.
*   **Framework Rules:** We are correctly using NestJS and React, which fall perfectly under their definition of approved structural frameworks.
*   **Environment Variables:** We have locally ignored `.env` files with a highly accurate `.env.example` file provided.
*   **Security:** Passwords are being properly salted and hashed dynamically via `bcrypt`, satisfying the basic security requirements.