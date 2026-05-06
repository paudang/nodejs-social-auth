# nodejs-social-auth

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![License](https://img.shields.io/badge/License-ISC-blue.svg)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)


A production-ready Node.js microservice generated with **Clean Architecture** and **PostgreSQL**. 
This project follows a strict **7-Step Production-Ready Process** to ensure quality and scalability from day one.

---

## 7-Step Production-Ready Process

1.  **Initialize Git**: `git init` (Required for Husky hooks and security gates).
2.  **Install Dependencies**: `npm install`.
3.  **Configure Environment**: Copy `.env.example` to `.env`.
4.  **Start Infrastructure**: `docker-compose up -d db redis`.
5.  **Run Development**: `npm run dev`.
6.  **Verify Standards**: `npm run lint` and `npm test` (Enforce 80% coverage).
7.  **Build & Deploy**: `npm run build` followed by `npm run deploy` (via PM2).

---

## Key Features

-   **Architecture**: Clean Architecture (Domain, UseCases, Infrastructure).
-   **Database**: PostgreSQL (via Sequelize).
-   **Authentication**: JWT-based Auth (Sign Up, Login, Protected Routes).
-   **Security**: Helmet, CORS, Rate Limiting, HPP, Snyk SCA.
-   **Quality**: 80%+ Test Coverage, Eslint, Prettier, Husky.
-   **DevOps**: Multi-stage Docker, CI/CD ready (GitHub/GitLab/Jenkins/Bitbucket/CircleCI).


## 📂 Project Structure

The project follows **Clean Architecture** principles.
- **Domain**: Pure business logic (Entities/Interfaces).
- **Use Case**: Application-specific business rules.
- **Infrastructure**: External concerns (DB, Messaging, Caching).

---

## 🛠️ Detailed Getting Started

Follow the **🚀 7-Step Production-Ready Process** summary at the top, or follow these detailed instructions:

### 1. Prerequisites
-   Node.js (v18+)
-   Docker & Docker Compose

### 2. Environment Setup
Copy the example environment file and adjust the values as needed:
```bash
cp .env.example .env
```

### 3. Infrastructure & App Launch
```bash
# Initialize Git for security hooks
git init

# Install dependencies
npm install

# Start required services
docker-compose up -d db redis

# Run the app in development mode
npm run dev
```

### 4. Quality & Standards
```bash
# Lint & Format
npm run lint
npm run format

# Run Unit/Integration Tests
npm test
npm run test:coverage
```

API is exposed via **REST**.
A Swagger UI for API documentation is available at:
- **URL**: `http://localhost:3000/api-docs` (Dynamic based on PORT)

### User Endpoints:
- `GET /api/users`: List all users.
- `GET /api/users/:id`: Get a user by ID.
- `POST /api/users`: Create a new user.
- `PATCH /api/users/:id`: Partially update a user.
- `DELETE /api/users/:id`: Delete a user (Soft Delete).

### Auth Endpoints:
- `POST /api/auth/login`: Exchange credentials for a short-lived `accessToken` and a long-lived `refreshToken`.
- `POST /api/auth/refresh`: Submit a `refreshToken` to receive a new pair of tokens. (Includes theft-detection logic).
- `POST /api/auth/logout`: Revoke (blacklist) the active `accessToken` and delete the `refreshToken`.
- `POST /api/users`: Acts as Sign Up when password is provided.
### Social Authentication Flows

This project supports two distinct social authentication flows:

#### 1. The Redirection Flow (Best for MVC/Web)
Standard OAuth2 flow using browser redirects.
- **Start**: `GET /api/auth/google` (or `/github`)
- **Callback**: Handled automatically by the backend via `/google/callback`.
- **Result**: User is logged in and redirected to home; `accessToken` and `refreshToken` are securely saved as **HttpOnly cookies** in the browser.
- **Callback URL**: `http://localhost:3000/api/auth/google/callback` (Standardized for both MVC and Clean Architecture).

  > [!TIP]
  > **Testing in Swagger**: The "Execute" button in Swagger UI will show a "Failed to fetch" error for this route because browsers block redirects to external domains (like Google) inside AJAX requests. To test this, simply open `http://localhost:3000/api/auth/google` directly in your browser tab.

#### 2. The Exchange Flow (Best for SPAs/Mobile Apps)
A headless flow where the client provides the OAuth code.
- **API**: `POST /api/auth/social/exchange`
- **Body**: `{ "code": "AUTH_CODE", "provider": "Google" }`
- **Result**: Returns JWT tokens (`accessToken`, `refreshToken`) in the JSON response.

---
  *Note: To access protected user endpoints (GET/PATCH/DELETE), include `Authorization: Bearer <your_accessToken>` in the headers.*
### Social Authentication Setup
To use social login, you must configure the following in your `.env`:

#### Callback URL Configuration
For the best practice standardized API structure, you **must** configure the Redirect URIs in your developer portals (Google/GitHub) as follows:

| Provider | Redirect URI (Callback URL) |
| :--- | :--- |
| **Google** | `http://localhost:3000/api/auth/google/callback` |
| **GitHub** | `http://localhost:3000/api/auth/github/callback` |

> [!IMPORTANT]
> This standardized path works for both **MVC** and **Clean Architecture** templates.

#### 1. Google Integration
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create/Select a project and go to **APIs & Services > Credentials**.
3. Create an **OAuth client ID** for a **Web application**.
4. Add Redirect URI: `http://localhost:3000/api/auth/google/callback`.
5. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` in `.env`.

#### 2. GitHub Integration
1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Register a **New OAuth App**.
3. Set Callback URL: `http://localhost:3000/api/auth/github/callback`.
4. Set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CALLBACK_URL` in `.env`.

## Caching
This project uses **Redis** for caching.
- **Client**: `ioredis`
- **Connection**: Configured via `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` in `.env`.

## Logging
This project uses **Winston** for structured logging.
- **Development**: Logs are printed to the console.
- **Production**: Logs are saved to files:
  - `error.log`: Only error level logs.
  - `combined.log`: All logs.

## Docker Deployment
This project uses a **Multi-Stage Dockerfile** for optimized production images.

### 1. Running Locally (Development)
To run the Node.js application locally while using Docker for the infrastructure (Database, Redis, Kafka, etc.):

```bash
# Start infrastructure
docker-compose up -d db redis

# Start the application
npm run dev
```

### 2. Running the App Container with Compose Infrastructure
If you want to run the application itself inside a Docker container while connecting to the infrastructure managed by your `docker-compose.yml`:

```bash
# First, ensure your infrastructure is running
docker-compose up -d

# Build Production Image
docker build -t nodejs-social-auth .

# Run Container (attached to the compose network)
docker run -p 3000:3000 --network nodejs-social-auth_default \
  -e DB_HOST=db \
  -e REDIS_HOST=redis \
  nodejs-social-auth
```
## PM2 Deployment (VPS/EC2)
This project is pre-configured for direct deployment to a VPS/EC2 instance using **PM2** (via `ecosystem.config.js`).
1. Install dependencies
```bash
npm install
```
2. **Start Infrastructure (DB, Redis, Kafka, etc.) in the background**
*(This specifically starts the background services without running the application inside Docker, allowing PM2 to handle it).*
```bash
docker-compose up -d db redis
```
3. **Wait 5-10s** for the database to fully initialize.
4. **Deploy the App using PM2 in Cluster Mode**
```bash
npm run build
npm run deploy
```
5. **Check logs**
```bash
npx pm2 logs
```
6. Stop and remove the PM2 application
```bash
npx pm2 delete nodejs-social-auth
```
7. Stop and remove the Docker infrastructure
```bash
docker-compose down
```

## 🔒 Security Features
-   **Helmet**: Sets secure HTTP headers.
-   **CORS**: Configured for cross-origin requests.
-   **Rate Limiting**: Protects against DDoS / Brute-force.
-   **HPP**: Prevents HTTP Parameter Pollution attacks.

## AI-Native Development

This project is "AI-Ready" out of the box. We have pre-configured industry-leading AI context files to bridge the gap between "Generated Code" and "AI-Assisted Development."

- **Magic Defaults**: We've automatically tailored your AI context to focus on **nodejs-social-auth** and its specific architectural stack (Clean Architecture, PostgreSQL, etc.).
- **Use Cursor?** We've configured **`.cursorrules`** at the root. It enforces project standards (80% coverage, MVC/Clean) directly within the editor. 
- *Pro-tip*: You can customize the `Project Goal` placeholder in `.cursorrules` to help the AI understand your specific business logic!
- **Use ChatGPT/Gemini/Claude?** Check the **`prompts/`** directory. It contains highly-specialized Agent Skill templates. You can copy-paste these into any LLM to give it a "Senior Developer" understanding of your codebase immediately.