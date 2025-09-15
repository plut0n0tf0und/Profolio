# Profolio: AI-Powered UX Portfolio Builder

## Abstract

Profolio is a web application designed to help UX professionals, designers, and researchers streamline the creation of portfolio case studies. The app guides users through a requirements-gathering process for their projects, intelligently recommends relevant UX techniques, and then uses Generative AI to transform their raw notes and checklists into polished, professional portfolio content.

The core workflow is as follows:
1.  **Project Definition:** A user defines a new project by answering a multi-step questionnaire about its goals, problem statement, target devices, and desired outcomes.
2.  **Technique Recommendation:** Based on the project definition, the app recommends a curated list of UX techniques (e.g., User Interviews, A/B Testing) organized by the 5D design process (Discover, Define, Design, Develop, Deliver).
3.  **AI-Powered Remixing:** The user can select any recommended technique and "remix" it. They provide their specific notes, checklists, and attachments related to how they applied that technique.
4.  **Portfolio Generation:** Using AI (powered by Genkit and Google's Gemini models), the application transforms the user's input into a well-structured, professionally written portfolio piece for that single technique.
5.  **Full Portfolio View:** The app can aggregate all of a user's remixed techniques across all their projects into a single, comprehensive portfolio page, which can be exported as a PDF.

Profolio handles user authentication, data persistence, and all AI interactions, providing a seamless experience from project ideation to a shareable portfolio.

---

## Tech Stack

- **Framework:** **Next.js 15** (with App Router)
- **Language:** **TypeScript**
- **UI Components:** **React**, **ShadCN UI**, **Tailwind CSS**
- **Generative AI:** **Genkit** (using Google's Gemini 2.5 Flash and other models)
- **Backend & Auth:** **Supabase** (PostgreSQL Database, Authentication, User Management)
- **Styling:** **Tailwind CSS** with `clsx` and `tailwind-merge`
- **Form Management:** **React Hook Form** with **Zod** for schema validation
- **PDF Generation:** `jspdf` and `html-to-image-fix`
- **Icons:** **Lucide React**

---

## Key Debugging Insights: The `.map()` of `undefined` Error

A persistent and critical bug encountered during development was the `Uncaught TypeError: Cannot read properties of undefined (reading 'map')`. This section documents the root cause and the definitive solution for future reference.

### Root Cause Analysis

The error stemmed from a data mismatch between the PostgreSQL database and the React frontend, which cascaded through multiple layers of the application.

1.  **Database Schema:** The `requirements` and `saved_results` tables defined several array-based columns as `text[] NULL` (e.g., `output_type`, `constraints`). When a user did not select any options for these fields, the database correctly stored the value as `NULL`.

2.  **Data Access Layer (`src/lib/supabaseClient.ts`):** The Supabase client library translates a PostgreSQL `NULL` value into a JavaScript `null`. The initial versions of our data-fetching functions (`fetchRequirementById`, etc.) passed this `null` value directly to the application without sanitization.

3.  **Business Logic Layer (`src/lib/uxTechniques.ts`):** The `getFilteredTechniques` function received the raw `requirement` object. It then attempted to call array methods like `.includes()` on properties that were `null` (e.g., `requirement.constraints.includes(...)`), causing the application to crash within its promise-based execution.

4.  **UI Layer (`src/app/requirements/result/[id]/page.tsx`):** Simultaneously, the UI components would also receive the `null` values and attempt to render them by calling `.map()`, leading to the same crash on the client side.

### The Definitive Solution

The final, successful fix involved a multi-layered defense strategy, with the most critical change happening in the business logic layer.

The core of the solution was to **sanitize the data at the earliest point of use.** In `src/lib/uxTechniques.ts`, the `getFilteredTechniques` function was modified to never trust its input. At the very beginning of the function, a "safeguard" was added to default any potentially `null` array fields to an empty array (`[]`).

**Winning Code Snippet (from `uxTechniques.ts`):**
```typescript
export function getFilteredTechniques(requirement: Requirement): Record<string, { name: string; slug: string }[]> {
    // --- SAFEGUARD ---
    // This is the definitive fix. We ensure that any nullable array from the
    // requirement object is defaulted to an empty array before any logic runs.
    const safeRequirement = {
        ...requirement,
        constraints: requirement.constraints ?? [],
        output_type: requirement.output_type ?? [],
        primary_goal: requirement.primary_goal ?? [],
        outcome: requirement.outcome ?? [],
        device_type: requirement.device_type ?? [],
    };
    // --- END SAFEGUARD ---

    // ... rest of the filtering logic now uses `safeRequirement`
}
```
This ensures that the complex recommendation engine always operates on predictable, valid arrays, completely eliminating the bug at its most critical point.

---

## File Structure & Core Functionality

This section breaks down the main directories and files to explain the project's architecture.

### `src/app/`
This is the heart of the Next.js application, using the App Router for file-based routing.

- **`layout.tsx`**: The root layout for the entire application. It includes the HTML shell, font loading, and the global `Toaster` component for notifications.
- **`globals.css`**: Defines the global styles and the application's theme (color variables) for both light and dark modes using Tailwind CSS.
- **`page.tsx`**: The landing page, which serves as the **Login Page**.
- **`signup/page.tsx`**: The user registration page.
- **`auth/`**: Handles authentication callbacks from OAuth providers (e.g., Google, GitHub).
- **`dashboard/`**: The main application area, accessible only to authenticated users.
  - **`page.tsx`**: The dashboard homepage, which lists all of the user's saved projects.
  - **`[id]/page.tsx`**: The project detail page. It displays the project's information and the recommended UX techniques.
  - **`[id]/edit/page.tsx`**: A page to edit the basic details of a saved project.
  - **`technique/[technique]/page.tsx`**: A crucial page that displays details about a specific UX technique and allows the user to "remix" it by filling out a detailed form. This is where the user provides their raw data for AI processing.
  - **`portfolio/[id]/page.tsx`**: The preview page for a single, AI-generated portfolio piece based on a remixed technique.
  - **`full-portfolio/page.tsx`**: Aggregates all of the user's remixed techniques into a single, comprehensive portfolio view. It includes the "Export to PDF" functionality.
- **`requirements/`**: Contains the multi-step form for defining a new project.
  - **`page.tsx`**: The main page for the requirements questionnaire.
  - **`result/[id]/page.tsx`**: Displays the recommended techniques after the user completes the questionnaire.
- **`settings/page.tsx`**: The user settings page, allowing profile updates and account deletion.

### `src/components/`
Contains reusable React components used throughout the application.

- **`auth-form.tsx`**: A unified component for handling both login and sign-up forms, including social logins.
- **`ProjectCard.tsx`**: The card component used on the dashboard to display a summary of each project.
- **`Sidebar.tsx`**: The user menu sidebar, providing navigation to settings and the logout functionality.
- **`ui/`**: Contains all the base UI components from the ShadCN library (e.g., `Button.tsx`, `Card.tsx`, `Input.tsx`).

### `src/ai/`
This directory holds all the Generative AI logic, powered by Genkit.

- **`genkit.ts`**: Initializes and configures the global Genkit instance, specifying the models to be used (e.g., Gemini 2.5 Flash).
- **`flows/`**: Contains all the AI flows, which are server-side functions that interact with the LLMs.
  - **`get-technique-details.ts`**: An AI flow that generates a detailed description, prerequisites, and best practices for a given UX technique.
  - **`generate-portfolio.ts`**: Takes the user's raw notes from a remixed technique and transforms them into a single, polished portfolio piece.
  - **`generate-full-portfolio.ts`**: Takes all of a user's remixed techniques and generates a complete, multi-project portfolio.

### `src/lib/`
Contains helper functions, utilities, and client-side libraries.

- **`supabaseClient.ts`**: The central file for all Supabase interactions. It initializes the Supabase client and exports functions for all database operations (CRUD for projects, techniques, user profiles, etc.).
- **`supabase-server.ts`**: Initializes the Supabase client specifically for use in Server Components and Route Handlers.
- **`uxTechniques.ts`**: Contains the business logic for filtering and recommending UX techniques based on the user's input from the requirements form.
- **`utils.ts`**: A utility file containing helper functions, most notably `cn` for merging Tailwind CSS classes.

### `src/services/`
Contains simple, pure-logic helper functions.
- **`password-generator.ts`**: A utility function to generate random, strong passwords for the "Suggest Password" feature.
