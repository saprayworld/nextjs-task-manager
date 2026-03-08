# Next.js Full-Stack Kanban Board

A modern, feature-rich Kanban board application built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and shadcn/ui. This project includes a complete backend with SQLite, Drizzle ORM, and secure authentication via Better Auth.

## ✨ Features

- 🔐 Authentication: Secure Email/Password login and registration using Better Auth.

- 🗄️ Database: Local SQLite database integrated with Drizzle ORM for type-safe queries.

- 📋 Kanban Board: Interactive drag-and-drop task management powered by `@dnd-kit`.

- 📊 List View: Alternative table view for tasks with faceted status filtering.

- ⚡ Server Actions: Secure, server-side CRUD operations without traditional API endpoints.

- 🎨 Modern UI: Beautiful, accessible components from shadcn/ui.

- 🌙 Dark Mode: One-click dark/light mode toggle with system preference support.

- 📱 Responsive Design: Works seamlessly on mobile, tablet, and desktop.

## 🛠️ Tech Stack

- Framework: Next.js 16 (App Router)

- Language: TypeScript

- Styling: Tailwind CSS

- UI Components: shadcn/ui, Lucide Icons

- Drag & Drop: @dnd-kit

- Database: SQLite (better-sqlite3)

- ORM: Drizzle ORM

- Authentication: Better Auth

## 📂 Project Structure

```
.
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── api/auth/         # Better Auth API catch-all routes
│   ├── kanban/           # Protected Kanban board & list routes
│   ├── login/            # Login page
│   └── register/         # Registration page
├── components/
│   ├── kanban/           # Kanban specific components (Board, List, Card, Dialog)
│   ├── ui/               # shadcn/ui reusable components
│   └── theme-toggle.tsx  # Dark/Light mode toggle button
├── db/                   # Database configuration
│   ├── index.ts          # Database connection
│   └── schema.ts         # Drizzle schema (User, Session, Task, etc.)
├── lib/                  # Utilities and Actions
│   ├── actions/          # Next.js Server Actions (CRUD for tasks)
│   ├── auth.ts           # Better Auth server configuration
│   ├── auth-client.ts    # Better Auth client SDK
│   └── utils.ts          # Tailwind merge utilities
└── drizzle.config.ts     # Drizzle ORM configuration
```

## 🚀 Getting Started

Follow these steps to run the project locally.

1. Install Dependencies

```bash
npm install
# or yarn install / pnpm install
```

2. Setup Database

Since this project uses SQLite and Drizzle ORM, you need to create the database file and apply the schema before running the app:

```bash
npx drizzle-kit push
```

(This command will create a `sqlite.db` file in the root directory and generate all necessary tables).

3. Start the Development Server

```bash
npm run dev
# or yarn dev / pnpm dev
```

Open http://localhost:3000 with your browser. You will be redirected to the login page. Create a new account to access your personal Kanban board!

## 🧩 Adding More shadcn/ui Components

If you want to extend the UI, you can add more shadcn components using the CLI:

```bash
npx shadcn@latest add [component-name]
# Example: npx shadcn@latest add date-picker
```

## 📜 Available Scripts

- `npm run dev` - Start development server

- `npm run build` - Build for production

- `npm run start` - Start production server

- `npx drizzle-kit studio` - Open Drizzle Studio to view and edit database visually

- `npm run lint` - Run ESLint

## 🤝 Contribution

Feel free to open issues or submit pull requests if you want to improve this starter template!