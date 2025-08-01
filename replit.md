# Fundr DApp

## Overview

Fundr is a decentralized, noncustodial platform on Solana for creating and investing in user-managed on-chain funds. Fund Managers can create funds and allocate deposits using Jupiter swaps, while Investors can deposit SOL and withdraw anytime. The platform features a 1% platform fee for $FUND token buy/burn and manager profit fees only on gains. The vision is to be a meme-native, gamified, transparent, and self-directed Solana fund management platform, avoiding traditional finance jargon.

## User Preferences

Preferred communication style: Simple, everyday language.
Project Vision: Noncustodial Solana fund management platform with Jupiter integration, meme-native branding, no finance jargon - gamified, transparent, self-directed.
Design Preferences: BONK orange (#FF9233), PumpFun green (#00FFB2), black/white accents, Solana-forward aesthetic.

## System Architecture

The application employs a modern full-stack architecture with a clear separation of concerns:

**Frontend:**
- **Framework:** React with TypeScript, built with Vite.
- **UI:** shadcn/ui components leveraging Radix UI primitives and Tailwind CSS for styling, including custom design tokens for Solana-themed colors.
- **Routing:** wouter for lightweight client-side routing.
- **State Management:** TanStack Query for server state management.

**Backend:**
- **Server:** Express.js with TypeScript.
- **Database ORM:** Drizzle ORM for type-safe operations.
- **Database:** PostgreSQL, configured for Neon serverless.
- **Session Management:** connect-pg-simple for PostgreSQL session storage.

**Core Architectural Decisions & Design Patterns:**
- **Clean Architecture:** Utilizes a storage interface for database abstraction and shared schema definitions between client and server for type-safe API communication.
- **UI/UX:** Solana-forward aesthetic, emphasizing BONK orange and PumpFun green. Focus on competitive messaging ("Prove You're the Best Trader On-Chain") and co-trading concept.
- **Fund Mechanics:** Supports "Manual Allocation Mode" (deposits accumulate as SOL for discretionary trading) and "Auto Allocation Mode" (deposits automatically buy tokens per current ratios). Universal proportional withdrawal behavior.
- **Fee Structure:** Traditional "2 and 20" model: 1% platform fee on deposits (for $FUND buy/burn) and 1% on withdrawals (for treasury), plus 0-20% manager performance fees only on gains above high water mark.
- **Security:** Jupiter Strict List token restriction can be enabled for funds (cannot be removed later).
- **Authentication:** Integrated Web3 wallet connection (Phantom, Solflare, Backpack, Glow, Slope) and Twitter OAuth 2.0 with account linking.
- **Smart Contracts:** Anchor smart contract for fund management, deposits, withdrawals, fee collection, and Program Derived Address (PDA) system. Includes SOL rent reclamation for fund managers.
- **Trading Terminal:** Jupiter SDK integration for advanced swap interface with real-time quotes, price impact, market/limit orders, live charts, and order book visualization.
- **Portfolio Management:** Comprehensive allocation tracking, interactive rebalancing interface with drift indicators, and auto-fill trade functionality.

## External Dependencies

- **@neondatabase/serverless**: Neon PostgreSQL connection.
- **drizzle-orm**: Database ORM and query builder.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/***: Headless UI component primitives.
- **class-variance-authority**: Component variant styling.
- **wouter**: Lightweight routing.
- **zod**: Runtime type validation.
- **Vite**: Frontend build tool.
- **TypeScript**: Language.
- **Tailwind CSS**: Styling.
- **esbuild**: Backend bundling.
- **Solana Web3.js**: Solana blockchain interaction.
- **Anchor**: Solana smart contract framework.
- **Jupiter API/SDK**: On-chain swap and liquidity aggregation.

## Smart Contract Status (Updated: 2025-08-01)

**Current Status: Ready for GitHub Deployment**

- **Smart Contract Code**: Complete Rust/Anchor implementation with corrected fee structure
- **Program ID**: `7VdinD2kvMSSZozANHmvirnmBUZxE7gdKu6Zt11m5DAe` (Ready for deployment)
- **Deployment Method**: GitHub Actions (Replit cannot compile BPF binaries)
- **Frontend Integration**: Fully functional, awaiting real program deployment
- **Fee Structure Fixed**: 1% platform fees, 0-20% performance fee cap, NO management fees

**Recent Security Updates:**
- Removed management_fee field from contract
- Added 20% cap on performance fees
- Performance fees only charged on profits above high water mark
- Platform fees: 1% on deposit, 1% on withdrawal (hardcoded)

**Trading Architecture:**
- Manager executes Jupiter swaps with fund vault assets
- Funds never leave vault PDA except for legitimate trades
- Standard DeFi pattern: contract manages funds, frontend executes swaps
- Full Jupiter integration ready in frontend

**Deployment Solution:**
- GitHub Actions workflow ready (.github/workflows/deploy-solana.yml)
- Mobile-friendly deployment guide (QUICK_DEPLOY_GUIDE.md)
- Funded deployment wallet ready
- One-click deployment after GitHub setup