# Matchy — Backend for the Dating Web Application

## Tech Stack

- **NestJS** — Scalable backend framework
- **MongoDB + Mongoose** — NoSQL database with schema validation
- **Passport.js** — JWT and OAuth 2.0 with Google
- **Cloudinary** — Media file storage (images/videos)

## Project Setup

### Install Dependencies

```bash
  npm install
```

### Compile and Hot-Reload for Development

```bash
  npm run start:dev
```

### Compile and Minify for Production

```bash
  npm run build
  npm run start:prod
```

## Docker Setup

### Prerequisites

- Docker installed on your machine
- Docker Compose installed
- `.env` file configured with required environment variables

### Development Environment

#### Build and Run with Docker Compose

```bash
docker-compose build

docker-compose up

docker-compose up --build

docker-compose up -d

docker-compose logs -f

docker-compose down
```

#### Build Development Image Manually

```bash
docker build -t web_dating_app_backend:dev -f Dockerfile .

docker run -p 3500:3500 --env-file .env web_dating_app_backend:dev
```

### Production Environment

#### Build and Run with Docker Compose

```bash
docker-compose -f docker-compose.prod.yml build

docker-compose -f docker-compose.prod.yml up

docker-compose -f docker-compose.prod.yml up --build

docker-compose -f docker-compose.prod.yml up -d

docker-compose -f docker-compose.prod.yml logs -f

docker-compose -f docker-compose.prod.yml down
```

#### Build Production Image Manually

```bash
docker build -t web_dating_app_backend:prod -f Dockerfile.prod .

docker run -p 3500:3500 --env-file .env web_dating_app_backend:prod
```

### Docker Network Setup

Before running the containers, ensure the external network exists:

```bash
docker network create web_network

docker network ls
```

## Legend

| Symbol | Meaning                       |
| :----- | :---------------------------- |
| ✅     | **Complete**                  |
| ⚠️     | **Partially Done**            |
| ⏳     | **In Progress / Not Started** |

## Current Progress

- ✅ Setup CORS
- ✅ Setup env config
- ✅ Setup MongoDB
- ✅ Setup all exception filters
- ✅ Setup rate limiting
- ✅ Setup custom logger
- ✅ Setup auth basic controllers and services (login, refresh, logout, forgot password)
- ✅ Setup user schema
- ✅ Setup likes, dislikes, matches, reports, and block schemas
- ✅ Setup user controllers and services
- ✅ Setup otp schema
- ✅ Setup CSRF
- ✅ Integrated Passport.js with JWT
- ✅ Added Google OAuth 2.0 on Passport.js
- ✅ Setup controllers and services for likes, dislikes, matches, reports, blocks, and feeds
- ✅ Setup Multer for uploads
- ✅ Setup Cloudinary
- ✅ Setup controllers and services for uploading photo and albums
- ✅ Setup WebSockets
- ✅ Setup notifications and chats schema
- ✅ Added real-time notifications and chats
- ✅ Dockerize backend
- ✅ Setup GitHub Actions
- ✅ Setup Docker Hub
- ✅ Deploy to Render

## License

© 2025 Jordan G. Faciol. All rights reserved.

This source code is made publicly available for viewing purposes only.  
You may not copy, modify, distribute, or use this code in any form  
without explicit written permission from the author.
