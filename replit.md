# Community Event Calendar App

## Overview

A calendar event aggregation application designed to help users discover and track local community events such as farmers markets, concerts, and cultural activities. The app features a monthly calendar view, detailed day views, and user interest tracking capabilities. It includes an admin interface for event and website management, with session-based authentication for administrative functions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library following Material Design principles
- **Styling**: Tailwind CSS with custom design tokens for consistent theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Date Handling**: date-fns library for calendar operations and date formatting

### Backend Architecture
- **Server Framework**: Express.js with TypeScript running on Node.js
- **Session Management**: Express-session with configurable storage for user sessions
- **API Design**: RESTful API endpoints following conventional HTTP methods
- **Authentication**: Session-based admin authentication with password protection
- **Data Validation**: Zod schemas for request/response validation and type safety

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Three main entities - events, reference websites, and user interests
- **Development Storage**: In-memory storage implementation for development and testing
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment

### Authentication and Authorization
- **Admin Access**: Password-based authentication using environment variables
- **Session Security**: HTTP-only cookies with CSRF protection and secure settings
- **User Tracking**: Anonymous session-based interest tracking without user accounts
- **Security Features**: Session regeneration on login and configurable cookie settings

### External Dependencies
- **Database Provider**: Neon Database for serverless PostgreSQL hosting
- **Font Service**: Google Fonts for typography (Inter, DM Sans, Fira Code, Geist Mono)
- **Calendar Integration**: Google Calendar export functionality for adding events
- **Development Tools**: Replit integration for cloud development environment
- **Component Libraries**: Radix UI for accessible component primitives
- **Build Tools**: Vite with React plugin and ESBuild for production builds