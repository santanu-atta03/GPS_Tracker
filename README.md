# GPS Tracker

## Overview

This is a full-stack GPS Tracker application with a React frontend and a Node.js backend.

The project is a comprehensive GPS tracking system for public transportation. It allows users to track buses in real-time, plan their journeys, and book tickets. It also provides a separate interface for drivers to manage their buses and routes.

## Features

- **Real-time Bus Tracking**: Users can view the live location of buses on a map.
- **Journey Planner**: Plan your journey from source to destination, including transfers and walking routes.
- **Ticket Booking**: Book tickets and pay securely using Razorpay.
- **User and Driver Authentication**: Secure login and registration for both users and drivers.
- **AI-Powered Support**: Get help from an intelligent support bot.
- **Multi-language Support**: The application supports multiple languages.

## Tech Stack

### Frontend

- **React**: A JavaScript library for building user interfaces.
- **Vite**: Next-generation frontend tooling.
- **Redux**: A predictable state container for JavaScript apps.
- **React Router**: Declarative routing for React.
- **Tailwind CSS**: A utility-first CSS framework.
- **Leaflet**: An open-source JavaScript library for mobile-friendly interactive maps.

### Backend

- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express**: A minimal and flexible Node.js web application framework.
- **MongoDB**: A cross-platform document-oriented database program.
- **Mongoose**: An Object Data Modeling (ODM) library for MongoDB.
- **Redis**: An in-memory data structure store, used as a database, cache, and message broker.
- **Razorpay**: A payment gateway for online payments.
- **LangChain & Google Generative AI**: For the AI-powered support bot.

## Project Architecture

The GPS Tracker system follows a modular, scalable architecture:

- **GPS Device**  
  Sends real-time location data (latitude, longitude, timestamp)

- **Backend API (Node.js + Express)**  
  - Validates and processes location data  
  - Stores data in MongoDB  
  - Uses Redis for caching and performance optimization  
  - Exposes REST APIs for frontend consumption

- **Frontend (React + Leaflet)**  
  - Displays real-time bus locations on interactive maps  
  - Handles journey planning, ticket booking, and user interaction

This separation allows independent scaling of frontend, backend, and device layers.

## Repository Structure

The project is organized into two main directories:

- `Frontend`: Contains the React application.
- `Backend`: Contains the Node.js API.

For more detailed information, please refer to the `README.md` files in each directory:

- [Frontend README](./Frontend/README.md)
- [Backend README](./Backend/README.md)

## Getting Started

To get started with this project, you will need to set up both the frontend and backend services. Please follow the instructions in the respective `README.md` files.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)

### Installation and Running

1.  **Backend Setup**:
    - Navigate to the `Backend` directory.
    - Follow the instructions in `Backend/README.md`.

2.  **Frontend Setup**:
    - Navigate to the `Frontend` directory.
    - Follow the instructions in `Frontend/README.md`.

Once both the backend and frontend servers are running, you can access the application in your browser.

## ECWoC 2026 Contribution Scope

This project welcomes contributors of all skill levels as part of **ECWoC 2026**.

- **Beginner Contributors**
  - Documentation improvements
  - UI fixes and enhancements
  - Writing test cases
  - Bug fixing

- **Intermediate Contributors**
  - API improvements
  - Performance optimization
  - Feature enhancements
  - State management improvements

- **Advanced Contributors**
  - Real-time tracking optimization
  - Route-matching algorithms
  - System scalability
  - Advanced map integrations

Contributors are expected to follow guidelines, communicate regularly, and maintain clean code.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
