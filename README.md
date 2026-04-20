# HIRO Recruitment Tracker

HIRO is a powerful, data-driven recruitment tracking system designed to streamline the hiring workflow. It provides specialized interfaces for recruiters to log their daily activities and for administrators to monitor performance across the organization.

## 🚀 Key Features

### 👨‍💼 Recruiter Portal
Recruiters can efficiently manage their daily tasks and track their progress through:
*   **Daily Activity Submission**: Seamlessly log recruitment metrics including Resumes, Shortlisting, Interviews (Scheduled & Completed), Offers, and Closures.
*   **Dynamic Classifications**: Support for multiple verticals (IT, Sales, Digital Marketing) and the ability to add custom "Other" positions on the fly.
*   **Real-time Activity Log**: A live view of today's submissions to ensure data accuracy and track daily wins.
*   **Profile Management**: Personalized user settings and profile customization.
*   **Performance Tracking**: Visual indicators of daily activity levels and progress.

### 👑 Admin & Management Dashboard
Administrators gain high-level insights and control over the recruitment pipeline:
*   **Executive Dashboard**: A birds-eye view of all recruitment activities across the company.
*   **Visual Analytics**: Interactive charts (using Chart.js) illustrating trends, conversion rates, and recruiter performance.
*   **Advanced Reporting**: Generate detailed reports by vertical, recruiter, or specific timeframes to identify bottlenecks.
*   **Resource Management**: 
    *   Manage master lists of **Positions** and **Departments**.
    *   Activate or deactivate hiring roles based on current requirements.
*   **System Notifications**: Automated alerts for recruitment milestones and system-wide updates.

---

## 🛠️ Technology Stack

*   **Frontend**: React.js 19, Vite, Chart.js, Tailwind CSS, React Router.
*   **Backend**: Node.js, Express.js.
*   **Database**: PostgreSQL with Prisma ORM.
*   **Integration**: Supabase (for database interactions and storage).
*   **Authentication**: Secure JWT-based authentication system.

---

## 📂 Project Structure

```text
HIRO/
├── backend/            # Express.js Server
│   ├── prisma/         # Prisma Schema & Database Configuration
│   ├── src/
│   │   ├── routes/     # API Endpoints (Auth, Entries, Dashboard, Positions)
│   │   ├── middleware/ # Authentication & Error Handling
│   │   └── utils/      # Helper functions
│   └── server.js       # Backend Entry Point
├── frontend/           # React Frontend (Vite)
│   ├── src/
│   │   ├── components/ # Role-based UI Components (Admin, Recruiter, UI)
│   │   ├── api/        # API and Supabase configurations
│   │   └── App.jsx     # Routing & Core Layout logic
│   └── public/         # Static Assets
└── .env                # Environment Variables (Root/Frontend/Backend)
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   PostgreSQL Database

### 2. Backend Setup
```bash
cd backend
npm install
# Configure .env with DATABASE_URL
npx prisma db push
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Configure .env with VITE_API_BASE_URL
npm run dev
```

---

## 📝 Usage Notes
*   **Role-Based Access**: The application automatically routes users to their respective dashboards (Admin or Recruiter) upon login based on their profile role.
*   **Data Integrity**: Daily entries are logged with timestamps and linked to the unique Recruiter ID for accurate performance reporting.
