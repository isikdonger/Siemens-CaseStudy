# Siemens Root Cause Analysis (RCA) Tool

A professional web application for managing problems and performing root cause analysis using a hierarchical tree structure. Built with **React 18** and **Modern PHP (OOP)**, following the Siemens iX design system guidelines.

## Project Overview

This tool implements a 5-Why analysis methodology, enabling users to:
- Create and manage industrial problems.
- Build hierarchical cause trees with unlimited depth using recursive parent-child relationships.
- Navigate through a modernized RESTful API architecture.
- Identify root causes and define corrective actions for finalized investigations.

---

## Technical Architecture (Modernized)

The project has been refactored from simple scripts to a **Modern Layered Architecture** to ensure scalability, security, and maintainability.

### Backend (PHP 8.3+)
- **Pattern**: Controller-Repository Pattern (Separation of Concerns).
- **Routing**: Centralized RESTful Router in `index.php` with `.htaccess` URL rewriting for clean endpoints.
- **Autoloading**: PSR-4 style custom Autoloader (`App\Core\Autoloader`) for automatic class loading.
- **Database**: Singleton Database connection class using PDO with prepared statements for SQL injection prevention.
- **Security**: Centralized Validation Service for input validation and data sanitization.
- **API Response**: Standardized JSON response format with status, data, message, and timestamp via `Response` utility class.
- **CORS**: Configured for cross-origin requests from frontend development server.

### Frontend
- **Framework**: React 18 with Vite build tool.
- **UI Library**: Siemens iX React Components (@siemens/ix-react) following Siemens design system.
- **Data Grid**: AG Grid React with custom Siemens Quartz theme and state persistence (sorting/pagination).
- **Tree Visualization**: @xyflow/react for interactive hierarchical tree display of cause analysis.
- **State Management**: React hooks with localStorage for view state and selected problem persistence.

---

## Directory Structure

```text
├── backend/
│   ├── public/             # API Entry point (index.php, .htaccess)
│   │   └── index.php       # Centralized router handling all API endpoints
│   ├── src/
│   │   ├── Controllers/    # Request/Response handlers
│   │   │   ├── ProblemController.php  # Problem CRUD operations
│   │   │   └── CauseController.php    # Cause tree operations
│   │   ├── Repositories/   # Data Access Layer (PDO queries)
│   │   │   ├── ProblemRepository.php
│   │   │   └── CauseRepository.php
│   │   ├── Services/       # Business logic layer
│   │   │   └── ValidationService.php  # Input validation
│   │   ├── Core/           # Core system components
│   │   │   ├── Database.php           # Singleton PDO connection
│   │   │   └── Autoloader.php         # PSR-4 autoloader
│   │   └── Utils/          # Utility classes
│   │       └── Response.php           # Standardized JSON responses
│   └── config.php          # Database configuration (credentials)
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Analysis/   # Tree view and cause analysis components
│   │   │   │   ├── TreeView.jsx
│   │   │   │   ├── ControlSidebar.jsx
│   │   │   │   └── CauseListItem.jsx
│   │   │   ├── Dashboard/ # Problem grid and dashboard
│   │   │   │   └── ProblemGrid.jsx
│   │   │   └── Common/     # Shared components
│   │   │       ├── Header.jsx
│   │   │       ├── Footer.jsx
│   │   │       └── ProblemFormModal.jsx
│   │   ├── services/       # API integration layer
│   │   │   └── api.js      # Centralized API service functions
│   │   └── App.jsx         # Root component with view routing
│   └── package.json        # Frontend dependencies
└── README.md
```

## Architecture Flow

### Request Flow (Backend)
1. **Entry Point**: HTTP request arrives at `backend/public/index.php`
2. **Routing**: Router parses the URL and maps to appropriate Controller method
3. **Controller**: Handles request, validates input (via ValidationService), calls Repository
4. **Repository**: Executes PDO queries against Database singleton
5. **Response**: Controller formats response using Response utility and returns JSON

### Component Flow (Frontend)
1. **App.jsx**: Root component manages view state (list/details) and selected problem
2. **API Service**: `services/api.js` provides centralized functions for all backend communication
3. **Components**: 
   - `ProblemGrid`: Displays problems in AG Grid, handles state updates
   - `TreeView`: Renders hierarchical cause tree using @xyflow/react
   - `ControlSidebar`: Provides controls for adding causes and marking root causes
4. **State Persistence**: localStorage maintains view state and selected problem across sessions

## Database Structure

The application uses a recursive tree structure implemented with `parent_id` relationships:

**Problems Table**: Stores the main incidents
```sql
CREATE TABLE problems (
    problem_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    team VARCHAR(100),
    state TINYINT DEFAULT 1, -- 1: Open, 2: Closed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Causes Table**: Recursive structure for 5-Why analysis
```sql
CREATE TABLE causes (
    cause_id INT PRIMARY KEY AUTO_INCREMENT,
    problem_id INT NOT NULL,
    parent_id INT NULL,
    description TEXT NOT NULL,
    is_root_cause TINYINT DEFAULT 0,
    action_description TEXT,
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES causes(cause_id) ON DELETE CASCADE
);
```

## Installation & Setup

### 1. Backend Setup (WAMP/XAMPP)

1. **Database Configuration**
   - Create a MySQL database (e.g., `case_study_db`)
   - Update `backend/config.php` with your local database credentials:
     ```php
     return [
         'host' => 'localhost',
         'db'   => 'case_study_db',
         'user' => 'root',
         'pass' => '',
         'charset' => 'utf8mb4'
     ];
     ```

2. **Database Schema**
   - Execute the SQL queries from `queries/Query.sql` to create the `problems` and `causes` tables.

3. **Apache Configuration**
   - Ensure `rewrite_module` and `headers_module` are enabled in your WAMP/XAMPP Apache settings.
   - The `.htaccess` file in `backend/public/` handles URL rewriting for clean REST endpoints.

4. **Verification**
   - Open `http://localhost/Siemens-CaseStudy/backend/public/problems` in your browser.
   - You should see a JSON response with status, data, and timestamp.

### 2. Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open `http://localhost:5173` in your browser.
   - The frontend will communicate with the backend API at `http://localhost/Siemens-CaseStudy/backend/public`.

## API Endpoints (RESTful)

All endpoints return JSON responses with the following structure:
```json
{
  "status": "success|error",
  "data": {...},
  "message": "Optional message",
  "timestamp": "YYYY-MM-DD HH:MM:SS"
}
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/problems` | Fetch all problems from the dashboard |
| `POST` | `/problems` | Update problem state (Re-open or Close). Body: `{problem_id, state}` |
| `GET` | `/tree?problem_id={id}` | Fetch recursive cause tree and model for a specific problem |
| `POST` | `/causes` | Add a new "Why" analysis step. Body: `{problem_id, parent_id, description}` |
| `POST` | `/root-cause` | Mark a node as root cause and define corrective action. Body: `{problem_id, cause_id, action_description}` |

### Response Format
- **Success (200)**: `{status: "success", data: {...}, timestamp: "..."}`
- **Error (400/404/500)**: `{status: "error", data: {error: "..."}, timestamp: "..."}`
- **Validation Error (422)**: `{status: "error", data: {validation_errors: {...}}, message: "...", timestamp: "..."}`