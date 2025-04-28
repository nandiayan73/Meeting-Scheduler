# Meeting Scheduler with Conflict Detection

![Calendar View](./assets/img5.jpg)

A full-stack meeting scheduler application with conflict detection, real-time updates, and advanced features such as best slot suggestions and user authentication.

# Tech Stack

- **Frontend**: React (with hooks), TailwindCSS for UI styling
- **Backend**: Node.js with Express
- **Database**: MongoDB


# Key Features

### 1. User Authentication
![Calendar View](./assets/img7.jpg)
- **Register/Login**: Allows users to sign up and log in to the app.
- **JWT-based Authentication**: Ensures secure login sessions using JWT tokens.

### Admin Authentication
- **Role-based Access Supports different roles (User vs Admin).**
![Calendar View](./assets/img6.jpg)


### 2. Meeting Creation
![Calendar View](./assets/img1.jpg)
- **Create Meetings**: Users can create meetings with:
  - Title
  - Description
  - Start and End Time
  - Participants (via email)
- **Conflict Detection**: The backend checks for scheduling conflicts before saving a new meeting.


### 3. Calendar View (Frontend)
![Calendar View](./assets/img3.jpg)
- **Weekly/Daily Views**: Users can view their meetings in either a weekly or daily view.
- **Conflict Highlighting**: Conflicting meetings are highlighted for easy identification.

### 4. Conflict Detection
![Calendar View](./assets/img9.jpg)
- **Prevent Double-Booking**: The backend ensures that users cannot book overlapping meetings.
- **Rescheduling Suggestions**: If a conflict is detected, the app suggests alternate available times.

### User's Profile(showing the current date's meeting):
![Calendar View](./assets/img2.jpg)

### Admin portal:
![Calendar View](./assets/img10.jpg)
- **ROLE**: Admins can delete user as well as any meeting.

# Installation

Follow these steps to set up the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/nandiayan73/Meeting-Scheduler

2. Navigate to the project directory:
    ```bash
    cd Meeting-Scheduler

3. Install all dependencies for both frontend and backend:
    ```bash
    npm run install-all

4. Set up environment variables: Create a .env file in the root directory and configure the following variables:
    ```bash
    JWT_SECRET=<Your_JWT_SECRET>
    DB_NAME=<MongoDB_DATABASE_NAME>
    DB_PASS=<MONGODB_PASSWORD>
    COOKIE_SECRET=<COOKIE_SECRET>
    MAIL=<MAILID_FOR_SENDING_MAIL>
    MAILPASSWORD=<APP_PASSWORD>
    ADMIN_SECRET=<Admin_SECRET_FOR_ADMIN_LOGIN>
- **Put this .env file inside the Server folder for correct configuration**
- **Enter this admin secret while registering the admin, if not entered in default it will take it as "Admin"**

5. Install concurrently if it is not installed:
    ```bash
    npm install concurrently

6. Start both the client (React) and the server (Node.js + Express) together:
    ```bash
    npm run dev

# Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your changes.

# License
This project is licensed under the MIT License. See the LICENSE file for details.
