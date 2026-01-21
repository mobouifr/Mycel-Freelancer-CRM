# Freelancer CRM

*This project has been created as part of the 42 curriculum by [member1], [member2], [member3], [member4], [member5].*

## 🎯 Description

A comprehensive CRM (Customer Relationship Management) system designed for freelancers to manage clients, projects, proposals, and invoices.

## 👥 Team

- **Member 1** - Tech Lead / DevOps / Database / GitHub Management
- **Member 2** - Backend Developer (Auth, Users, Clients, Projects)
- **Member 3** - Backend Developer (Proposals, Invoices, PDF, Jobs)
- **Member 4** - Frontend Developer (Dashboard, Clients, Design System)
- **Member 5** - Frontend Developer (Projects, Proposals, Invoices)

## 🚀 Features

- User authentication and management
- Client management
- Project tracking
- Proposal creation with PDF export
- Invoice generation with PDF export
- Reminders and notifications
- Real-time updates via WebSockets
- Dashboard with analytics

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT Authentication
- WebSockets (Socket.io)

### DevOps
- Docker
- Docker Compose
- GitHub Actions

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

## 🏃 Quick Start

**1. Clone the repository**
```bash
git clone https://github.com/YOUR-USERNAME/freelancer-crm.git
cd freelancer-crm
```

**2. Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your values
```

**3. Run with Docker** (Recommended)
```bash
docker-compose up
```

**4. Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432

## 📚 Documentation

See the `/docs` folder for detailed documentation:
- [Architecture](docs/architecture.md)
- [Database Schema](docs/database-schema.md)
- [API Documentation](docs/api-documentation.md)
- [User Flows](docs/user-flows.md)

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- 42 School for the project guidelines
- Our peers for code reviews and feedback
