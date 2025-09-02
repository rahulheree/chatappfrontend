OpenChatRoom - Full-Stack Real-Time Chat Application
OpenChatRoom is a comprehensive, full-stack chat application engineered for performance, scalability, and observability. It features a real-time WebSocket backend powered by Python and FastAPI, a responsive React frontend, and a complete DevOps pipeline for containerization, monitoring, and testing.

The entire application stack, including the frontend, backend, databases, and monitoring tools, is containerized with Docker, allowing for a seamless, one-command setup for local development.

Features
Real-Time Communication: Instant messaging powered by WebSockets.

Dynamic Chat Rooms: Users can create public/private rooms, join existing ones, and leave rooms.

Secure Sessions: Session-based user authentication.

File Uploads: S3-compatible object storage for sharing files and images (MinIO for local, Cloudflare R2 for production).

Invite System: Generate unique invite links for private rooms.

Full-Stack Containerization: The entire application runs on Docker for consistent environments.

Live Monitoring & Observability: Integrated Grafana and Prometheus for real-time performance dashboards.

Load Testing: Comes with a Locust test suite to simulate user traffic and identify bottlenecks.

Security Scanning: Includes tools for dependency, code, and container vulnerability scanning.

Tech Stack & Tools
Category

Technology / Tool

Backend

Python, FastAPI, WebSockets, SQLAlchemy, Pydantic

Frontend

React, Tailwind CSS, Axios, Framer Motion

Databases

PostgreSQL (Primary), Redis (Caching & Real-time)

Storage

MinIO (Local), Cloudflare R2 (Production)

DevOps

Docker, Docker Compose, Nginx (Reverse Proxy), Poetry

Monitoring

Prometheus (Metrics Collection), Grafana (Visualization)

Testing

Locust (Load Testing), Bandit (Code Security), pip-audit (Dependency Security), Docker Scan (Image Security)

System Architecture
The application runs as a cohesive system of interconnected services, managed by Docker Compose. The Nginx server acts as the entry point, routing traffic to the React frontend or the FastAPI backend as needed.

🚀 Getting Started (Local Development)
This project is fully containerized. With Docker installed, you can get the entire stack running with a single command.

Prerequisites
Docker and Docker Compose installed on your machine.

A running Docker daemon.

A GitHub account to clone the repository.

Installation & Setup
Clone the repository:

git clone <your-repository-url>
cd <project-folder>

Prepare the Environment File:
Navigate into the chat-app-backend directory and copy the example environment file.

cd chat-app-backend
cp .env.example .env

The default values in .env are already configured to work with Docker Compose.

Run the Application:
From the chat-app-backend directory, run the following command:

docker-compose up --build

This command will build the frontend and backend images, pull all the necessary database and monitoring images, and start every service. It may take a few minutes on the first run.

Usage
Once the containers are running, you can access the different parts of the system:

Frontend Chat App: http://localhost:5173

Grafana Monitoring: http://localhost:3000 (Login: admin / admin)

Prometheus UI: http://localhost:9090

MinIO File Storage: http://localhost:9001 (Login: minioadmin / minioadmin)

Backend API Docs: http://localhost:8000/scalar

To run the application in the background (detached mode), use:

docker-compose up -d

To stop all services, run:

docker-compose down

Testing
The project is equipped with a suite of testing tools to ensure quality and security.

Load Testing with Locust
Ensure the application stack is running.

From the chat-app-backend directory, run:

poetry run locust

Open http://localhost:8089 in your browser, set the host to http://localhost:8000, and start the test.

Security Scanning
Run these commands from the chat-app-backend directory:

Dependency Scan (pip-audit):

poetry add pip-audit --group dev
poetry run python -m pip_audit

Static Code Scan (Bandit):

poetry add bandit --group dev
poetry run bandit -r app

Docker Image Scan:

docker scan chat-app-backend-backend

Deployment
This project is configured for deployment on a modern cloud infrastructure:

Backend (FastAPI, PostgreSQL, Redis): Deployable on Render using the included render.yaml blueprint.

File Storage: Configured to use Cloudflare R2 in production.

Frontend (React): Deployable on Cloudflare Pages for global distribution and speed.

Remember to set your production environment variables (especially for R2 credentials) in the Render dashboard.
