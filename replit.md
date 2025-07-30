# Fundr DApp

## Overview

Fundr is a decentralized finance application built as a modern full-stack web application. The project implements a fund management platform where users can create and invest in on-chain funds, featuring a React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state

## Key Components

### Frontend Architecture
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for Solana-themed colors
- **Routing**: wouter for lightweight client-side routing
- **State Management**: TanStack Query for API state management

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: Uses connect-pg-simple for PostgreSQL session storage

### Database Schema
- **Users Table**: Basic user management with username/password authentication
- **Schema Location**: Shared between frontend and backend in `/shared/schema.ts`
- **Type Safety**: Full TypeScript integration with Drizzle-generated types

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Routes**: Express.js handles requests in `/server/routes.ts`
3. **Data Layer**: Storage interface abstracts database operations
4. **Database**: PostgreSQL stores persistent data
5. **Response**: JSON responses sent back to client

The application uses a clean architecture pattern with:
- Storage interface for database abstraction
- Shared schema definitions between client/server
- Type-safe API communication

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL connection
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **class-variance-authority**: Component variant styling
- **wouter**: Lightweight routing
- **zod**: Runtime type validation

### Development Tools
- **Vite**: Build tool with React plugin
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **esbuild**: Backend bundling for production

## Deployment Strategy

The application is configured for deployment with:

### Build Process
- **Frontend**: Vite builds to `dist/public`
- **Backend**: esbuild bundles server to `dist/index.js`
- **Database**: Drizzle migrations in `/migrations` directory

### Environment Configuration
- **Development**: Uses `tsx` for TypeScript execution
- **Production**: Compiled JavaScript with Node.js
- **Database**: Requires `DATABASE_URL` environment variable

### Replit Integration
- **Development Banner**: Integrated for Replit environment
- **Error Overlay**: Runtime error modal in development
- **Cartographer**: File system mapping for Replit

The project structure supports both development and production environments with appropriate tooling for each context.