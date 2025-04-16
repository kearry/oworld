# Social Media Application Requirements Document

## Overview

This document details the features, functionalities, and technical specifications for a modern social media application built with React, TypeScript, Next.js, and various supporting technologies. The application is designed to provide users with a seamless experience for content sharing, social interaction, and community engagement.

## Tech Stack

### Frontend
- **React** with Next.js App Router for component-based UI development
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for accessible UI components
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Next.js API Routes** for serverless API endpoints
- **Prisma ORM** for database queries and operations
- **SQLite** as the database engine
- **Next Auth** for authentication

### Validation & Type Safety
- **Zod** for schema validation and type inference
- **TypeScript** for static type checking

### Code Quality
- **ESLint** for code linting and best practices enforcement

## Core Features

### 1. User Authentication & Profiles

#### Requirements
- Email/username and password authentication
- Social login support (GitHub, Facebook, Google, Twitter)
- User profiles with customizable images, bios, and handles
- Follow/unfollow functionality
- Follower and following lists

#### Technical Details
- JWT-based authentication with Next Auth
- Secure password storage with bcrypt
- Prisma relations for following system
- Support for profile image upload

### 2. Left Sidebar Navigation

#### Requirements
- Collapsible sidebar on the left side of the application
- User profile section with profile image, username, and handle
- Follower and following counts with links to respective lists
- Navigation links to:
  - Home
  - Search
  - Notifications
  - Messages
  - Profile
  - Analytics
  - Communities
  - Settings
- Dark mode toggle

#### Technical Details
- Responsive design that collapses to a footer bar on mobile
- Context-based state management for sidebar visibility
- LocalStorage for persisting user preferences (dark mode)

### 3. Dashboard & Feed

#### Requirements
- Main content area with various feeds
- Floating action button (FAB) for creating new posts
- Tab navigation with "For You" and "Following" feeds
- User communities displayed as tabs
- Auto-hiding tab bar on scroll
- Infinite scrolling for content loading

#### Technical Details
- React context for feed state management
- Intersection Observer API for infinite scrolling
- Fetch-based API calls for retrieving content
- Custom hooks for scroll detection and tab bar visibility

### 4. Content Curation

#### Requirements
- "For You" feed with content tailored to user interests
- "Following" feed showing posts from followed users
- Community-specific feeds

#### Technical Details
- Algorithm for "For You" feed based on:
  - User interests (communities joined)
  - Following relationships
  - Post engagement metrics (likes, comments)
  - Content recency
- Direct query for "Following" feed based on followed user IDs
- Community-based filtering for community-specific feeds

### 5. Post Creation & Interaction

#### Requirements
- Create posts with text (up to 300 characters)
- Support for image attachments
- Like, comment, and bookmark functionality
- Post sharing capabilities
- Engagement metrics display (likes, comments, reposts, impressions)

#### Technical Details
- Modal-based post creation interface
- Image upload with preview
- Optimistic UI updates for interactions
- Real-time character counter

### 6. Advertisements

#### Requirements
- Interleaved advertisements within the feed
- Maximum of one ad per ten posts
- Support for ad content, images, and external links

#### Technical Details
- Ad placement algorithm in feed component
- Separate API endpoints for ad retrieval
- Ad priority system for targeting

### 7. Analytics

#### Requirements
- Data visualization for user and content metrics
- Charts for follower growth, post engagement, impressions
- Content type distribution analytics
- Engagement rate calculations

#### Technical Details
- Recharts for data visualization components
- Aggregated data queries for metrics
- Responsive chart layouts

### 8. Messaging

#### Requirements
- Private messaging between users
- Conversation list
- Real-time message status (read/unread)
- Message search functionality

#### Technical Details
- Conversation-based UI with sender/recipient models
- Timestamp formatting with date-fns
- Optimistic UI updates for message sending

### 9. Notifications

#### Requirements
- Notification center for user activities
- Support for various notification types:
  - Likes
  - Comments
  - Follows
  - Mentions
  - Messages
- Ability to mark notifications as read

#### Technical Details
- Notification model with polymorphic relationships
- Read/unread state tracking
- Automatic notification generation for relevant actions

### 10. Responsive Design

#### Requirements
- Desktop and mobile-friendly layouts
- Automatic sidebar collapse on smaller screens
- Footer navigation bar when sidebar is hidden
- Responsive post cards and feed layout

#### Technical Details
- Tailwind CSS for responsive design
- Media queries for specific adaptations
- Conditional rendering based on screen size

## Data Models

### Core Models
- User
- Post
- Comment
- Like
- Bookmark
- Follow
- Community
- Membership
- Message
- Notification
- Advertisement
- UserMetrics

### Key Relationships
- User-Post: One-to-many
- User-Comment: One-to-many
- User-Follow: Many-to-many (follower/following)
- User-Community: Many-to-many (via Membership)
- User-Message: One-to-many (sender/recipient)
- User-Notification: One-to-many

## API Endpoints

### Authentication
- `/api/auth/signin`
- `/api/auth/signup`
- `/api/auth/signout`

### Posts
- `/api/posts` - CRUD operations
- `/api/posts/for-you` - Curated feed
- `/api/posts/following` - Following feed
- `/api/posts/[id]/like` - Like/unlike
- `/api/posts/[id]/bookmark` - Bookmark/unbookmark
- `/api/posts/[id]/comment` - Comments

### Communities
- `/api/communities` - CRUD operations
- `/api/communities/[id]/posts` - Community posts
- `/api/communities/user` - User's communities

### Users
- `/api/users/[id]` - User details
- `/api/users/[id]/follow` - Follow/unfollow
- `/api/users/[id]/follow-counts` - Follower/following counts

### Messages
- `/api/messages` - Create message
- `/api/messages/[userId]` - Get conversation
- `/api/messages/conversations` - Get all conversations

### Notifications
- `/api/notifications` - Get notifications
- `/api/notifications/mark-read` - Mark as read

### Ads
- `/api/ads` - Get advertisements

## Technical Constraints

### File Structure & Organization
- Maximum file length: 200 lines
- Maximum line length: 130 characters
- Component-based architecture with clear separation of concerns
- Context-based state management
- Custom hooks for reusable logic

### Performance Considerations
- Lazy loading for images
- Pagination and infinite scrolling for feeds
- Optimistic updates for user interactions
- Efficient re-rendering with proper React practices

### Security Measures
- JWT-based authentication
- CSRF protection
- Input validation with Zod
- Secure password storage with bcrypt

### Accessibility
- Semantic HTML
- ARIA attributes where necessary
- Keyboard navigation support
- Responsive design for all screen sizes

## Future Considerations

### Scalability
- Migration to a more scalable database like PostgreSQL
- Implementing Redis for caching
- API rate limiting

### Feature Expansion
- Direct messaging with real-time capabilities via WebSockets
- Content discovery algorithm improvements
- Media support expansion (video, audio)
- Advanced analytics and insights

### Performance Optimizations
- Server-side rendering optimizations
- Bundle size reduction
- Image optimization

## Deployment Considerations

### Environment Variables
- Database connection strings
- OAuth provider credentials
- API keys for external services

### Build Process
- TypeScript compilation
- Tailwind CSS optimizations
- Bundle analysis

### CI/CD Pipeline
- ESLint checks
- Type checking
- Automated testing
- Deployment to hosting platform