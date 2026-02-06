# MoneyTracker Frontend

This is the client-side application for MoneyTracker, built with **Next.js 15**, **Material UI (MUI)**, and **Redux Toolkit**.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: Material UI (MUI) v6 + Emotion
- **State Management**: Redux Toolkit + RTK Query
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Charts**: Chart.js (via react-chartjs-2)
- **Real-time**: Socket.io-client

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Backend running on `http://localhost:4000`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
  - `(auth)/`: Authentication routes (login, register).
  - `dashboard/`: Protected application routes.
- `components/`: Reusable UI components (Navbar, Modals, Charts).
- `features/`: Redux slices and RTK Query API definitions.
- `hooks/`: Custom hooks (e.g., `useSocket`).
- `theme/`: MUI theme configuration.
- `types/`: TypeScript interfaces shared across the app.

## Features
- **Authentication**: Connects to backend for Login/Register.
- **Dashboard**: Visualizes lending/borrowing stats.
- **Transactions**: Create, edit, and delete transactions.
- **Chat**: Real-time messaging with other users.
- **Contacts**: Manage your address book.
