# Venue Booking Project

## Overview
The Venue Booking Project is a Node.js–based application that provides an online platform for managing venue bookings. The project features both user and administrative interfaces to create, update, and manage bookings, making it a comprehensive solution for event and venue management.

## Features
- **Venue Management:** CRUD operations for venues and bookings.
- **User Authentication:** Secure login for users and administrators.
- **Administrative Dashboard:** View and manage all bookings.
- **Responsive UI:** Modern, responsive design using EJS templates.
- **Automated Testing:** A comprehensive suite of unit and integration tests using Jake.
- **MySQL Database:** Uses MySQL for data storage and retrieval.

## Technologies Used
- **Node.js:** Server-side JavaScript runtime.
- **Express.js:** Web framework for building the server.
- **EJS:** Templating engine for rendering dynamic HTML.
- **MySQL:** Relational database for storing booking data.
- **Jake:** Task runner for automation (builds, tests, etc.).

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v12 or higher)
- [MySQL Server](https://www.mysql.com/)

### Steps
1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd venue-booking-project
   ```
### Install Dependencies: The project includes bundled dependencies. If needed, you can also run:

```bash
npm install
```
### Configure the Database:

Create a new MySQL database (e.g., venue_booking).
Configure the database connection settings. These can be set in an environment configuration file or directly within your application. An example configuration might include:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=venue_booking
```
Run Database Migrations (if applicable): If the project includes database migrations or seed scripts, run them now:

```bash
npm run migrate
```
Start the Application: Launch the server by running:

```bash

npm start
```
The application should now be accessible at http://localhost:3000.

Usage
Access the Application: Open your web browser and navigate to http://localhost:3000 to view the main interface.

Administrative Functions: Log in with an administrative account to manage venue bookings, view reports, and perform additional administrative tasks.

Testing: Run the test suite to verify functionality:

npm test
Project Structure
index.js: The main entry point for the server.
logger.js: Custom logging module for debugging and monitoring.
public/: Contains static assets (e.g., CSS, JavaScript files).
views/: EJS templates used to render the HTML pages.
test/: Contains both unit and integration tests organized into subdirectories.
Other Directories: Several folders include bundled third-party libraries. Ensure you manage these dependencies appropriately.
