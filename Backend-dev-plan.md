# 1) Executive Summary
- This document outlines the development plan for a FastAPI backend to support the AI Teaching Assistant frontend. The goal is to provide a scalable and secure backend that fulfills the requirements detailed in the PRD and observed in the frontend application.
- Constraints honored: The backend will be built with **FastAPI (Python 3.12)** and connect to a **MongoDB Atlas** database using **Motor**. The plan follows a **no-Docker**, frontend-driven manual testing approach with a **`main`-only Git workflow**.
- The sprint count is dynamic, starting with environment setup and authentication, and expanding to cover all frontend features for project and content management.

# 2) In-scope & Success Criteria
- **In-scope:**
  - User authentication (signup, login, logout).
  - Full CRUD (Create, Read, Update, Delete), list, and search/filter functionality for Projects.
  - Endpoints to support the generation of Lesson Plans, Worksheets, and Parent Updates.
  - A health check endpoint for monitoring database connectivity.
- **Success criteria:**
  - All frontend features are fully supported by the backend APIs.
  - Each sprint's deliverables pass a manual testing checklist performed through the frontend UI.
  - The backend code is successfully pushed to the `main` branch on GitHub after each sprint's validation.

# 3) API Design
- **Conventions:**
  - Base path: `/api/v1`
  - Filtering and sorting are included for project listing as seen in the frontend dashboard.
  - Error model: A consistent JSON object will be used for errors, e.g., `{ "detail": "Error message" }`.

- **Endpoints:**

  - **Health Check**
    - `GET /healthz`
      - **Purpose:** Checks application status and database connectivity.
      - **Request:** None.
      - **Response:** `{ "status": "ok", "db_connected": true }`

  - **Authentication**
    - `POST /api/v1/auth/signup`
      - **Purpose:** Register a new user.
      - **Request:** `{ "name": "string", "email": "string", "password": "string" }`
      - **Response:** `{ "access_token": "string", "token_type": "bearer" }`
      - **Validation:** Email must be valid and unique. Password must meet minimum complexity rules.
    - `POST /api/v1/auth/login`
      - **Purpose:** Log in a user.
      - **Request:** `{ "username": "string (email)", "password": "string" }` (using form data for OAuth2PasswordRequestForm)
      - **Response:** `{ "access_token": "string", "token_type": "bearer" }`
      - **Validation:** Credentials must match a registered user.
    - `GET /api/v1/auth/me`
      - **Purpose:** Get the current authenticated user's details.
      - **Request:** None (requires authentication).
      - **Response:** `{ "id": "string", "name": "string", "email": "string", ... }`

  - **Projects**
    - `POST /api/v1/projects`
      - **Purpose:** Create a new project.
      - **Request:** `{ "name": "string", "description": "string", "subject": "string", "level": "string" }`
      - **Response:** The created Project object.
    - `GET /api/v1/projects`
      - **Purpose:** List all projects for the authenticated user, with filtering.
      - **Request Query Params:** `searchTerm` (string), `status` ('all', 'active', 'archived').
      - **Response:** `[Project, ...]`
    - `PUT /api/v1/projects/{project_id}`
      - **Purpose:** Update an existing project.
      - **Request:** `{ "name": "string", "description": "string", "subject": "string", "level": "string" }`
      - **Response:** The updated Project object.
    - `DELETE /api/v1/projects/{project_id}`
      - **Purpose:** Delete a project.
      - **Request:** None.
      - **Response:** `204 No Content`
    - `PUT /api/v1/projects/{project_id}/archive`
      - **Purpose:** Archive a project.
      - **Request:** None.
      - **Response:** The updated Project object with status 'archived'.
    - `PUT /api/v1/projects/{project_id}/unarchive`
      - **Purpose:** Restore an archived project.
      - **Request:** None.
      - **Response:** The updated Project object with status 'active'.

  - **Content Generation (Placeholder Endpoints)**
    - `POST /api/v1/projects/{project_id}/generate/lesson-plan`
      - **Purpose:** Generate a lesson plan for a project.
      - **Request:** `{ "subject": "string", "level": "string", "topic": "string" }`
      - **Response:** The generated LessonPlan object.
    - `POST /api/v1/projects/{project_id}/generate/worksheet`
      - **Purpose:** Generate a worksheet for a project.
      - **Request:** `{ "subject": "string", "level": "string", "topic": "string" }`
      - **Response:** The generated Worksheet object.
    - `POST /api/v1/projects/{project_id}/generate/parent-update`
      - **Purpose:** Generate parent updates from student data.
      - **Request:** `{ "student_data": [StudentData, ...] }`
      - **Response:** `[ParentUpdate, ...]`

# 4) Data Model (MongoDB Atlas)
- **Collections:**

  - **`users`**
    - `_id`: ObjectId (Primary Key)
    - `name`: String, required
    - `email`: String, required, unique
    - `hashed_password`: String, required
    - `created_date`: DateTime, default: now
    - `last_modified_date`: DateTime, default: now
    - `preferences`: Object, optional
    - **Example Document:**
      ```json
      {
        "_id": "ObjectId('...')",
        "name": "Mei Lin",
        "email": "meilin.teacher@example.com",
        "hashed_password": "argon2_hash_string",
        "created_date": "2025-09-11T20:00:00Z",
        "last_modified_date": "2025-09-11T20:00:00Z"
      }
      ```

  - **`projects`**
    - `_id`: ObjectId (Primary Key)
    - `user_id`: ObjectId, required (reference to `users` collection)
    - `name`: String, required
    - `description`: String, optional
    - `subject`: String, optional
    - `level`: String, optional
    - `status`: String, required, enum: ['active', 'archived'], default: 'active'
    - `created_date`: DateTime, default: now
    - `last_modified_date`: DateTime, default: now
    - **Example Document:**
      ```json
      {
        "_id": "ObjectId('...')",
        "user_id": "ObjectId('...')",
        "name": "PSLE Math – Fractions",
        "description": "Covering addition and subtraction of fractions.",
        "subject": "Mathematics",
        "level": "Primary 5",
        "status": "active",
        "created_date": "2025-09-11T20:05:00Z",
        "last_modified_date": "2025-09-11T20:05:00Z"
      }
      ```  - **`generated_content`** (A single collection for simplicity, using a `type` field)
    - `_id`: ObjectId (Primary Key)
    - `project_id`: ObjectId, required (reference to `projects` collection)
    - `user_id`: ObjectId, required (reference to `users` collection)
    - `type`: String, required, enum: ['lesson_plan', 'worksheet', 'parent_update']
    - `title`: String, required
    - `content`: Object, required (flexible schema based on `type`)
    - `created_date`: DateTime, default: now
    - `last_modified_date`: DateTime, default: now
    - **Example Document (Lesson Plan):**
      ```json
      {
        "_id": "ObjectId('...')",
        "project_id": "ObjectId('...')",
        "user_id": "ObjectId('...')",
        "type": "lesson_plan",
        "title": "Adding Fractions with Unlike Denominators",
        "content": {
          "subject": "Mathematics",
          "level": "Primary 5",
          "topic": "Fractions",
          "objectives": ["..."],
          "practice_questions": ["..."]
        },
        "created_date": "2025-09-11T20:10:00Z",
        "last_modified_date": "2025-09-11T20:10:00Z"
      }
      ```

# 5) Frontend Audit & Feature Map
- **`Auth.tsx`**
  - **Purpose:** Handles user registration and login.
  - **Backend Capability:** `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`. Models: `User`.
  - **Auth Requirement:** None.
- **`Dashboard.tsx`**
  - **Purpose:** Main view after login. Lists, filters, and manages projects.
  - **Backend Capability:** `GET /api/v1/projects`, `POST /api/v1/projects`, `PUT /api/v1/projects/{id}`, `DELETE /api/v1/projects/{id}`, `PUT /api/v1/projects/{id}/archive`. Models: `Project`.
  - **Auth Requirement:** Required.
- **`ProjectWorkspace.tsx`**
  - **Purpose:** Workspace for a single project. Manages and displays generated content (Lesson Plans, Worksheets, Parent Updates).
  - **Backend Capability:** `POST /api/v1/projects/{id}/generate/*` endpoints. Models: `LessonPlan`, `Worksheet`, `ParentUpdate`.
  - **Auth Requirement:** Required.

# 6) Configuration & ENV Vars (core only)
- `APP_ENV`: Environment name (e.g., `development`, `production`).
- `PORT`: HTTP port for the server to listen on (e.g., `8000`).
- `MONGODB_URI`: The full connection string for MongoDB Atlas.
- `JWT_SECRET`: A strong, secret key for signing JWTs.
- `JWT_EXPIRES_IN`: Access token lifetime in seconds (e.g., `3600` for 1 hour).
- `CORS_ORIGINS`: Comma-separated list of allowed frontend origins (e.g., `http://localhost:5173`).

# 9) Testing Strategy (Manual via Frontend)
- **Policy:** All backend features will be validated by interacting with the connected frontend application. The developer will use the UI to create, update, and delete data, observing the application's behavior and using browser DevTools (Network tab) to inspect API requests and responses.
- **Per-sprint Manual Test Checklist (Frontend):** Each sprint will define the exact UI steps and expected outcomes to verify its objectives.
- **User Test Prompt:** Each sprint will include a short, copy-pasteable set of instructions for a non-technical user to test the implemented features.
- **Post-sprint:** If all manual tests pass, the code will be committed and pushed to the `main` branch on GitHub. If tests fail, fixes will be implemented and re-tested before pushing.

# 10) Dynamic Sprint Plan & Backlog (S0…Sn)

- **S0 - Environment Setup & Frontend Connection (always)**
  - **Objectives:**
    - Create a skeleton FastAPI application with a `/api/v1` router and a `/healthz` endpoint.
    - Ask the user for the `MONGODB_URI` and configure it using environment variables.
    - Implement the `/healthz` endpoint to perform a quick connectivity check against the MongoDB database.
    - Configure CORS middleware to allow requests from the frontend's origin.
    - Initialize a Git repository, create a `.gitignore` file, and perform the initial commit and push to a new GitHub repository on the `main` branch.
  - **Definition of Done:**
    - The FastAPI server runs locally without errors.
    - The `/healthz` endpoint returns a `200 OK` status and indicates successful database connection.
    - The frontend can successfully make requests to the backend.
    - The project is on GitHub with `main` as the default branch.
  - **Manual Test Checklist (Frontend):**
    - 1. Set the `MONGODB_URI` in the backend environment.
    - 2. Start the backend server.
    - 3. Start the frontend development server.
    - 4. Open the browser's DevTools and navigate to the frontend application.
    - 5. Verify in the Network tab that there are no CORS errors and that any initial API calls (if any) succeed.
    - 6. Manually navigate to the backend's `/healthz` endpoint in a new browser tab and confirm a successful JSON response.
  - **User Test Prompt:**
    - "Please start the backend and frontend servers. Open the application in your browser and confirm that the page loads without any connection errors."
  - **Post-sprint:**
    - Commit all setup files and push to `main`.

- **S1 - Basic Auth (signup, login, logout)**
  - **Objectives:**
    - Implement user registration, login, and profile fetching endpoints.
    - Secure the projects endpoints, allowing access only to authenticated users.
    - Store user passwords securely using hashing (e.g., Argon2).
    - Issue JWTs on successful login for authenticating subsequent requests.
  - **Endpoints:**
    - `POST /api/v1/auth/signup`
    - `POST /api/v1/auth/login`
    - `GET /api/v1/auth/me`
  - **Tasks:**
    - Create the `User` Pydantic model and MongoDB collection schema.
    - Implement password hashing and verification logic.
    - Set up JWT creation and decoding, including dependency injection for route protection.
    - Wire the frontend `Auth.tsx` page to use the new endpoints instead of local storage.
  - **Definition of Done:**
    - A new user can register through the frontend UI.
    - A registered user can log in and is redirected to the dashboard.
    - An unauthenticated user attempting to access the dashboard is redirected to the login page.
    - The user's session is managed via JWTs.
  - **Manual Test Checklist (Frontend):**
    - 1. Navigate to the app and try to access the dashboard directly (should fail/redirect).
    - 2. Use the signup form to create a new account.
    - 3. On successful registration, verify you are logged in and on the dashboard.
    - 4. Log out.
    - 5. Use the login form with the newly created credentials.
    - 6. Verify you are logged in and on the dashboard.
    - 7. Try to log in with incorrect credentials and verify an error message is shown.
  - **User Test Prompt:**
    - "Please test the user registration and login flow. Can you create a new account, log out, and then log back in successfully? Also, confirm that you cannot access the main dashboard if you are not logged in."
  - **Post-sprint:**
    - Commit the changes and push to `main`.

- **S2 - Project Management (CRUD)**
  - **Objectives:**
    - Implement all CRUD (Create, Read, Update, Delete) operations for projects.
    - Implement project listing with search and status filtering.
    - Implement project archiving and restoring.
    - Ensure all project endpoints are protected and operate only on the data owned by the authenticated user.
  - **Endpoints:**
    - `POST /api/v1/projects`
    - `GET /api/v1/projects`
    - `PUT /api/v1/projects/{project_id}`
    - `DELETE /api/v1/projects/{project_id}`
    - `PUT /api/v1/projects/{project_id}/archive`
    - `PUT /api/v1/projects/{project_id}/unarchive`
  - **Tasks:**
    - Create the `Project` Pydantic model and MongoDB collection schema.
    - Implement the API endpoints, ensuring `user_id` is correctly associated and checked.
    - Replace the frontend's `storageService` calls in `Dashboard.tsx` with actual API calls.
  - **Definition of Done:**
    - A logged-in user can create, view, edit, and delete their own projects via the frontend dashboard.
    - The search and status filter on the dashboard correctly filters the list of projects.
    - A user can archive and restore a project.
  - **Manual Test Checklist (Frontend):**
    - 1. Log in to the application.
    - 2. Create a new project using the "New Project" button and form. Verify it appears on the dashboard.
    - 3. Create a second project.
    - 4. Use the search bar to find one of the projects by name. Clear the search.
    - 5. Edit the details of a project. Verify the changes are saved and displayed.
    - 6. Archive a project. Verify it disappears from the 'Active' list and appears in the 'Archived' list (by changing the filter).
    - 7. Restore the archived project.
    - 8. Delete a project. Verify the confirmation dialog appears and the project is removed upon confirmation.
  - **User Test Prompt:**
    - "Please log in and test the project management features. Can you create a new project, edit its details, archive it, and then delete it? Please also check if the search and filter functions are working as expected."
  - **Post-sprint:**
    - Commit the changes and push to `main`.