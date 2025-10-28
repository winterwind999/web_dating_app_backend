# Matchy — Backend for the Dating Web Application

## Tech Stack

- **NestJS** — Scalable backend framework
- **MongoDB + Mongoose** — NoSQL database with schema validation
- **Passport.js** — JWT and OAuth2 with Google
- **CSRF** — Additional Auth Security
- **Multer** — File upload middleware
- **Cloudflare R2** — Media file storage (images/videos)
- **Custom Exception Filters & Logger** — Unified error and log handling

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
- ✅ Setup admin schema
- ✅ Setup otp schema
- ✅ Setup CSRF
- ✅ Integrate Passport.js with JWT
- ✅ Integrate Passport.js with Google
- ✅ Setup Role-based access control
- ⏳ Setup controllers and services for likes, dislikes, matches, reports, and blocks
- ⏳ Setup admin controllers and services
- ✅ Setup Multer for uploads
- ⏳ Setup Cloudflare R2 for image and video storage
- ⏳ Setup WebSockets
- ⏳ Add real-time notifications and chats
- ⏳ Add admin dashboard API
- ⏳ Add automated tests (Jest + Playwright)
- ⏳ Setup GitHub Actions Workflow
- ⏳ Setup Docker
- ⏳ Deploy to Fly.io
- ⏳ Fumadocs for documentation

## 📄 License

© 2025 Jordan G. Faciol. All rights reserved.

This source code is made publicly available for viewing purposes only.  
You may not copy, modify, distribute, or use this code in any form  
without explicit written permission from the author.
