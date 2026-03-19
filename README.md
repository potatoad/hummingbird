# Hummingbird

Hummingbird is a full-stack web application designed for managing media junkets. It allows you to create and organize multi-day events, configure individual
rooms for interviews, and schedule specific time slots for talent and press.

## Tech Stack

**Frontend:**

- [React](https://reactjs.org/) (UI framework)
- [Vite](https://vitejs.dev/) (Build tool & development server)
- TypeScript

**Backend:**

- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) (API server)
- [Prisma](https://www.prisma.io/) (ORM for database interactions)
- TypeScript

## Project Structure

This repository is set up as a monorepo containing both the backend and frontend:

- `/` (Root): Contains the Node.js/Express backend, Prisma schema, and database configuration.
- `/client`: Contains the Vite/React frontend application.

## Data Models

The data is structured hierarchically. Deleting a parent record will automatically cascade and delete all associated child records.

1. **Junket**: The overarching event.
2. **Day**: Specific dates tied to a Junket.
3. **Room**: Physical or virtual rooms assigned to a Day (can include tech, producer, and timer info).
4. **Slot**: Individual schedule blocks assigned to a Room (includes duration, title, and ordering).

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Install Dependencies

You will need to install dependencies for both the backend and the frontend.

Open your terminal in the root directory and run:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Database Setup

Ensure your database is synchronized with your Prisma schema. From the root directory, run:

```bash
# Generate the Prisma Client
npx prisma generate

# Apply migrations to your database
npx prisma migrate dev
```

### 3. Running the App

The project is configured to run both the Express backend and the Vite frontend simultaneously using `concurrently`.

From the root directory, start the development servers:

```bash
npm run dev
```

- Frontend: The React app will be running at `http://localhost:5173`

- Backend: The Express API will be running at `http://localhost:3000`
(Note: The Vite frontend proxies API requests to the backend automatically).

## API Endpoints

The Express server exposes the following RESTful routes:

| Method   | Endpoint       | Description                                      | Example Payload / Request Body |
| :---     | :---           | :---                                             | :--- |
| `GET`    | `/junkets`     | Fetch all Junkets (includes nested data)         | *None* |
| `POST`   | `/junkets`     | Create a new Junket                              | `{"name": "Dune Part 2 Press Tour"}` |
| `DELETE` | `/junkets/:id` | Delete a Junket (cascades)                       | *None* |
| `GET`    | `/days`        | Fetch all Days                                   | *None* |
| `POST`   | `/days`        | Create a new Day (requires `junketId`)           | `{"date": "2026-04-15", "junketId": "clt...id"}` |
| `DELETE` | `/days/:id`    | Delete a Day (cascades)                          | *None* |
| `GET`    | `/rooms`       | Fetch all Rooms                                  | *None* |
| `POST`   | `/rooms`       | Create a new Room (requires `dayId`)             | `{"name": "Room A", "dayId": "clt...id"}` |
| `DELETE` | `/rooms/:id`   | Delete a Room (cascades)                         | *None* |
| `GET`    | `/slots`       | Fetch all Slots                                  | *None* |
| `POST`   | `/slots`       | Create a new Slot (requires `roomId`)            | `{"title": "Timothée Chalamet", "duration": 300, "orderIndex": 1.0, "roomId": "clt...id"}` |
| `DELETE` | `/slots/:id`   | Delete a Slot                                    | *None* |