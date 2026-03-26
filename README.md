# Next.js Full-Stack Kanban Board

A modern, feature-rich Kanban board application built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and shadcn/ui. This project includes a complete backend with Neon Serverless PostgreSQL, Drizzle ORM, and secure Passwordless Authentication via Better Auth and Resend.

## ✨ Features

- 🔐 Passwordless Authentication: Secure Email OTP login and registration powered by Better Auth and Resend.

- 🗄️ Database: Serverless PostgreSQL (Neon) integrated with Drizzle ORM for type-safe queries.

- 📋 Kanban Board: Interactive drag-and-drop task management powered by `@dnd-kit`.

- 🗑️ Archive & Trash: Support for archiving completed tasks and a soft-delete trash bin for recovery.

- 🛡️ Profile & Security: Comprehensive profile management, email verification, and security settings.

- 📱 Active Sessions: Device session management allowing users to revoke access from other logged-in devices.

- 📝 Rich Text Editor: Comprehensive WYSIWYG editor for task descriptions powered by Tiptap.

- ⚡ Server Actions: Secure, server-side CRUD operations without traditional API endpoints.

## 🛠️ Tech Stack

- Framework: Next.js 16 (App Router)

- Language: TypeScript

- Styling: Tailwind CSS

- UI Components: shadcn/ui, Lucide Icons

- Drag & Drop: @dnd-kit

- Rich Text Editor: Tiptap & Tailwind Typography

- Database: Neon Serverless PostgreSQL

- ORM: Drizzle ORM

- Authentication: Better Auth

- Email Provider: Resend

## 📂 Project Structure

```
.
├── src/
│   ├── app/                  # Next.js App Router (Pages & Layouts)
│   │   ├── api/auth/         # Better Auth endpoint
│   │   ├── kanban/           # Dashboard, List, Archive, Trash
│   │   ├── profile/          # Profile, Security, Sessions
│   │   ├── login/            # Passwordless login
│   │   └── register/         # Passwordless registration
│   ├── components/
│   │   ├── kanban/           # Kanban generic and specific components
│   │   ├── profile/          # Profile & Sidebar components
│   │   ├── ui/               # shadcn/ui reusable components
│   │   └── theme-toggle.tsx  # Dark mode toggle
│   ├── db/                   # Database configuration (Neon, Schema)
│   └── lib/                  # Core Utilities & Server Actions
└── drizzle.config.ts     # Drizzle ORM configuration
```

## 🚀 Getting Started

Follow these steps to run the project locally.

1. Install Dependencies

```bash
yarn install
```

2. Setup Environment Variables

Create a `.env` file containing your Neon database connection string and Resend API key for Email OTPs:

```bash
DATABASE_URL="postgresql://user:pass@ep-rest-of-url.neon.tech/neondb?sslmode=require"
RESEND_API_KEY="re_123456789"
```

3. Setup Database

Push the Drizzle schema directly to your Neon PostgreSQL instance:

```bash
npx drizzle-kit push
```

4. Start the Development Server

```bash
yarn dev
```

Open http://localhost:3000 with your browser. You will be redirected to the login page. Create a new account to access your personal Kanban board!

## 🧩 Adding More shadcn/ui Components

If you want to extend the UI, you can add more shadcn components using the CLI:

```bash
npx shadcn@latest add [component-name]
# Example: npx shadcn@latest add date-picker
```

## 📜 Available Scripts

- `yarn dev` - Start development server

- `yarn build` - Build for production

- `yarn start` - Start production server

- `npx drizzle-kit studio` - Open Drizzle Studio to view and edit database visually

- `yarn lint` - Run ESLint

## 🤝 Contribution

Feel free to open issues or submit pull requests if you want to improve this starter template!