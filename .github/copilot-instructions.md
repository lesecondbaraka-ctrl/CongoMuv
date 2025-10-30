# CongoMuv AI Coding Agent Instructions

Welcome to the CongoMuv codebase! This document provides essential guidelines for AI coding agents to be productive in this project. It highlights the architecture, workflows, conventions, and integration points specific to CongoMuv.

---

## 🏗️ Project Overview

CongoMuv is an e-ticketing system for transportation in the Democratic Republic of Congo. It consists of:

- **Frontend**: A React-based application using TypeScript and TailwindCSS.
- **Backend**: A Node.js/Express API with PostgreSQL for data storage.
- **Database**: Managed via Supabase, with dynamic schema creation.
- **Integrations**: Payment gateways (Flutterwave, Airtel Money, Orange Money), real-time WebSocket communication, and external services like Twilio and Nodemailer.

---

## 📂 Key Directories

### Frontend
- `src/components/`: Reusable React components (e.g., `AuthModal.tsx`, `DashboardStats.tsx`).
- `src/pages/`: Page-level components for routing.
- `src/lib/`: Utility files for authentication, Supabase configuration, and production services.
- `src/types/`: TypeScript type definitions.

### Backend
- `backend/src/controllers/`: API controllers for handling requests.
- `backend/src/routes/`: Route definitions for the API.
- `backend/src/services/`: Business logic (e.g., payment processing, email notifications).
- `backend/src/utils/`: Helper functions (e.g., validation, QR code generation).
- `backend/tests/`: Unit and integration tests.

---

## 🔄 Developer Workflows

### Frontend
1. **Start Development**:
   ```bash
   npm run dev
   ```
2. **Build for Production**:
   ```bash
   npm run build
   npm run preview
   ```
3. **Type Checking**:
   ```bash
   npm run typecheck
   ```
4. **Linting**:
   ```bash
   npm run lint
   ```

### Backend
1. **Start Development**:
   ```bash
   npm run dev
   ```
2. **Run Tests**:
   ```bash
   npm test
   ```
3. **Database Setup**:
   - Create the database:
     ```sql
     CREATE DATABASE congomuv;
     ```
   - The schema is auto-generated on server start.

---

## 📐 Project-Specific Conventions

1. **Dynamic Data**: All data is fetched dynamically from Supabase. Avoid hardcoding static data.
2. **2FA Authentication**: Implemented via Supabase with OTP sent to user emails.
3. **TypeScript**: Strongly typed throughout the frontend and backend.
4. **Error Handling**: Use `try-catch` blocks and centralized error middleware in the backend.
5. **API Design**: Follow RESTful principles. Example endpoints:
   - `POST /api/auth/login`
   - `GET /api/trips`
   - `POST /api/bookings`

---

## 🔗 Integration Points

1. **Supabase**:
   - URL and keys are stored in `.env.local`.
   - Example configuration:
     ```typescript
     import { createClient } from '@supabase/supabase-js';
     const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
     ```
2. **Payment Gateways**:
   - Flutterwave integration in `backend/src/services/payments.js`.
3. **Real-Time Communication**:
   - WebSocket setup in `backend/src/server.js`.
4. **Email/SMS Notifications**:
   - Nodemailer and Twilio configurations in `backend/src/services/notifications.js`.

---

## 🛠️ Debugging Tips

1. **Frontend Issues**:
   - Check the browser console for errors.
   - Verify `.env.local` configurations.
2. **Backend Issues**:
   - Check logs in the terminal.
   - Ensure PostgreSQL and Redis (if used) are running.
3. **Database Issues**:
   - Verify schema in Supabase.
   - Check for missing environment variables.

---

## 📜 Additional Notes

- **Dynamic Schema**: The backend auto-generates database tables if they don't exist.
- **Admin Dashboard**: Accessible at `#/admin` for managing operators, routes, and trips.
- **Testing**: Ensure all new features include unit tests in `backend/tests/`.

---

For further details, refer to the `README.md` files in the project and backend directories.