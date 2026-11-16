# Support Ticket Management System

A web-based Support Ticket Management System designed to manage IT support requests, track ticket progress, assign support agents, and improve communication between employees and support teams.

## Project Overview

The Support Ticket Management System allows employees to submit support tickets and enables support staff to manage, assign, resolve, and close those tickets through a centralized platform.

The system includes role-based access control, notifications, audit logs, dashboard statistics, and an integrated AI chatbot for basic assistance.

## Technologies Used

### Frontend
- React.js
- Vite
- Ant Design
- Ant Design Pro Components
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- MySQL / MariaDB
- JSON Web Token (JWT)
- Bcrypt
- Express Rate Limit

## User Roles

The system supports the following user roles:

- **Super Admin:** Manages users, roles, tickets, and administrative features.
- **Agent:** Manages support tickets, handles assignments, and updates ticket progress.
- **Manager:** Monitors and manages support tickets.
- **Employee:** Creates tickets, tracks progress, and communicates with support staff.

## Main Features

### Authentication & User Management
- User registration and login
- Password hashing using Bcrypt
- JWT-based authentication
- Role-based access control
- User management
- Account status management
- Password management

### Ticket Management
- Create support tickets
- View and track tickets
- Assign and reassign tickets to support staff
- Update ticket status
- Resolve and close tickets
- Ticket comments and history

### Dashboard
- Role-based dashboards
- Ticket statistics
- Ticket status overview

### Notifications
- Database-driven notifications
- Unread notification count
- Ticket creation notifications
- Assignment and reassignment notifications

### Settings
- Database-driven settings
- Save and update user preferences
- Persistent settings after page refresh

### Audit Logs
- Track important system activities
- Record administrative actions
- Maintain activity history

### AI Chatbot
- Basic Support Ticket System FAQs
- IT support guidance
- BIOS troubleshooting assistance
- Guidance for creating support tickets when a solution is unavailable

## Project Structure

```text
support-ticket-management-system/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd support-ticket-management-system
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=support_ticket_management
DB_PORT=3306

JWT_SECRET=YOUR_SECURE_SECRET_KEY
```

Import the project database into MySQL or MariaDB using phpMyAdmin.

Start the backend server:

```bash
npm run dev
```

The backend API will run at:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend development server will run at the URL displayed by Vite, usually:

```text
http://localhost:5173
```

## API Overview

The backend provides REST API endpoints for:

- `/api/auth` — Authentication and registration
- `/api/tickets` — Ticket management
- `/api/admin` — User and administrative management
- `/api/settings` — User settings
- `/api/notifications` — Notifications
- `/api/admin/audit-logs` — Audit logs

## Security

The project includes:
- Password hashing
- JWT authentication
- Protected API routes
- Role-based authorization
- Login rate limiting
- Input validation

Additional security hardening and Two-Factor Authentication (2FA) are planned.

## Future Improvements

- Email-based Two-Factor Authentication (2FA)
- Additional security enhancements
- Further chatbot improvements
- Comprehensive system testing

## Author

**Md. Abdullah Al Masum**

## License

This project was developed for academic purposes.