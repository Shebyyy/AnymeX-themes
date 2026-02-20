# AnymeX Admin Panel Guide

## Overview

The AnymeX admin panel provides comprehensive management capabilities for the themes platform. Admins can manage users, moderate themes, and control platform access.

## Features

### 1. User Management
- **Create Users**: Add new admin or user accounts with username, password, name, email, and role
- **Edit Users**: Update user information, change roles, activate/deactivate accounts
- **Delete Users**: Remove user accounts (except your own)
- **Reset Passwords**: Reset passwords for users who have forgotten theirs

### 2. Theme Management
- **View All Themes**: Browse all themes with search and status filters
- **Approve Themes**: Approve pending themes to make them visible to users
- **Reject Themes**: Reject inappropriate or invalid themes
- **Mark as Broken**: Flag themes that have issues
- **Delete Themes**: Permanently remove themes from the platform

### 3. Authentication
- **Login**: Secure login with username and password
- **Change Password**: Update your own password
- **Session Management**: Automatic session expiration (7 days)

### 4. Roles & Permissions

#### SUPER_ADMIN
- Full access to all features
- Can create and delete other admins
- Can modify SUPER_ADMIN accounts
- Cannot delete their own account

#### ADMIN
- Can create and manage regular users
- Can manage themes (approve, reject, delete, mark broken)
- Can reset passwords for other users
- Cannot create or delete other admins
- Cannot modify SUPER_ADMIN accounts

#### USER
- Basic access (if needed for future features)
- Limited permissions

## Getting Started

### Initial Setup

1. Navigate to `/setup` in your browser
2. Create your super admin account:
   - Username (required)
   - Password (minimum 6 characters)
   - Full Name (optional)
   - Email (optional)
3. Click "Create Super Admin"
4. You'll be automatically logged in and redirected to the dashboard

### Accessing the Admin Panel

1. Go to `/admin/login`
2. Enter your username and password
3. Click "Sign In"

Or access it from the main page by clicking the "Login" button in the navigation.

## API Routes

### Authentication

- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change your own password
- `POST /api/auth/reset-password` - Reset password (for others by admin)

### Admin - Users

- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create a new user
- `GET /api/admin/users/[id]` - Get a specific user
- `PUT /api/admin/users/[id]` - Update a user
- `DELETE /api/admin/users/[id]` - Delete a user

### Admin - Themes

- `GET /api/admin/themes` - List all themes (with filters)
- `PUT /api/admin/themes/[id]/status` - Update theme status
- `DELETE /api/admin/themes/[id]` - Delete a theme

### Setup

- `POST /api/setup` - Create initial super admin (one-time use)

## Security Features

- Password hashing using SHA-256
- Session tokens with expiration
- Role-based access control
- Protection against modifying/deleting super admins by regular admins
- Protection against self-deletion

## Database Schema

### User Model
- `id`: Unique identifier
- `username`: Unique username (required)
- `email`: Optional email address
- `name`: Optional full name
- `passwordHash`: Hashed password
- `role`: USER, ADMIN, or SUPER_ADMIN
- `isActive`: Account status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `lastLoginAt`: Last login timestamp

### Theme Model (Updated)
- Includes `status` field: PENDING, APPROVED, REJECTED, BROKEN
- Includes `createdBy` reference to User

### SessionToken Model
- Stores active user sessions
- Expires after 7 days

## Common Tasks

### Creating a New Admin

1. Go to Admin Dashboard → Users
2. Click "Create User"
3. Fill in the form:
   - Username: required
   - Password: minimum 6 characters
   - Role: Select "ADMIN"
   - Name and Email: optional
4. Click "Create User"

### Resetting a User's Password

1. Go to Admin Dashboard → Users
2. Find the user in the list
3. Click the lock icon
4. Enter the new password (minimum 6 characters)
5. Click "Reset Password"

### Approving a Theme

1. Go to Admin Dashboard → Themes
2. Filter by "Pending" status if needed
3. Find the theme
4. Click the green checkmark icon
5. Theme status changes to "APPROVED"

### Marking a Theme as Broken

1. Go to Admin Dashboard → Themes
2. Find the theme
3. Click the orange warning icon
4. Theme status changes to "BROKEN"

## Troubleshooting

### Can't access /setup after first use
The setup route only works when no users exist in the database. If you need to reset, delete all users from the database.

### Forgot admin password
If you're locked out, you'll need to:
1. Access the database directly
2. Delete the admin user
3. Visit /setup to create a new one

### Session expired
Simply log in again at `/admin/login`. Sessions expire after 7 days of inactivity.

## Support

For issues or questions about the admin panel, please refer to the main project documentation or contact the development team.
