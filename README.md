Content Management System 📝🔒📧
A modern, secure, and scalable Content Management System (CMS) built with Node.js and Express.
This project provides a foundation for managing users, content, and authentication in web applications.

🚀 Features

👤 User Registration & Login: Secure sign-up and sign-in flows.

📧 Email Verification: Ensures only verified users can access protected features.

🔒 JWT Authentication: Middleware for route protection and session management.

🛡️ Custom Error Handling: Consistent API error responses.

⚡ Async Request Handling: Efficient, non-blocking server logic.

🗂️ MVC Structure: Clean separation of controllers, models, routes, and utilities.

🛠️ Tech Stack

Technology	Purpose

Node.js	Backend runtime environment

Express.js	Web framework

MongoDB	Database

Mongoose	MongoDB ODM

Nodemailer	Sending emails

JWT	Authentication

Mailgen	Email template generation

📂 Project Structure

controllers – Business logic for authentication and health checks

models – Mongoose models for users and other entities

routes – API route definitions

middlewares – JWT verification and error handling

utils – Utility functions (API responses, mail, constants)
public – Static assets

💡 How It Works

Users register and receive a verification email.

Email contains a secure token; clicking the link verifies the user.

Authenticated users receive JWT tokens for secure API access.

Middleware protects routes and handles errors gracefully.
