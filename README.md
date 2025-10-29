# Rotativa Myra Demo

A modern full-stack application built with Next.js, NestJS, and MongoDB.

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS
- **Backend**: NestJS with TypeScript
- **Database**: MongoDB 7
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js 20 or higher
- npm
- Docker and Docker Compose
- Make (optional, for using Makefile commands)

## Getting Started

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/EdoAbarca/rotativa-myra-demo.git
cd rotativa-myra-demo
```

2. Start the application with Docker Compose:
```bash
make dev
# or
docker compose up --build
```

This will start:
- Frontend on http://localhost:3000
- Backend API on http://localhost:3001
- MongoDB on localhost:27017

### Local Development (Without Docker)

1. Install dependencies:
```bash
make install
# or manually:
cd backend && npm install
cd ../frontend && npm install
```

2. Start MongoDB (you'll need MongoDB running locally):
```bash
mongod --dbpath ./data
```

3. Start the backend:
```bash
make dev-backend
# or
cd backend && npm run start:dev
```

4. Start the frontend:
```bash
make dev-frontend
# or
cd frontend && npm run dev
```

## Available Commands

Run `make help` to see all available commands. Key commands include:

- `make dev` - Start development environment with Docker
- `make build` - Build Docker images
- `make up` - Start containers in detached mode
- `make down` - Stop and remove containers
- `make logs` - Show logs from all containers
- `make test-backend` - Run backend tests
- `make test-frontend` - Run frontend tests
- `make lint` - Lint both frontend and backend
- `make clean` - Stop containers and remove volumes

## Project Structure

```
.
├── backend/              # NestJS backend application
│   ├── src/              # Source code
│   ├── test/             # Tests
│   ├── Dockerfile        # Backend Dockerfile
│   └── package.json      # Backend dependencies
├── frontend/             # Next.js frontend application
│   ├── app/              # App router pages
│   ├── public/           # Static assets
│   ├── Dockerfile        # Frontend Dockerfile
│   └── package.json      # Frontend dependencies
├── .github/
│   └── workflows/
│       └── ci.yml        # CI/CD pipeline
├── docker-compose.yml    # Docker Compose configuration
├── Makefile              # Development commands
└── README.md             # This file
```

## API Endpoints

The backend API is available at http://localhost:3001

- `GET /` - Health check endpoint

## Environment Variables

### Backend
- `PORT` - Backend port (default: 3001)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001)

## Testing

Run tests for the backend:
```bash
make test-backend
```

Run tests for the frontend:
```bash
make test-frontend
```

## Linting

Lint both projects:
```bash
make lint
```

## CI/CD

The project uses GitHub Actions for continuous integration. On every push or pull request to `main` or `develop` branches:

1. Backend tests and linting are run
2. Frontend tests and linting are run
3. Docker images are built to verify build process

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

[Add your license here]
