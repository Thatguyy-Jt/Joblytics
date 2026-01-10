# Joblytics - AI-Powered Job Application Tracker

> A production-ready, full-stack SaaS application demonstrating modern web development practices, scalable architecture, and AI integration.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18+-green)](https://expressjs.com/)

## 🎯 Project Overview

**Joblytics** is a comprehensive job application management platform that showcases enterprise-level software development practices. Built as a full-stack application, it demonstrates proficiency in modern web technologies, clean architecture, security best practices, and AI integration.

### Key Highlights

- **Production-Ready Architecture** - Layered architecture with clear separation of concerns
- **Enterprise Security** - JWT authentication, password hashing, input validation, secure cookie handling
- **AI Integration** - OpenAI API integration with intelligent prompt engineering
- **Scalable Design** - Repository pattern, service layer, and modular codebase
- **Modern Frontend** - React with TypeScript, responsive design, dark mode, and smooth animations
- **Background Processing** - Cron jobs for automated email reminders
- **Comprehensive Testing** - Testing strategies and documentation

## 🏗️ Architecture & Design Patterns

### Backend Architecture

The backend follows a **layered architecture** pattern ensuring maintainability and testability:

```
┌─────────────────────────────────────┐
│         Controllers Layer            │  HTTP request handling
├─────────────────────────────────────┤
│         Services Layer               │  Business logic & orchestration
├─────────────────────────────────────┤
│      Repositories Layer              │  Data access abstraction
├─────────────────────────────────────┤
│         Models Layer                 │  Database schemas (Mongoose)
└─────────────────────────────────────┘
```

**Key Design Decisions:**
- **Repository Pattern** - Abstracts database operations for easy testing and database switching
- **Service Layer** - Encapsulates business logic, keeping controllers thin
- **Middleware Chain** - Authentication, validation, and error handling
- **Dependency Injection** - Services and repositories are loosely coupled

### Frontend Architecture

- **Component-Based Architecture** - Reusable, composable React components
- **Context API** - Global state management for authentication and theme
- **Custom Hooks** - Reusable logic extraction
- **Type Safety** - Full TypeScript implementation
- **API Client** - Centralized Axios instance with interceptors for error handling

## 🛠️ Technology Stack

### Backend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | 18+ |
| **Express.js** | Web framework | 4.18+ |
| **MongoDB** | NoSQL database | Latest |
| **Mongoose** | ODM for MongoDB | 8.0+ |
| **JWT** | Authentication tokens | 9.0+ |
| **Bcrypt** | Password hashing | 5.1+ |
| **Zod** | Runtime type validation | 3.22+ |
| **OpenAI API** | AI-powered features | 4.20+ |
| **Nodemailer** | Email service | 7.0+ |
| **node-cron** | Scheduled tasks | 4.2+ |

### Frontend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library | 18.3+ |
| **TypeScript** | Type safety | 5.8+ |
| **Vite** | Build tool & dev server | 5.4+ |
| **Tailwind CSS** | Utility-first CSS | 3.4+ |
| **Framer Motion** | Animation library | 12.24+ |
| **React Router** | Client-side routing | 6.30+ |
| **Axios** | HTTP client | 1.13+ |
| **Recharts** | Data visualization | 2.15+ |
| **shadcn/ui** | Component library | Latest |

## 🔐 Security Implementation

### Authentication & Authorization

- **JWT-based Authentication** - Access and refresh token pattern
- **HttpOnly Cookies** - Prevents XSS attacks on token storage
- **Password Hashing** - Bcrypt with salt rounds (10)
- **Token Expiration** - Short-lived access tokens (15min) with refresh tokens (7-30 days)
- **Route Protection** - Middleware-based authentication on protected routes
- **Ownership Validation** - Users can only access their own data

### Data Validation & Sanitization

- **Zod Schema Validation** - Runtime type checking on all inputs
- **Environment Variable Validation** - Fail-fast configuration validation
- **Input Sanitization** - Prevents injection attacks
- **CORS Configuration** - Restricts cross-origin requests

### Best Practices

- **Environment Variables** - Sensitive data never committed
- **Error Handling** - Centralized error handling with appropriate HTTP status codes
- **Logging** - Structured logging for debugging and monitoring
- **Rate Limiting Ready** - Architecture supports rate limiting implementation

## 🤖 AI Integration

### Features Implemented

1. **Resume Matching Analysis**
   - Compares user resume with job descriptions
   - Provides match score, strengths, gaps, and improvement suggestions
   - Structured JSON response with actionable insights

2. **Interview Preparation**
   - Generates tailored interview questions based on job description
   - Provides preparation tips and key talking points
   - Role-specific guidance

3. **Resume Improvement**
   - Suggests bullet point improvements
   - Identifies missing keywords
   - Provides ATS-friendly recommendations

### Technical Implementation

- **Prompt Engineering** - Carefully crafted prompts for consistent, structured outputs
- **Response Normalization** - Consistent JSON structure across all AI endpoints
- **Mock Mode** - Development-friendly mocking system for testing without API costs
- **Error Handling** - Graceful degradation when AI service is unavailable

## 📊 Key Features & Technical Achievements

### 1. Job Application Management
- **CRUD Operations** - Full create, read, update, delete functionality
- **Advanced Filtering** - Status, date range, company, and search filters
- **Pagination** - Efficient data loading with cursor-based pagination
- **Data Validation** - Comprehensive input validation using Zod schemas

### 2. Analytics Dashboard
- **MongoDB Aggregation Pipelines** - Complex queries for analytics
- **Real-time Statistics** - Total applications, success rates, status distribution
- **Trend Analysis** - Monthly application trends and patterns
- **Data Visualization** - Interactive charts using Recharts

### 3. Automated Reminder System
- **Background Jobs** - Cron-based scheduled task processing
- **Email Notifications** - Automated email reminders for interviews and follow-ups
- **Flexible Scheduling** - Support for multiple reminder types (interview, follow-up, deadline)
- **Status Tracking** - Tracks sent reminders to prevent duplicates

### 4. Email Service
- **Multi-Provider Support** - SMTP (Gmail, custom), Resend, SendGrid
- **HTML Templates** - Professional, responsive email templates
- **Transactional Emails** - Welcome, password reset, reminders, notifications
- **Connection Verification** - Validates email service configuration on startup

### 5. User Experience
- **Dark Mode** - System preference detection with manual toggle
- **Responsive Design** - Mobile-first approach, works on all screen sizes
- **Smooth Animations** - Framer Motion for polished interactions
- **Loading States** - Skeleton loaders and progress indicators
- **Error Handling** - User-friendly error messages and toast notifications

## 📁 Project Structure

```
joblytics/
├── backend/
│   ├── src/
│   │   ├── ai/                    # AI service & prompt templates
│   │   ├── analytics/              # Analytics aggregation logic
│   │   ├── config/                 # Environment config & validation
│   │   ├── controllers/            # HTTP request handlers
│   │   ├── emails/                 # Email service & templates
│   │   ├── jobs/                   # Background job processors
│   │   ├── loaders/                # App initialization
│   │   ├── middleware/             # Auth, validation middleware
│   │   ├── models/                 # Mongoose schemas
│   │   ├── repositories/           # Data access layer
│   │   ├── routes/                 # Express route definitions
│   │   ├── services/               # Business logic layer
│   │   ├── utils/                  # JWT, password, OpenAI utilities
│   │   └── validations/            # Zod validation schemas
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   │   ├── ai/                 # AI result display components
│   │   │   ├── dashboard/          # Dashboard layout components
│   │   │   ├── landing/            # Marketing page components
│   │   │   └── ui/                 # shadcn/ui components
│   │   ├── contexts/               # React contexts (Auth, Theme)
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/                    # Utilities & API client
│   │   ├── pages/                  # Page components
│   │   └── main.tsx                # Application entry point
│   └── package.json
│
└── README.md
```

## 🔑 API Design

### RESTful API Endpoints

**Authentication**
- `POST /api/auth/register` - User registration with validation
- `POST /api/auth/login` - JWT token generation
- `POST /api/auth/logout` - Token invalidation
- `GET /api/auth/me` - Current user information
- `PUT /api/auth/profile` - Profile updates
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset with token

**Job Applications**
- `GET /api/applications` - List with filtering, sorting, pagination
- `GET /api/applications/:id` - Get single application
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

**AI Features**
- `POST /api/applications/:id/ai/resume-match` - Resume analysis
- `POST /api/applications/:id/ai/interview-prep` - Interview preparation
- `POST /api/applications/:id/ai/resume-improvement` - Resume suggestions

**Analytics**
- `GET /api/analytics` - Comprehensive analytics
- `GET /api/analytics/status-distribution` - Status breakdown
- `GET /api/analytics/monthly-trends` - Time-series data

**Reminders**
- `GET /api/reminders` - List reminders with filters
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

### API Design Principles

- **RESTful Conventions** - Standard HTTP methods and status codes
- **Consistent Response Format** - Uniform JSON structure
- **Error Handling** - Meaningful error messages with appropriate status codes
- **Input Validation** - All inputs validated before processing
- **Authentication** - Protected routes with JWT middleware

## 🧪 Testing & Quality Assurance

### Testing Strategy

- **Unit Tests** - Service and utility function testing
- **Integration Tests** - API endpoint testing with authentication
- **E2E Testing** - Complete user flow validation
- **AI Mocking** - Development mode for testing without API costs

### Code Quality

- **TypeScript** - Type safety across frontend
- **Zod Validation** - Runtime type checking on backend
- **ESLint** - Code linting and formatting
- **Modular Architecture** - Easy to test individual components

## 🚀 Deployment Readiness

### Environment Configuration

- **Environment Variables** - All configuration externalized
- **Production Builds** - Optimized production builds for frontend
- **Database Migration Ready** - Mongoose schema versioning support
- **Logging** - Structured logging for production monitoring

### Scalability Considerations

- **Stateless API** - JWT tokens enable horizontal scaling
- **Database Indexing** - Optimized queries with proper indexes
- **Background Jobs** - Asynchronous processing for heavy tasks
- **Caching Ready** - Architecture supports Redis integration

## 📚 Documentation

Comprehensive documentation included:

- **[EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)** - Email service configuration
- **[QUICK_START_TESTING.md](./QUICK_START_TESTING.md)** - Quick start and testing guide
- **[REMINDER_TROUBLESHOOTING.md](./REMINDER_TROUBLESHOOTING.md)** - Reminder system troubleshooting
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Comprehensive testing checklist

## 🎓 Technical Skills Demonstrated

### Backend Development
- ✅ RESTful API design and implementation
- ✅ Authentication and authorization systems
- ✅ Database design and optimization
- ✅ Background job processing
- ✅ Email service integration
- ✅ AI/ML API integration
- ✅ Input validation and sanitization
- ✅ Error handling and logging
- ✅ Environment configuration management

### Frontend Development
- ✅ React with TypeScript
- ✅ State management (Context API)
- ✅ Routing and navigation
- ✅ Form handling and validation
- ✅ Data visualization
- ✅ Responsive design
- ✅ Dark mode implementation
- ✅ Animation and transitions
- ✅ API integration

### DevOps & Best Practices
- ✅ Version control (Git)
- ✅ Environment variable management
- ✅ Code organization and modularity
- ✅ Documentation
- ✅ Security best practices
- ✅ Error handling strategies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API Key (optional - mock mode available)

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/joblytics.git
cd joblytics

# Backend setup
cd backend
npm install
# Configure .env file (see documentation)
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

See detailed setup instructions in the documentation files.

## 📝 License

MIT License - See LICENSE file for details

## 👨‍💻 Developer

Built as a portfolio project demonstrating full-stack development capabilities, modern architecture patterns, and production-ready code practices.

---

**Built with attention to detail, best practices, and scalability in mind.**
