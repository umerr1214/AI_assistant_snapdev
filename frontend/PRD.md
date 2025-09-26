---
title: Product Requirements Document (Refined)
app: clever-beluga-spin
created: 2025-09-12T17:48:20.591Z
version: 2
source: Roo PRD Refinement
---

# PRODUCT REQUIREMENTS DOCUMENT (REFINED)

## 1. EXECUTIVE SUMMARY

**Product Vision:** The AI Teaching Assistant is a productivity platform for tuition teachers and center owners in Singapore. It automates lesson planning, worksheet creation, and parent communication, freeing educators from repetitive tasks to focus on teaching.

**Core Purpose (MVP):** To validate that the application can save teachers 5–10 hours per week by streamlining the core workflow of lesson preparation and parent communication, ensuring all generated content is aligned with MOE syllabus standards.

**Target Users:**
-   **Primary:** Independent tutors with heavy teaching loads (30+ students).
-   **Secondary:** Tuition center owners managing multiple staff and classes.

**Core MVP Flow:**
1.  **Create Project:** Teacher creates a project for a class (e.g., "P5 Math - Fractions").
2.  **Generate Content:** Teacher generates a lesson plan, worksheet, and parent updates within the project.
3.  **Review & Export:** Teacher reviews, edits, and exports the generated materials for use.

**Complexity Assessment:** **Moderate**
-   **State Management:** Local (project-level organization).
-   **External Integrations:** 2 (AI Service, User Authentication).
-   **Business Logic:** Moderate (prompt engineering for syllabus alignment).
-   **Data Synchronization:** Basic (CSV import for student data).

**MVP Success Metrics:**
-   Users can successfully complete the core workflow from project creation to content export.
-   The system reliably generates MOE-aligned content for core subjects.
-   The platform remains stable and responsive under an initial load of 50-100 concurrent users.
-   Key user feedback confirms the product saves significant time.

## 2. MVP SCOPE & FEATURES

### 2.1 Core MVP Features

**FR-001: Project Workspace Management**
-   **Description:** Users create Projects to organize all lesson plans, worksheets, and parent updates for a class.
-   **MVP Lifecycle:** Create, View, Edit, Delete, List/Search.
-   **User Benefit:** Keeps all teaching resources organized and accessible.

**FR-002: Lesson Plan & Worksheet Generator**
-   **Description:** Users generate structured lesson plans and worksheets by providing a subject, level, and topic.
-   **MVP Lifecycle:** Create, View, Edit, Delete, List/Search, Export (PDF/Word).
-   **User Benefit:** Reduces prep time by over 50% while maintaining syllabus alignment.

**FR-003: Parent Update Generator**
-   **Description:** The system generates personalized parent updates from student data uploaded via a detailed CSV file.
-   **MVP Lifecycle:** Create (from CSV), View, Edit, Delete, List/Search, Export (for copy/paste).
-   **User Benefit:** Automates weekly parent updates with a professional, personalized tone.

**FR-004: Dashboard & Content Management**
-   **Description:** A central dashboard to view and manage all Projects and their generated content.
-   **MVP Lifecycle:** View, List/Search across all content.
-   **User Benefit:** Provides a single, intuitive view for all lesson prep and parent communication tasks.

**FR-901: User Authentication**
-   **Description:** Secure user registration and login.
-   **MVP Lifecycle:** Create (Register), View (Profile), Edit (Password), Delete (Account), Session Management.
-   **User Benefit:** Protects student data and teacher-generated content.

### 2.2 Deferred Features (Post-MVP)

-   **Archive Projects:** Not essential for core validation. Can be added in V2 for dashboard cleanup.
-   **Export Project Contents:** Adds complexity. Focus is on generating content, not bulk export in V1.
-   **Duplicate Content:** "Nice-to-have" enhancement for efficiency.
-   **Version History:** Adds significant complexity. Can be explored in V2.
-   **Bulk Generation:** Power-user feature not needed for initial validation.
-   **Template Customization:** Secondary enhancement. MVP will use a standardized, effective template.
-   **Content Statistics:** Reporting feature, not core to the primary workflow.

## 3. USER WORKFLOWS

### 3.1 Complete Core Flow (MVP)

**Trigger:** A teacher needs to prepare for an upcoming lesson and provide weekly parent updates.
**Outcome:** The teacher has a ready-to-use lesson plan, worksheet, and personalized parent updates.

**Steps:**
1.  Teacher logs into the dashboard.
2.  Creates a new Project: "P5 Math – Fractions."
3.  Inside the project, selects "Generate Lesson Plan," providing subject, level, and topic.
4.  The AI generates a structured lesson plan and an accompanying worksheet.
5.  Teacher reviews and edits the generated materials.
6.  Teacher exports the final lesson plan and worksheet as a PDF.
7.  Teacher uploads a CSV with student data (Name, Subject, Score, Strengths, Weaknesses, Comments).
8.  The AI generates personalized parent update drafts for each student.
9.  Teacher reviews and edits the updates for tone and accuracy.
10. Teacher exports the updates for easy copying into WhatsApp or email.

## 4. DATA REQUIREMENTS (MVP)

**User**
-   **Type:** System/Configuration
-   **Attributes:** `id`, `email`, `password_hash`, `name`, `created_date`
-   **Relationships:** Has many `Projects`.

**Project**
-   **Type:** User-Generated Content
-   **Attributes:** `id`, `user_id`, `name`, `description`, `subject`, `created_date`
-   **Relationships:** Belongs to a `User`, has many `GeneratedContents`.

**GeneratedContent**
-   **Type:** System-Generated Content
-   **Attributes:** `id`, `project_id`, `content_type` (LessonPlan, Worksheet, ParentUpdate), `raw_text`, `edited_text`, `created_date`
-   **Relationships:** Belongs to a `Project`.

## 5. BUSINESS RULES (MVP)

-   **Access Control:** Users can only access their own Projects and content. No sharing features in MVP.
-   **Data Rules:**
    -   Project names must be unique per user.
    -   Lesson generation requires `subject`, `level`, and `topic`.
    -   Parent update generation requires a CSV with `Student Name`, `Subject`, `Score`, `Strengths`, `Weaknesses`, and `Comments`.
-   **Process Rules:**
    -   All generated content must be associated with a Project.
    -   Export formats are limited to PDF, Word, and plain text for copy/paste.