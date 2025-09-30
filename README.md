# Aurora Jewels

Aurora Jewels is a jewelry e-commerce platform built with **Next.js** (frontend) and **Fastify + TypeScript** (backend). It integrates **Supabase** for database services and **MongoDB** for additional data storage.

---

## 🚀 Features

- Fastify backend with TypeScript support
- Next.js frontend with Turbopack
- Optional Supabase + MongoDB integration
- Simple project structure:

Aurora-jewels/
├── backend/
└── frontend/

- Ready for development and local testing

---

## 🛠 Local Development

### 1️⃣ Clone the repo
```bash
git clone https://github.com/interrupt404/Aurora-jewels.git
cd Aurora-jewels
```
2️⃣ Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Make sure .env exists with Supabase/Mongo credentials
# Example .env:
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_key
# MONGODB_URI=your_mongo_uri
# PORT=3001

# Compile TypeScript
npx tsc

# Start the server
npm run start
Backend runs on http://localhost:3001

Logs warning if Supabase/MongoDB env vars are missing.
```

3️⃣ Frontend Setup
```
cd ../frontend

# Install dependencies
npm install

# Start Next.js dev server
npm run dev
Frontend runs on http://localhost:3000

Turbopack may show a workspace warning — safe to ignore.
```

4️⃣ Access the App

Backend API: http://localhost:3001/

Frontend: http://localhost:3000/

5️⃣ Notes

Always compile backend (npx tsc) after changing .ts files.

.env is optional; backend will warn if credentials are missing but still start.

For production, add real Supabase + MongoDB credentials.

🗂 Project Structure
```
Aurora-jewels/
├── backend/
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   ├── pages/
│   ├── package.json
│   └── next.config.js
└── README.md
```
