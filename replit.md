# Fundr DApp

## Overview

Fundr is a decentralized, noncustodial platform on Solana where anyone can create or invest in user-managed on-chain funds. The platform features two main user roles: Fund Managers who create funds and allocate deposits using Jupiter swaps, and Investors who can deposit SOL and withdraw anytime. The system uses a 1% platform fee for $FUND token buy/burn mechanics and manager profit fees only on gains. Built as a modern full-stack web application with React frontend, Express.js backend, and PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.
Project Vision: Noncustodial Solana fund management platform with Jupiter integration, meme-native branding, no finance jargon - gamified, transparent, self-directed.
Design Preferences: BONK orange (#FF9233), PumpFun green (#00FFB2), black/white accents, Solana-forward aesthetic.

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

## Recent Changes (July 30, 2025)

✓ Built comprehensive homepage with Solana-inspired design
✓ Implemented fund cards showing manager info, ROI, and token allocations
✓ Added responsive header with wallet connect functionality  
✓ Created mock data for 6 fund managers with diverse strategies
✓ Updated project vision based on detailed concept outline
✓ Established color scheme: BONK orange (#FF9233), PumpFun green (#00FFB2)

## Core Features Implementation Plan

### Immediate Frontend (Current)
- Homepage with fund discovery and filtering
- Fund detail pages with allocation charts
- Leaderboard for fund rankings
- Create fund interface for managers

### Backend Integration (Next Phase)
- Smart contract integration with Anchor/Solana
- Jupiter swap routing for rebalancing
- PDA-based fund and stake account tracking
- Real-time fund performance calculations

### Platform Mechanics
- 1% platform fee for $FUND token buy/burn
- Manager profit fees only on investor gains
- Noncustodial withdrawal system
- On-chain fund state verification