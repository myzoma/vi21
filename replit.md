# Elliott Wave Analyzer

## Overview

This is a comprehensive Elliott Wave Technical Analysis application that provides real-time cryptocurrency market analysis using Elliott Wave Theory combined with traditional technical indicators. The application features a React frontend with a Node.js/Express backend, designed to analyze trading patterns and generate intelligent trading signals for cryptocurrency markets.

The system integrates with Binance API for live market data and implements sophisticated algorithms for Elliott Wave pattern recognition, technical indicator calculations, and automated trading signal generation. It includes user features like watchlists, price alerts, and detailed analysis reports with confidence scoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: RTL (Right-to-Left) support for Arabic interface

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for market data, analysis, and user features
- **Real-time Data**: Binance API integration for live cryptocurrency prices
- **Analysis Engine**: Custom Elliott Wave pattern recognition algorithms
- **Technical Indicators**: Real mathematical implementations (RSI, MACD, SMA, EMA)
- **Storage**: In-memory storage with interface for future database integration

### Data Storage Solutions
- **Current**: In-memory storage implementation for development
- **Prepared**: Drizzle ORM configuration for PostgreSQL with schemas defined
- **Database Schema**: 
  - Users table for authentication
  - Watchlist items for user preferences
  - Price alerts for notifications
  - Analysis results for caching computed data
- **Session Management**: Prepared for connect-pg-simple session store

### Authentication and Authorization
- **Approach**: Session-based authentication (prepared but not fully implemented)
- **User Management**: Basic user registration and login structure
- **Security**: Password hashing and session management ready for implementation

### Core Analysis Components

#### Elliott Wave Analyzer
- **Pattern Recognition**: ZigZag algorithm for pivot point identification
- **Wave Counting**: Automated Elliott Wave pattern detection
- **Fibonacci Levels**: Support and resistance calculation
- **Confidence Scoring**: Algorithm-based reliability assessment

#### Technical Analysis Service
- **RSI Calculation**: Relative Strength Index with overbought/oversold signals
- **MACD Analysis**: Moving Average Convergence Divergence with signal line
- **Moving Averages**: Simple and Exponential Moving Average calculations
- **Trading Signals**: Automated buy/sell signal generation

#### Market Data Integration
- **Real-time Prices**: Live cryptocurrency price feeds from Binance
- **Historical Data**: Kline/candlestick data for technical analysis
- **Symbol Management**: Top cryptocurrency pairs tracking
- **Data Caching**: Optimized API calls with intelligent caching

### Development and Deployment Architecture
- **Development**: Vite dev server with HMR and Express API
- **Build Process**: Separate frontend and backend build pipelines
- **Static Assets**: Vite handles frontend asset optimization
- **Environment**: Replit-optimized with development tooling

## External Dependencies

### Primary APIs and Services
- **Binance API**: Real-time cryptocurrency market data, price feeds, and historical kline data
- **Neon Database**: PostgreSQL database service (configured but not yet connected)

### Major NPM Packages
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **@radix-ui/**: Comprehensive UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **zod**: TypeScript schema validation
- **date-fns**: Date manipulation and formatting
- **wouter**: Lightweight routing library

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundling for production
- **PostCSS**: CSS processing with Tailwind

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development environment integration

The application is architected for scalability with clear separation of concerns, comprehensive type safety, and production-ready patterns while maintaining simplicity for development and deployment on Replit.