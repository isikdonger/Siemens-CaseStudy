# Siemens Root Cause Analysis (RCA) Tool

A web application for managing problems and performing root cause analysis using a hierarchical tree structure. Built with React (frontend) and PHP (backend), following Siemens iX design system guidelines.

## Project Overview

This application implements a 5-Why analysis tool that allows users to:
- Create and manage problems
- Build hierarchical cause trees using recursive parent-child relationships
- Visualize cause-and-effect relationships
- Mark root causes and close problems

## Technical Architecture

### Frontend
- **Framework**: React 18 with Vite
- **UI Library**: Siemens iX React Components (@siemens/ix-react)
- **Data Grid**: AG Grid Community
- **Build Tool**: Vite

### Backend
- **Language**: PHP (Native)
- **Database**: MySQL/MariaDB
- **API Style**: RESTful JSON API

### Database Structure

The application uses a **recursive tree structure** implemented with `parent_id` foreign key relationships:

#### Problems Table
```sql
CREATE TABLE problems (
    problem_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    team VARCHAR(100),
    state TINYINT DEFAULT 1,  -- 1: Active, 2: Closed
    date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Causes Table
```sql
CREATE TABLE causes (
    cause_id INT PRIMARY KEY AUTO_INCREMENT,
    problem_id INT NOT NULL,
    parent_id INT NULL,  -- NULL for root level, cause_id for children
    description TEXT NOT NULL,
    is_root_cause TINYINT DEFAULT 0,
    action_description TEXT,
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id),
    FOREIGN KEY (parent_id) REFERENCES causes(cause_id)
);
```

**Key Design Decision**: The `parent_id` field allows for unlimited depth in the cause hierarchy:
- `parent_id = NULL`: Cause is at the root level (directly under the problem)
- `parent_id = cause_id`: Cause is a child of another cause
- This creates a recursive tree structure stored efficiently in a relational database

## Prerequisites

- **PHP**: 7.4 or higher
- **MySQL/MariaDB**: 5.7 or higher
- **Node.js**: 16.x or higher
- **npm** or **yarn**
- **Web Server**: Apache (WAMP/XAMPP) or Nginx with PHP-FPM

## Installation & Setup

### 1. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE case_study_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Create the tables (run the SQL commands from the database structure section above)

3. Update database credentials in `backend/config.php`:
```php
$host = 'localhost';
$db   = 'case_study_db';
$user = 'your_username';
$pass = 'your_password';
```

### 2. Backend Setup

1. Place the project in your web server directory:
   - **WAMP**: `C:\wamp64\www\Siemens CaseStudy\`
   - **XAMPP**: `C:\xampp\htdocs\Siemens CaseStudy\`
   - **Linux/Apache**: `/var/www/html/Siemens CaseStudy/`

2. Ensure PHP has PDO MySQL extension enabled:
```bash
php -m | grep pdo_mysql
```

3. Verify backend API is accessible:
   - Open: `http://localhost/Siemens-CaseStudy/backend/get_problems.php`
   - Should return: `[]` (empty array) or JSON data

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure API base URL (optional):
   - Create `.env` file in `frontend/` directory:
   ```
   VITE_API_BASE_URL=http://localhost/Siemens-CaseStudy/backend
   ```
   - Or modify `API_BASE_URL` in `frontend/src/App.jsx`

4. Start the development server:
```bash
npm run dev
```

5. The application will be available at: `http://localhost:5173`

### 4. Production Build

To build for production:

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`. Configure your web server to serve these static files.

## Project Structure

```
Siemens CaseStudy/
├── backend/
│   ├── config.php              # Database configuration and CORS setup
│   ├── get_problems.php        # GET: List all problems
│   ├── get_problems_detail.php # GET: Get problem details
│   ├── create_problem.php      # POST: Create new problem
│   ├── get_cause_tree.php      # GET: Get cause tree for a problem
│   ├── add_cause.php           # POST: Add new cause to hierarchy
│   └── mark_root_cause.php     # POST: Mark root cause and close problem
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main application component
│   │   └── main.jsx            # Application entry point
│   ├── package.json
│   └── vite.config.js
├── queries/
│   └── Query.sql               # Database schema (if provided)
└── README.md
```

## API Endpoints

### Problems

- **GET** `/backend/get_problems.php`
  - Returns: Array of all problems
  
- **GET** `/backend/get_problems_detail.php?id={problem_id}`
  - Returns: Single problem details

- **POST** `/backend/create_problem.php`
  - Body: `{ "title": "string", "team": "string", "state": 1 }`
  - Returns: `{ "status": "success", "problem_id": int }`

### Causes

- **GET** `/backend/get_cause_tree.php?problem_id={id}`
  - Returns: Tree model object with hierarchical structure

- **POST** `/backend/add_cause.php`
  - Body: `{ "problem_id": int, "parent_id": int|null, "description": "string" }`
  - Returns: `{ "status": "success", "cause_id": int }`

- **POST** `/backend/mark_root_cause.php`
  - Body: `{ "problem_id": int, "cause_id": int, "action": "string" }`
  - Returns: `{ "status": "success" }`

## Key Features

### Tree Structure Implementation

The application implements a recursive tree structure using `parent_id` relationships:

1. **Root Level**: Causes with `parent_id = NULL` are displayed directly under the problem
2. **Child Nodes**: Causes with `parent_id = cause_id` are nested under their parent
3. **Unlimited Depth**: The structure supports unlimited nesting levels
4. **Efficient Storage**: Uses relational database with foreign key constraints

### Siemens iX Design System

The UI follows Siemens iX design guidelines:
- Uses `theme-brand-dark` theme
- Implements iX components (IxButton, IxTree, IxModal, etc.)
- Follows iX color tokens (CSS variables)
- Responsive layout with proper spacing

## Development Guidelines

### PHP Backend
- All endpoints return JSON
- Proper error handling with HTTP status codes
- Prepared statements for SQL injection prevention
- CORS headers configured in `config.php`
- Consistent error response format

### React Frontend
- Functional components with hooks
- Proper state management
- Error handling for API calls
- Loading states for async operations
- Clean component structure

## Troubleshooting

### CORS Issues
- Ensure `config.php` has correct CORS headers
- Check that frontend URL matches in CORS configuration

### Database Connection
- Verify database credentials in `backend/config.php`
- Check MySQL service is running
- Ensure database exists and tables are created

### API Not Responding
- Check PHP error logs
- Verify file permissions
- Test endpoints directly in browser/Postman

### Frontend Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies in `package.json`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## License

This project is developed as a case study for Siemens.

## Contact & Support

For issues or questions, please refer to the project documentation or contact the development team.
