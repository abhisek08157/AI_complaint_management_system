# 🎓 AI Campus Complaint & Maintenance Management System

An **AI-powered web-based campus complaint and maintenance management system** designed to centralize the process of submitting, analyzing, assigning, tracking, and resolving campus complaints.

The system replaces informal complaint methods such as verbal complaints, phone calls, WhatsApp messages, and scattered records with a structured digital workflow.

> **Project Type:** Minor Project / Academic MVP
> **Backend:** Java + Spring Boot
> **Database:** MySQL
> **AI:** Local keyword-based AI service
> **API:** REST API
> **Frontend:** HTML, CSS, JavaScript / React

---

## 📌 Project Overview

The **AI Campus Complaint & Maintenance Management System** provides a centralized platform where students can submit campus-related complaints and track their progress.

When a complaint is submitted, the system analyzes the complaint using an internal AI service to determine its:

* **Category**
* **Priority**
* **Summary**

The administrator can then review the complaint and assign it to an appropriate maintenance staff member. Staff members can update the complaint status, add a resolution, and mark the complaint as resolved.

The student can finally view the updated status and resolution.

---

## 🎯 Project Goal

The primary goal of the MVP is to demonstrate the complete complaint-management lifecycle:

```text
Student Login
      ↓
Submit Complaint
      ↓
AI Analysis
      ↓
Category + Priority + Summary
      ↓
Admin Reviews Complaint
      ↓
Admin Assigns Staff
      ↓
Staff Handles Complaint
      ↓
IN_PROGRESS
      ↓
Add Resolution
      ↓
RESOLVED
      ↓
Student Tracks Result
```

The project focuses on building a **working academic demonstration rather than a production-ready system**.

---

# 👥 User Roles

The system supports three primary roles.

### 👨‍🎓 Student

Students can:

* Register an account
* Login
* Submit complaints
* View their complaints
* Track complaint status
* View complaint history
* View resolutions
* Provide feedback

### 👨‍🔧 Maintenance Staff

Maintenance staff can:

* Login
* View assigned complaints
* View complaint details
* View AI-generated category and priority
* Update complaint status
* Add resolution details
* Mark complaints as resolved

### 👨‍💼 Administrator

Administrators can:

* Login
* View all complaints
* View maintenance staff
* Assign complaints to staff
* Change complaint priority when required
* Monitor unresolved complaints
* View dashboard statistics

---

# 🤖 AI Module

The MVP uses a **simple local AI implementation** through `AiService.java`.

Instead of depending on external services such as Gemini or OpenAI, the initial version analyzes complaint text using predefined keywords. This keeps the demonstration simple and avoids external API dependencies.

### AI Responsibilities

The AI service determines:

| AI Output | Description                |
| --------- | -------------------------- |
| Category  | Type of complaint          |
| Priority  | Urgency of complaint       |
| Summary   | Short summary of complaint |

### Complaint Categories

The MVP supports:

* `ELECTRICAL`
* `PLUMBING`
* `NETWORKING`
* `FURNITURE`
* `CLEANING`
* `OTHER`

### Priority Levels

The system supports:

* `LOW`
* `MEDIUM`
* `HIGH`
* `CRITICAL`

### Example

**Complaint:**

> Fan is not working in Block A Room 204.

**AI Analysis:**

```text
Category : ELECTRICAL
Priority : HIGH
Summary  : Ceiling fan is not working in Block A Room 204.
```

The AI module is intentionally kept modular so that it can later be replaced with an external service such as Gemini or OpenAI without changing the main complaint-management architecture.

---

# 🔄 Complaint Lifecycle

The MVP follows this status flow:

```text
SUBMITTED
    ↓
ASSIGNED
    ↓
IN_PROGRESS
    ↓
RESOLVED
```

### Complete Workflow

```text
Student
   │
   │ Submit Complaint
   ▼
Spring Boot REST API
   │
   ▼
Complaint Service
   │
   ├──────────────► AI Service
   │                    │
   │                    ├── Category
   │                    ├── Priority
   │                    └── Summary
   │
   ▼
MySQL
   │
   ▼
Admin Dashboard
   │
   │ Assign Staff
   ▼
Maintenance Staff
   │
   │ IN_PROGRESS
   ▼
Add Resolution
   │
   │ RESOLVED
   ▼
Student Dashboard
   │
   ▼
View Resolution / Feedback
```

---

# 📝 Complaint Data

Each complaint contains information such as:

* Complaint ID
* Title
* Description
* Location
* Category
* Priority
* AI-generated summary
* Status
* Resolution
* Student/User
* Assigned staff
* Created date
* Updated date
* Resolved date

The backend sends the **title and description** to the AI service, and the resulting category, priority, and summary are stored with the complaint.

### Example Complaint Request

```http
POST /api/complaints?userId=3
```

```json
{
  "title": "Fan is not working",
  "description": "The ceiling fan in room 204 is broken and making noise",
  "location": "Block A - Room 204"
}
```

---

# 🏗️ System Architecture

The backend follows a layered architecture:

```text
Frontend
   │
   ▼
REST API
   │
   ▼
Controller
   │
   ▼
Service
   │
   ├──────► AI Service
   │
   ▼
Repository
   │
   ▼
MySQL
```

### Architecture Components

**Controller**

Handles HTTP requests and API endpoints.

**Service**

Contains the application's business logic and communicates with the AI service.

**Repository**

Handles database persistence using Spring Data JPA.

**Entity**

Represents database tables.

**DTO**

Represents API request and response objects.

---

# 📂 Project Structure

```text
ai-campus-complaint/
│
├── pom.xml
│
└── src/
    └── main/
        │
        ├── java/
        │   └── com/
        │       └── abhisek/
        │           └── management/
        │               │
        │               ├── AiCampusComplaintSystemApplication.java
        │               │
        │               ├── controller/
        │               │   ├── AuthController.java
        │               │   ├── ComplaintController.java
        │               │   ├── AdminController.java
        │               │   └── StaffController.java
        │               │
        │               ├── service/
        │               │   ├── AuthService.java
        │               │   ├── ComplaintService.java
        │               │   └── AiService.java
        │               │
        │               ├── repository/
        │               │   ├── UserRepository.java
        │               │   └── ComplaintRepository.java
        │               │
        │               ├── entity/
        │               │   ├── User.java
        │               │   └── Complaint.java
        │               │
        │               ├── dto/
        │               │   ├── RegisterRequest.java
        │               │   ├── LoginRequest.java
        │               │   ├── LoginResponse.java
        │               │   ├── ComplaintRequest.java
        │               │   ├── ComplaintResponse.java
        │               │   ├── AssignRequest.java
        │               │   └── StatusUpdateRequest.java
        │               │
        │               ├── config/
        │               │   └── DataInitializer.java
        │               │
        │               └── exception/
        │                   └── GlobalExceptionHandler.java
        │
        └── resources/
            └── application.properties
```

The project uses the package base:

```text
com.abhisek.management
```

as specified in the development document.

---

# 🛠️ Technology Stack

| Technology                  | Usage                         |
| --------------------------- | ----------------------------- |
| **Java 17**                 | Backend programming           |
| **Spring Boot 4.1.1**       | Backend framework             |
| **Spring Web MVC**          | REST API development          |
| **Spring Data JPA**         | Database operations           |
| **Hibernate**               | ORM                           |
| **MySQL**                   | Database                      |
| **Maven**                   | Build & dependency management |
| **HTML / CSS / JavaScript** | Frontend                      |
| **React**                   | Optional frontend framework   |
| **Postman**                 | API testing                   |
| **JUnit**                   | Unit testing                  |
| **Git**                     | Version control               |
| **GitHub**                  | Source code management        |

---

# 🗄️ Database

The MVP uses **MySQL**.

### Users Table

```text
users
├── id
├── name
├── email
├── password
├── role
└── created_at
```

### Complaints Table

```text
complaints
├── id
├── title
├── description
├── location
├── category
├── priority
├── summary
├── status
├── resolution
├── user_id
├── assigned_staff_id
├── created_at
├── updated_at
└── resolved_at
```

### Relationship

```text
User
  │
  │ 1
  │
  │ creates
  │
  ▼
Complaints
  │
  │ optionally assigned to
  ▼
Maintenance Staff
```

One user can create multiple complaints, while a complaint can optionally be assigned to one maintenance staff member.

---

# 🔌 REST API

## Authentication APIs

| Method | Endpoint             | Description   |
| ------ | -------------------- | ------------- |
| POST   | `/api/auth/register` | Register user |
| POST   | `/api/auth/login`    | Login user    |

## Complaint APIs

| Method | Endpoint                          | Description             |
| ------ | --------------------------------- | ----------------------- |
| POST   | `/api/complaints?userId={id}`     | Create complaint        |
| GET    | `/api/complaints`                 | Get all complaints      |
| GET    | `/api/complaints/{id}`            | Get complaint by ID     |
| GET    | `/api/complaints/user/{userId}`   | Get user's complaints   |
| GET    | `/api/complaints/staff/{staffId}` | Get staff complaints    |
| PUT    | `/api/complaints/{id}/status`     | Update complaint status |

## Admin APIs

| Method | Endpoint                            | Description          |
| ------ | ----------------------------------- | -------------------- |
| GET    | `/api/admin/complaints`             | Get all complaints   |
| GET    | `/api/admin/staff`                  | Get staff list       |
| PUT    | `/api/admin/complaints/{id}/assign` | Assign complaint     |
| GET    | `/api/admin/dashboard`              | Dashboard statistics |

## Staff APIs

| Method | Endpoint                            | Description                |
| ------ | ----------------------------------- | -------------------------- |
| GET    | `/api/staff/{staffId}/complaints`   | Get assigned complaints    |
| PUT    | `/api/staff/complaints/{id}/status` | Update / resolve complaint |

---

# 🖥️ Frontend

The recommended frontend is:

```text
HTML
CSS
JavaScript
```

React can also be used if the development team is comfortable with it.

### Student Dashboard

The student dashboard should display:

* Total complaints
* Submitted complaints
* In-progress complaints
* Resolved complaints
* Recent complaints
* Complaint status
* Complaint priority
* Submit Complaint button

### Admin Dashboard

The admin dashboard should display:

* Total complaints
* Submitted complaints
* Assigned complaints
* In-progress complaints
* Resolved complaints
* Complaint table
* Complaint priority
* Complaint status
* Staff assignment

### Staff Dashboard

The staff dashboard should display:

* Assigned complaints
* Complaint details
* AI category
* AI priority
* Status controls
* Resolution controls

---

# 🔐 Authentication

Authentication in the MVP is intentionally simplified.

The current project does **not** use:

* JWT
* Spring Security

The focus is on demonstrating the complete complaint-management workflow rather than implementing production-level authentication.

---

# ⚙️ Getting Started

## Prerequisites

Install the following:

* Java 17
* Maven
* MySQL
* Git
* Postman
* IDE such as IntelliJ IDEA, Eclipse, or Spring Tool Suite

---

## 1. Clone the Repository

```bash
git clone <repository-url>
```

Navigate to the project:

```bash
cd ai-campus-complaint
```

---

## 2. Create MySQL Database

Create the database:

```sql
CREATE DATABASE ai_campus_complaint;
```

---

## 3. Configure Database

Update:

```text
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ai_campus_complaint
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8080
```

Replace `YOUR_PASSWORD` with your MySQL password.

---

## 4. Build the Project

```bash
mvn clean install
```

---

## 5. Run the Application

```bash
mvn spring-boot:run
```

The backend will run on:

```text
http://localhost:8080
```

---

# 🧪 Testing

The REST APIs can be tested using **Postman**.

Recommended testing sequence:

```text
1. Register Student
       ↓
2. Register / Create Staff
       ↓
3. Login
       ↓
4. Submit Complaint
       ↓
5. Verify AI Analysis
       ↓
6. Admin Views Complaint
       ↓
7. Admin Assigns Staff
       ↓
8. Staff Views Assignment
       ↓
9. Staff Changes Status
       ↓
10. Staff Adds Resolution
       ↓
11. Complaint → RESOLVED
       ↓
12. Student Views Result
```

The development document specifically includes Postman testing and integration as part of the development process.

---

# 🎬 Demo Scenario

The recommended project demonstration is:

### "Fan not working in Block A, Room 204"

**Step 1 — Student**

Student submits:

```text
Title:
Fan is not working

Description:
The ceiling fan in room 204 is broken and making noise.

Location:
Block A - Room 204
```

**Step 2 — AI**

The AI analyzes the complaint:

```text
Category : ELECTRICAL
Priority : HIGH
Summary  : Fan problem in Block A Room 204.
```

**Step 3 — Admin**

Admin views the complaint and assigns it to maintenance staff.

```text
SUBMITTED → ASSIGNED
```

**Step 4 — Staff**

Staff starts working on the complaint:

```text
ASSIGNED → IN_PROGRESS
```

**Step 5 — Resolution**

Staff fixes the fan and adds the resolution.

```text
IN_PROGRESS → RESOLVED
```

**Step 6 — Student**

Student can view the resolved complaint and its resolution.

This scenario is the project's recommended end-to-end demonstration.

---

# 👨‍💻 Team Responsibilities

| Member       | Responsibility                                                       |
| ------------ | -------------------------------------------------------------------- |
| **Member 1** | Authentication – User, AuthController, AuthService, UserRepository   |
| **Member 2** | Complaint Backend – Complaint, Repository, Service, Controller, DTOs |
| **Member 3** | Admin & Staff – Assignment, Status Updates, Dashboard APIs           |
| **Member 4** | Frontend – Login, Dashboards, Forms, REST API integration            |
| **AI**       | AiService – Classification, Priority Detection, Summary              |

---

# 🌿 GitHub Branching Strategy

Team members should **not work directly on the `main` branch**.

Each member should create a feature branch:

```text
main
 │
 ├── feature/auth
 ├── feature/complaints
 ├── feature/admin
 ├── feature/staff
 ├── feature/frontend
 └── feature/ai
```

### Recommended Workflow

```bash
git checkout -b feature/your-feature
```

Make changes and commit:

```bash
git add .
git commit -m "Add complaint creation API"
```

Push the branch:

```bash
git push origin feature/your-feature
```

Then create a **Pull Request** for review before merging into `main`.

Focused commits and Pull Requests should be used to keep team development organized.

---

# 📋 MVP Features

| Feature              | Status |
| -------------------- | ------ |
| User Registration    | ✅      |
| User Login           | ✅      |
| Student Role         | ✅      |
| Staff Role           | ✅      |
| Admin Role           | ✅      |
| Complaint Creation   | ✅      |
| Complaint Tracking   | ✅      |
| AI Category          | ✅      |
| AI Priority          | ✅      |
| AI Summary           | ✅      |
| Admin Management     | ✅      |
| Staff Assignment     | ✅      |
| Status Management    | ✅      |
| Complaint Resolution | ✅      |
| Dashboards           | ✅      |
| MySQL Database       | ✅      |
| REST APIs            | ✅      |
| Frontend             | ✅      |

---

# 🚧 Features Planned for Future

The following features are intentionally **not included in the initial MVP**:

* JWT authentication
* Spring Security
* Image upload
* Duplicate complaint detection
* External AI API integration
* Natural-language analytics
* Advanced staff workload analytics
* Complex department management

Future AI integration can include services such as Gemini or OpenAI while keeping the existing `AiService` interface modular.

---

# 🗺️ Development Roadmap

```text
Phase 1
Backend Foundation
MySQL + JPA + User + Complaint
        ↓
Phase 2
Registration + Login + Roles
        ↓
Phase 3
Complaint Creation + View + Tracking
        ↓
Phase 4
AI Category + Priority + Summary
        ↓
Phase 5
Admin Dashboard + Staff Assignment
        ↓
Phase 6
Staff Dashboard + Status + Resolution
        ↓
Phase 7
Frontend Dashboards + Forms
        ↓
Phase 8
Frontend + REST API Integration
        ↓
Phase 9
Postman Testing + Final Integration
```

---

# ✅ Definition of Done

The MVP is considered complete when the following flow works successfully:

```text
Student Login
      ↓
Submit Complaint
      ↓
AI Categorizes Complaint
      ↓
AI Determines Priority
      ↓
AI Generates Summary
      ↓
Complaint Stored in MySQL
      ↓
Admin Login
      ↓
View Complaint
      ↓
Assign Staff
      ↓
Staff Login
      ↓
View Assigned Complaint
      ↓
IN_PROGRESS
      ↓
Add Resolution
      ↓
RESOLVED
      ↓
Student Views Resolved Complaint
```

---

# 🔮 Future Scope

The system can be extended beyond the MVP with:

* Gemini/OpenAI integration
* JWT authentication
* Spring Security
* Complaint image uploads
* Duplicate complaint detection
* AI-powered analytics
* Automated department assignment
* Email notifications
* Real-time notifications
* Advanced staff workload analytics
* Mobile application
* Advanced administrative reporting

---

# 📄 Project Status

**Current Stage:** Minor Project — MVP Development

The project is intentionally scoped as an academic demonstration focused on completing the core complaint-management workflow before adding advanced functionality.

---

# 👨‍💻 Contributors

Add your team members here:

```text
1. Name — Authentication
2. Name — Complaint Backend
3. Name — Admin & Staff
4. Name — Frontend
```

---

# 📜 License

This project is developed for **academic and educational purposes** as part of a minor project.

---

## ⭐ Project Summary

**AI Campus Complaint & Maintenance Management System** provides a structured platform for managing campus complaints from submission to resolution.

Its core workflow combines:

**Student → AI Analysis → Admin Assignment → Staff Resolution → Student Tracking**

The MVP demonstrates how AI-assisted classification, prioritization, and summarization can improve the organization of campus maintenance complaints while keeping the initial architecture simple and modular.
