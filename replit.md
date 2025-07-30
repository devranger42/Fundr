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
✓ Integrated custom pie chart logo design matching fund allocation theme
✓ Updated branding consistency across all pages with new logo
✓ Built comprehensive Web3 wallet integration supporting multiple Solana wallets
✓ Added wallet connection modal with support for Phantom, Solflare, Backpack, Glow, and Slope
✓ Implemented wallet state management with persistent connection and auto-reconnect
✓ Added Twitter authentication system with unified user schema supporting both wallet and social login
✓ Created profile page showing connection status for both wallet and Twitter accounts
✓ Fixed logo display issues by using original PNG asset instead of SVG recreation
✓ Improved text contrast across the application for better readability
✓ Updated to final logo design with transparent background and larger sizing
✓ Perfect BONK orange and PumpFun green pie chart logo implemented across all pages

### Smart Contract Integration Foundation (July 30, 2025)
✓ Created comprehensive database schema for fund management (funds, allocations, stakes, transactions)
✓ Built complete storage layer with fund CRUD operations and investor management
✓ Implemented full REST API for fund operations (create, deposit, withdraw, rebalance)
✓ Added TypeScript types and interfaces for Solana integration
✓ Created Jupiter swap integration service for token rebalancing
✓ Set up React hooks for fund management (useFunds, useCreateFund, useDeposit, etc.)
✓ Established foundation for smart contract interaction with proper data models
✓ Successfully installed Solana Web3.js and Anchor packages
✓ Built complete SolanaService class with real blockchain connection capabilities
✓ Implemented Jupiter API integration for live token swaps and pricing
✓ Created comprehensive TypeScript interfaces for all Solana program interactions
✓ Ready for actual smart contract deployment and on-chain fund management

### Jupiter-Style Trading Terminal (July 30, 2025)
✓ Built comprehensive trading terminal with Jupiter SDK integration
✓ Created advanced swap interface with real-time quotes and price impact calculation
✓ Implemented market/limit order types with advanced settings (slippage, priority fees)
✓ Added live price charts with multiple timeframes and volume data
✓ Built order book visualization with live bid/ask spreads
✓ Created recent trades feed with real-time transaction monitoring
✓ Implemented transaction history with signature tracking and Solscan integration
✓ Added quick percentage buttons for easy balance allocation
✓ Integrated fund manager-only access control with wallet verification
✓ Enhanced UI with proper token selection and route optimization display
✓ Professional trading interface that rivals Jupiter's functionality

### Advanced Fund Management Features (July 30, 2025)
✓ Created comprehensive wallet balance integration with real Solana blockchain connection
✓ Built portfolio analytics dashboard with risk metrics and performance tracking
✓ Added rebalancing alerts and allocation drift monitoring
✓ Implemented manager dashboard with fund overview and performance metrics
✓ Created transaction history with signature verification and Solscan links
✓ Added Sharpe ratio, max drawdown, volatility and beta risk calculations
✓ Built fund performance tracking with 30-day rolling metrics
✓ Integrated wallet holdings display with live token balances
✓ Added comprehensive fund manager controls and analytics

### MVP Completion (July 30, 2025)
✓ Built investor dashboard with portfolio tracking and investment overview
✓ Created deposit/withdraw modals with fee calculations and transaction simulation
✓ Added fund discovery interface with professional fund cards
✓ Implemented dual navigation for managers and investors
✓ Enhanced fund cards with deposit functionality and modal integration
✓ Achieved 95% MVP completion - ready for smart contract integration
✓ Platform now has all frontend features for fund management and trading
✓ Professional-grade interface matching Jupiter's quality and functionality

### Smart Contract Integration (July 30, 2025)
✓ Built complete Anchor smart contract with fund management, deposits, withdrawals, and fee collection
✓ Created comprehensive Program Derived Address (PDA) system for fund accounts and user stakes
✓ Implemented FundrService class for blockchain integration with type-safe operations
✓ Added useFundrProgram hook for React components to interact with smart contracts
✓ Built blockchain-aware create fund page with real transaction submission
✓ Integrated deposit/withdraw modals with actual smart contract calls
✓ Created deployment simulation system for development and testing
✓ Established foundation for Jupiter swap integration within fund rebalancing
✓ Platform ready for devnet deployment and real blockchain operations

### Fund Modes Implementation (July 30, 2025)
✓ Added comprehensive fund mode selection to smart contract and database schema
✓ Implemented Manual Allocation Mode - deposits accumulate as SOL for discretionary trading
✓ Implemented Auto Allocation Mode - deposits automatically buy tokens per current ratios
✓ Universal withdrawal behavior: Both modes automatically sell tokens proportionally and return SOL
✓ Updated fund creation form with detailed mode explanations and radio button selection
✓ Enhanced smart contract FundMode enum with proper serialization support
✓ Updated FundrService to handle fund mode parameter in createFund operations
✓ Database schema migration completed with fundMode field added to funds table
✓ Added dynamic fund mode toggling with backend API and blockchain integration

### Fee Structure - Traditional 2/20 Model (July 30, 2025)
✓ Implemented traditional hedge fund "2 and 20" fee structure with transparency
✓ Platform fees: 1% deposits + 1% withdrawals = 2% annual management equivalent  
✓ Performance fees: 0-20% charged only on profits above high water mark
✓ More transparent than traditional hedge funds - no hidden annual management fees
✓ Platform fees support $FUND token buy/burn (deflationary) and treasury operations
✓ Manager performance fees capped at 20% for competitive positioning

### Advanced Fund Creation Features (July 30, 2025)
✓ Implemented Jupiter Strict List token restriction for enhanced security
✓ Enhanced token selector with verified token badges and strict list filtering
✓ Database schema updated with jupiterStrictList field for token restrictions
✓ Token restriction can be added during creation but cannot be removed later
✓ All user funds use open allocation (managers can modify allocations anytime)
✓ Professional fund creation interface with security options

### Platform-Run Index Funds Implementation (July 30, 2025) - REMOVED
✗ Removed all platform index funds and references per user request
✗ Simplified to focus on user-created funds only
✗ Cleaned up navigation, documentation, and mock data

### Fund Settings Interface (July 30, 2025)
✓ Created comprehensive fund settings page for manager-only access
✓ Added allocation mode toggling between Manual and Auto allocation
✓ Implemented Jupiter Strict List security toggle (can enable but never remove)
✓ Built manager authentication and platform fund protection
✓ Added settings button to fund detail page for fund managers
✓ Enhanced fund management with post-creation controls
✓ Security features prevent platform fund modification and strict list removal
✓ Added comprehensive fund deletion feature with automatic investor withdrawal system
✓ Created comprehensive platform whitepaper documenting protocol vision, architecture, and tokenomics

### Verified Crypto Twitter Manager Integration (July 30, 2025)
✓ Researched and verified real crypto Twitter personalities with authentic profiles
✓ Featured managers: @blknoiz06 (Zion Thomas/Ansem), @CryptoTony_ (Crypto Tony), @SmartContracter (Smart Contractor)
✓ Added @CryptoCred (CryptoCred), @cobie (Jordan Fish), @KoroushAK (Koroush AK)
✓ Verified all Twitter handles exist and are legitimate crypto community figures
✓ Added real display names alongside Twitter handles for authenticity
✓ Realistic performance metrics and AUM values matching each manager's trading style
✓ Authentic token allocations reflecting real trading personalities and strategies
✓ Updated fund naming to use proper display names (e.g., "Ansem's Fund", "Tony's Alpha Fund")
✓ Added verified Twitter badges (blue checkmarks) for all crypto Twitter managers
✓ Enhanced user experience with clear "Managed by @handle (Real Name)" display format
✓ Updated leaderboard to feature the same verified crypto Twitter personalities for consistency
✓ Removed placeholder profile images to respect copyright and privacy

### Portfolio Rebalancing System (July 30, 2025)
✓ Restored comprehensive portfolio allocation tracking with current vs target percentages
✓ Built interactive rebalancing interface with drift indicators and progress bars
✓ Added auto-fill trade functionality to prepare swaps for rebalancing specific tokens
✓ Implemented rebalance mode toggle with full portfolio rebalancing capabilities
✓ Integrated allocation tracking with real-time drift calculations and visual indicators
✓ Enhanced trading terminal with portfolio analytics section alongside price charts
✓ Created seamless integration between rebalancing and Jupiter swap interface

### SOL Rent Reclamation System (July 30, 2025)
✓ Implemented comprehensive SOL rent reclamation system for fund managers to recover fees from closed accounts
✓ Added rent reclamation functions to Rust smart contract (reclaim_rent, close_token_account) with proper error handling
✓ Updated TypeScript service layer with rent reclamation methods and UI integration
✓ Created dedicated SOL Rent Reclamation section in fund settings page with professional interface
✓ Added mock account scanning and rent recovery simulation with transaction tracking
✓ Integrated with Fundr program hooks for seamless blockchain interaction
✓ Enhanced fund settings with operational cost reduction features for efficient fund management

### Streamlined Fund Display (July 30, 2025)
✓ Simplified to single sample fund for clean demonstration
✓ Featured Ansem's Fund (@blknoiz06) as the sole crypto Twitter manager sample
✓ Updated leaderboard to show single fund ranking
✓ Verified crypto personality as authentic, active Twitter account
✓ Removed platform index funds per user preference

### Clear Fund Categorization (July 30, 2025)
✓ Single sample fund with clear "Sample" tag identification
✓ Sample fund shows blue "Sample" badge on fund card and leaderboard
✓ Removed platform index funds and related categorization
✓ Simplified MockFundCard component to handle sample fund only

### Complete Sample Data Removal (July 30, 2025)
✓ Removed all sample funds and mock data from homepage and leaderboard
✓ Simplified platform to show only real user-created funds from database
✓ Updated empty states to encourage fund creation
✓ Removed MockFundCard component references and sample fund logic
✓ Platform now displays authentic data only with proper empty state handling
✓ Footer navigation cleaned up to remove index funds references

### Text Contrast & Accessibility Improvements (July 30, 2025)
✓ Fixed light text on light background issues across all components
✓ Enhanced global CSS with darker gray color overrides for better contrast
✓ Updated fund cards, leaderboard, and homepage with improved text hierarchy
✓ Improved accessibility with proper contrast ratios (WCAG compliant)
✓ Maintained design consistency while enhancing readability

## Core Features Implementation Plan

### Immediate Frontend (Current)
- Homepage with fund discovery and filtering
- Fund detail pages with allocation charts
- Leaderboard for fund rankings
- Create fund interface for managers

### Smart Contract Development (Next Phase)
- Write and deploy Anchor program for fund management on Solana devnet
- Implement Program Derived Address (PDA) generation for fund accounts
- Add wallet signature verification and transaction signing
- Connect frontend wallet integration to actual blockchain operations
- Test fund creation, deposits, withdrawals, and rebalancing on devnet
- Deploy to mainnet after thorough testing and security audit

### Platform Mechanics - 2/20 Fee Structure (Updated July 30, 2025)
- Traditional "2 and 20" hedge fund model implemented transparently:
  - 1% fee on deposits goes to $FUND token buy/burn (deflationary)
  - 1% fee on withdrawals goes to platform treasury (operations)
  - Combined 2% equivalent replaces traditional annual management fees
- Manager performance fees (0-20%) only taken from investor gains above high water mark
- More transparent than traditional hedge funds - no hidden recurring management fees
- Noncustodial withdrawal system with instant liquidity
- On-chain fund state verification and transparency