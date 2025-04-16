# Social Media Application Technical Guide

This document provides technical details for developers working with this social media application. It covers architecture, setup instructions, and development guidelines.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment Setup](#environment-setup)
3. [Project Structure](#project-structure)
4. [Key Technologies](#key-technologies)
5. [Database Design](#database-design)
6. [Authentication](#authentication)
7. [API Endpoints](#api-endpoints)
8. [State Management](#state-management)
9. [Component Architecture](#component-architecture)
10. [Testing](#testing)
11. [Performance Optimization](#performance-optimization)
12. [Deployment](#deployment)
13. [Contribution Guidelines](#contribution-guidelines)

## Architecture Overview

This application follows a modern React-based architecture with Next.js, utilizing the App Router for server-side rendering and API routes for backend functionality.

### Key Architectural Decisions

- **Full Stack Framework**: Next.js for both frontend and backend
- **Database Access**: Prisma ORM for type-safe database operations
- **Authentication**: NextAuth.js for secure user authentication
- **State Management**: React Context API for global state
- **Styling**: Tailwind CSS for utility-first styling
- **Form Handling**: React Hook Form with Zod validation
- **Data Visualization**: Recharts for analytics

## Environment Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/social-media-app.git
   cd social-media-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required variables:
     ```
     DATABASE_URL="file:./dev.db"
     NEXTAUTH_SECRET="your-secret-key"
     NEXTAUTH_URL="http://localhost:3000"
     
     # OAuth providers
     GITHUB_ID="your-github-id"
     GITHUB_SECRET="your-github-secret"
     
     GOOGLE_ID="your-google-id"
     GOOGLE_SECRET="your-google-secret"
     
     FACEBOOK_ID="your-facebook-id" 
     FACEBOOK_SECRET="your-facebook-secret"
     
     TWITTER_ID="your-twitter-id"
     TWITTER_SECRET="your-twitter-secret"
     ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Project Structure

The project follows a feature-based organization within the Next.js App Router structure:

```
src/
├── app/                 # Next.js App Router
│   ├── api/             # API routes
│   ├── (routes)/        # Page routes
│   └── layout.tsx       # Root layout
├── components/          # Reusable components
│   ├── feed/            # Feed components
│   ├── layout/          # Layout components
│   ├── post/            # Post components
│   └── ui/              # UI components
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
│   ├── auth.ts          # Authentication config
│   ├── db.ts            # Database client
│   └── validations.ts   # Zod schemas
├── prisma/              # Prisma schema and migrations
└── public/              # Static assets
```

## Key Technologies

### Frontend

- **React 18**: Component-based UI library
- **Next.js 13+**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI components
- **Lucide React**: Icon library
- **Recharts**: Composable charting library
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: ORM for database operations
- **SQLite**: Database (production would use PostgreSQL)
- **NextAuth.js**: Authentication framework
- **bcrypt**: Password hashing

## Database Design

The database is designed with the following core models:

### Core Entities

- **User**: Account information and profile data
- **Post**: User-created content
- **Comment**: Responses to posts
- **Like**: User reactions to posts
- **Bookmark**: Saved posts
- **Follow**: User connections
- **Community**: User groups
- **Membership**: User-community relationships
- **Message**: Private communications
- **Notification**: System and user activity alerts
- **Advertisement**: Promotional content
- **UserMetrics**: Analytics data

### Key Relationships

The schema includes various relationships:

- One-to-many (User to Posts)
- Many-to-many (Users to Communities via Memberships)
- Self-referential (User follows User)
- Polymorphic-like (Notifications with different sources)

See the Prisma schema for detailed field definitions and relations.

## Authentication

The application uses NextAuth.js for authentication with the following features:

### Authentication Methods

- Email/password (credentials provider)
- OAuth providers:
  - GitHub
  - Google
  - Facebook
  - Twitter

### Session Management

- JWT-based sessions
- Custom session handling to include user details
- Secure HTTP-only cookies

### Protected Routes

- Server-side session verification for API routes
- Client-side protection via useSession hook
- Redirect handling for unauthenticated users

## API Endpoints

The application provides RESTful API endpoints:

### Post Management

- `GET /api/posts` - List posts (paginated)
- `GET /api/posts/for-you` - Get personalized feed
- `GET /api/posts/following` - Get following feed
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get post details
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `DELETE /api/posts/:id/like` - Unlike post
- `POST /api/posts/:id/bookmark` - Bookmark post
- `DELETE /api/posts/:id/bookmark` - Remove bookmark

### User Management

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/posts` - Get user posts
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `GET /api/users/:id/follow-counts` - Get follower/following counts

### Messaging

- `GET /api/messages/conversations` - List conversations
- `GET /api/messages/:userId` - Get conversation with user
- `POST /api/messages` - Send message

### Notifications

- `GET /api/notifications` - Get notifications
- `POST /api/notifications/mark-read` - Mark notifications as read

### Communities

- `GET /api/communities` - List communities
- `GET /api/communities/user` - Get user's communities
- `GET /api/communities/:id/posts` - Get community posts
- `POST /api/communities/:id/join` - Join community

### Ads

- `GET /api/ads` - Get advertisements

## State Management

The application uses React Context for state management:

### Core Context Providers

- **UIContext**: Manages UI state (sidebar, dark mode, tab visibility)
- **FeedContext**: Manages feed state (active tab, posts, loading)
- **AuthContext**: Wraps NextAuth for authentication state

### Usage Pattern

```tsx
// Context definition
export const UIContext = createContext<UIContextType | undefined>(undefined);

// Provider implementation
export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // ...other state
  
  return (
    <UIContext.Provider value={{ sidebarOpen, setSidebarOpen, /* other values */ }}>
      {children}
    </UIContext.Provider>
  );
}

// Custom hook for consuming context
export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
```

## Component Architecture

Components follow a hierarchical structure with clear separation of concerns:

### Component Types

- **Page Components**: Top-level components for routes
- **Feature Components**: Implement specific features (Feed, PostCard)
- **Layout Components**: Structure the application (Sidebar, MobileFooter)
- **UI Components**: Reusable UI elements (Button, Input)

### Component Guidelines

- Maximum file length: 200 lines
- Maximum line length: 130 characters
- Each component should have a single responsibility
- Use composition over inheritance
- Props should be typed with TypeScript interfaces
- Use destructuring for props

### Example Component

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
}: ButtonProps) {
  // Component implementation
}
```

## Testing

The application uses the following testing approaches:

### Testing Tools

- Jest for unit and integration tests
- React Testing Library for component tests
- Cypress for end-to-end tests

### Testing Patterns

- Unit tests for utilities and hooks
- Component tests for UI behavior
- Integration tests for complex features
- E2E tests for critical user flows

### Example Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Performance Optimization

Several techniques are used for optimal performance:

### Rendering Optimizations

- React.memo for expensive components
- useMemo and useCallback for computational stability
- Virtualized lists for long content
- Image optimization with Next.js Image component

### Data Fetching

- SWR for client-side data fetching with caching
- Strategic use of SSR/SSG for initial page load
- Pagination and infinite scrolling for data-heavy views

### Code Splitting

- Dynamic imports for route-based code splitting
- Lazy loading of heavy components
- Bundle analyzer to identify optimization opportunities

## Deployment

### Deployment Options

- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Self-hosted options

### Deployment Process

1. Set up production environment variables
2. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```
3. Migrate the database (if needed)
4. Deploy to your hosting provider:
   ```bash
   npm run deploy
   # or
   yarn deploy
   ```

### CI/CD Configuration

The project includes GitHub Actions workflows for:
- Linting and type checking
- Running tests
- Automatic deployment to staging/production

## Contribution Guidelines

### Code Style

- Follow the ESLint and Prettier configuration
- Use meaningful variable and function names
- Comment complex logic
- Write documentation for public APIs

### Git Workflow

1. Create feature branches from `develop`
2. Use conventional commit messages
3. Create pull requests for review
4. Squash and merge to maintain clean history

### Review Process

- All code changes require at least one review
- Automated checks must pass (lint, type check, tests)
- Changes should include appropriate tests
- Documentation should be updated if necessary

### Development Workflow

1. Pick an issue from the board
2. Create a feature branch
3. Implement the changes with tests
4. Create a pull request
5. Address review feedback
6. Merge when approved