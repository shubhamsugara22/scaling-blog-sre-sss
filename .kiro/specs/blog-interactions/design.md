# Design Document

## Overview

This design document describes the architecture and implementation approach for adding interactive features to the blog platform. The system will extend the existing Next.js blog with capabilities for creating posts through a web interface, liking posts, commenting, and subscribing to updates. The design leverages Next.js 14 App Router features including Server Actions, API Routes, and React Server Components.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Post Editor  │  │ Like Button  │  │   Comments   │      │
│  │  Component   │  │  Component   │  │   Component  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Server Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Server Actions│  │  API Routes  │  │   Database   │      │
│  │              │  │              │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  SQLite DB   │  │  Markdown    │  │    File      │      │
│  │              │  │    Files     │  │   System     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 18, Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: SQLite with better-sqlite3 (lightweight, serverless-friendly)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Markdown**: gray-matter, remark, remark-html (existing)
- **Validation**: Zod for schema validation

## Components and Interfaces

### 1. Post Editor Component

**Location**: `app/admin/editor/page.tsx`

**Purpose**: Provides a web interface for creating and editing blog posts

**Key Features**:
- Markdown editor with syntax highlighting
- Live preview pane
- Form fields for title, tags, summary
- Auto-slug generation
- Save and publish actions

**Interface**:
```typescript
interface PostEditorProps {
  initialData?: {
    title: string;
    content: string;
    tags: string[];
    summary: string;
  };
}
```

### 2. Like Button Component

**Location**: `components/LikeButton.tsx`

**Purpose**: Displays like count and allows users to like/unlike posts

**Key Features**:
- Displays current like count
- Toggles like state on click
- Optimistic UI updates
- Persists state to localStorage for anonymous users

**Interface**:
```typescript
interface LikeButtonProps {
  postSlug: string;
  initialLikes: number;
}
```

### 3. Comments Component

**Location**: `components/Comments.tsx`

**Purpose**: Displays comments and provides interface for adding new comments

**Key Features**:
- List of existing comments
- Comment form with name and text fields
- Real-time comment submission
- Chronological ordering

**Interface**:
```typescript
interface CommentsProps {
  postSlug: string;
  initialComments: Comment[];
}

interface Comment {
  id: string;
  postSlug: string;
  authorName: string;
  content: string;
  createdAt: string;
}
```

### 4. Subscribe Component

**Location**: `components/Subscribe.tsx`

**Purpose**: Allows users to subscribe to blog updates

**Key Features**:
- Email input with validation
- Success/error feedback
- Duplicate subscription handling

**Interface**:
```typescript
interface SubscribeProps {
  variant?: 'inline' | 'modal';
}
```

## Data Models

### Database Schema

```sql
-- Likes table
CREATE TABLE likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_slug)
);

-- Comments table
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_post_slug (post_slug)
);

-- Subscribers table
CREATE TABLE subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1
);

-- Users table (for authentication)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'author',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### TypeScript Types

```typescript
// lib/types.ts
export interface Like {
  id: number;
  postSlug: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postSlug: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Subscriber {
  id: number;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

export interface PostFormData {
  title: string;
  content: string;
  tags: string[];
  summary: string;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to avoid redundancy:

- Properties 1.3, 1.4, and 1.5 all relate to post creation and can be combined into a comprehensive "post creation preserves required fields" property
- Properties 2.2 and 2.3 describe like toggle behavior and can be combined into a single "like toggle round-trip" property
- Properties 6.2 and 6.3 both test persistence and retrieval, which can be combined into a "data persistence round-trip" property
- Properties 7.1, 7.2, 7.3, and 7.4 all test API endpoints and can be grouped as specific instances of API correctness

### Post Editor Properties

Property 1: Markdown preview consistency
*For any* valid markdown string entered in the editor, the preview pane should render HTML that contains the expected structural elements from the markdown
**Validates: Requirements 1.2**

Property 2: Post creation completeness
*For any* valid post submission with title, content, tags, and summary, the saved markdown file should contain all provided fields plus an auto-generated slug and current date
**Validates: Requirements 1.3, 1.4, 1.5**

### Like System Properties

Property 3: Like toggle round-trip
*For any* post with an initial like count N, liking then unliking should result in the count returning to N
**Validates: Requirements 2.2, 2.3**

Property 4: Like persistence
*For any* post, after incrementing the like count, querying the storage should return the incremented value
**Validates: Requirements 2.4**

Property 5: Like button state reflects data
*For any* post that has been liked by the current user, the like button should display in an active visual state
**Validates: Requirements 2.5**

### Comments System Properties

Property 6: All comments displayed
*For any* post with N comments in storage, the comments component should display exactly N comments
**Validates: Requirements 3.1**

Property 7: Comment form validation
*For any* comment form with non-empty name and content fields, the submit button should be enabled
**Validates: Requirements 3.2**

Property 8: Comment creation completeness
*For any* submitted comment with author name and content, the saved comment should include both fields plus a timestamp
**Validates: Requirements 3.3**

Property 9: Comment immediate visibility
*For any* newly submitted comment, it should appear in the comment list without requiring a page refresh
**Validates: Requirements 3.4**

Property 10: Comment chronological ordering
*For any* set of comments on a post, they should be displayed in descending order by creation timestamp (newest first)
**Validates: Requirements 3.5**

### Subscription Properties

Property 11: Valid email subscription
*For any* valid email address format, submitting the subscription form should save the email to storage
**Validates: Requirements 4.3**

Property 12: Invalid email rejection
*For any* string that does not match valid email format, the subscription form should display an error and prevent submission
**Validates: Requirements 4.4**

Property 13: Duplicate subscription handling
*For any* email address that already exists in the subscribers table, attempting to subscribe again should display a confirmation message instead of creating a duplicate entry
**Validates: Requirements 4.5**

### Authentication Properties

Property 14: Editor access requires authentication
*For any* request to access the post editor route, an unauthenticated user should be redirected to the login page
**Validates: Requirements 5.1, 5.2**

Property 15: Valid credentials grant access
*For any* user with valid credentials in the database, successful authentication should grant access to the post editor
**Validates: Requirements 5.3**

Property 16: Invalid credentials deny access
*For any* authentication attempt with credentials not matching the database, access should be denied with an error message
**Validates: Requirements 5.4**

### Data Persistence Properties

Property 17: Interaction data persistence round-trip
*For any* interaction data (like, comment, or subscription) written to the database, immediately reading it back should return equivalent data
**Validates: Requirements 6.2, 6.3**

Property 18: Database error handling
*For any* database operation that fails, the system should log the error and return an appropriate error response to the client
**Validates: Requirements 6.4**

Property 19: Post data loading completeness
*For any* post slug, loading the post page should retrieve and display all associated likes and comments from the database
**Validates: Requirements 6.5**

### API Endpoint Properties

Property 20: Like API toggle behavior
*For any* valid POST request to the likes endpoint with a post slug, the like count should toggle (increment if not liked, decrement if liked)
**Validates: Requirements 7.1**

Property 21: Comments API retrieval
*For any* GET request to the comments endpoint with a valid post slug, the response should contain all comments for that post
**Validates: Requirements 7.2**

Property 22: Comment API creation round-trip
*For any* valid POST request to the comments endpoint, the response should contain the created comment with all submitted fields plus generated fields (id, timestamp)
**Validates: Requirements 7.3**

Property 23: Subscribe API success
*For any* valid POST request to the subscribe endpoint with a valid email, the email should be saved and a success response returned
**Validates: Requirements 7.4**

Property 24: API invalid data handling
*For any* API request with invalid or malformed data, the response should have a 400 status code and include error details
**Validates: Requirements 7.5**

## Error Handling

### Client-Side Error Handling

1. **Form Validation Errors**
   - Display inline error messages for invalid inputs
   - Prevent form submission until validation passes
   - Use Zod schemas for consistent validation

2. **Network Errors**
   - Display user-friendly error messages for failed requests
   - Implement retry logic for transient failures
   - Show loading states during async operations

3. **Optimistic UI Rollback**
   - For likes and comments, optimistically update UI
   - Roll back changes if server request fails
   - Display error toast notifications

### Server-Side Error Handling

1. **Database Errors**
   - Log all database errors with context
   - Return appropriate HTTP status codes (500 for server errors)
   - Implement connection retry logic

2. **Validation Errors**
   - Use Zod to validate all incoming data
   - Return 400 status with detailed error messages
   - Sanitize error messages before sending to client

3. **Authentication Errors**
   - Return 401 for unauthenticated requests
   - Return 403 for unauthorized access attempts
   - Implement rate limiting for login attempts

4. **File System Errors**
   - Handle file write failures gracefully
   - Validate file paths to prevent directory traversal
   - Ensure atomic file operations

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

- **Post Editor**: Test slug generation with special characters, empty titles, very long titles
- **Like Button**: Test initial state, single click, double click, network failure scenarios
- **Comments**: Test empty comment rejection, very long comments, special characters in names
- **Subscribe**: Test email validation with various formats, duplicate detection
- **Authentication**: Test login with correct/incorrect credentials, session expiry
- **Database**: Test connection initialization, query execution, error scenarios

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript/TypeScript property-based testing library).

**Configuration**:
- Each property test should run a minimum of 100 iterations
- Use custom generators for domain-specific data (emails, markdown, slugs)
- Tag each test with the format: `**Feature: blog-interactions, Property {number}: {property_text}**`

**Test Organization**:
- Group tests by component/feature area
- Each correctness property maps to exactly one property-based test
- Use descriptive test names that reference the property number

**Example Test Structure**:
```typescript
// __tests__/post-editor.property.test.ts
import fc from 'fast-check';

describe('Post Editor Properties', () => {
  test('Property 2: Post creation completeness', () => {
    /**
     * Feature: blog-interactions, Property 2: Post creation completeness
     * For any valid post submission, the saved file should contain all fields
     */
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 200 }),
          content: fc.string({ minLength: 1 }),
          tags: fc.array(fc.string(), { maxLength: 10 }),
          summary: fc.string({ maxLength: 500 })
        }),
        async (postData) => {
          // Test implementation
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

Integration tests will verify end-to-end workflows:

- Complete post creation flow from editor to file system
- Like button interaction with database persistence
- Comment submission and retrieval flow
- Subscribe flow with email validation and storage
- Authentication flow from login to editor access

### Testing Tools

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **fast-check**: Property-based testing
- **MSW (Mock Service Worker)**: API mocking for client-side tests
- **Supertest**: API endpoint testing

## Implementation Notes

### Database Choice Rationale

SQLite was chosen for the following reasons:
- **Serverless-friendly**: No separate database server required
- **Zero configuration**: Works out of the box with better-sqlite3
- **Sufficient for blog scale**: Handles thousands of interactions easily
- **ACID compliance**: Ensures data integrity
- **Easy backup**: Single file database

### Authentication Approach

NextAuth.js v5 (Auth.js) provides:
- Built-in session management
- Secure password hashing with bcrypt
- CSRF protection
- Easy integration with Next.js App Router
- Extensible for future OAuth providers

### File System Operations

Post creation will:
- Generate slugs using a sanitization function (lowercase, replace spaces with hyphens, remove special chars)
- Write markdown files atomically to prevent corruption
- Validate file paths to prevent directory traversal attacks
- Use gray-matter to serialize frontmatter consistently

### Performance Considerations

1. **Database Indexing**: Index post_slug columns for fast lookups
2. **Caching**: Use Next.js caching for static post content
3. **Optimistic Updates**: Update UI immediately, sync with server asynchronously
4. **Pagination**: Implement comment pagination for posts with many comments
5. **Rate Limiting**: Prevent abuse of like/comment/subscribe endpoints

### Security Considerations

1. **Input Sanitization**: Sanitize all user inputs to prevent XSS
2. **SQL Injection Prevention**: Use parameterized queries
3. **CSRF Protection**: Leverage Next.js built-in CSRF protection
4. **Rate Limiting**: Implement rate limiting on all POST endpoints
5. **Email Validation**: Validate email format and check for disposable email domains
6. **Authentication**: Secure password storage with bcrypt, implement session expiry
7. **Authorization**: Verify user roles before allowing post creation

## API Endpoints

### POST /api/likes

**Request**:
```typescript
{
  postSlug: string;
}
```

**Response**:
```typescript
{
  postSlug: string;
  count: number;
  liked: boolean;
}
```

### GET /api/comments?postSlug={slug}

**Response**:
```typescript
{
  comments: Array<{
    id: number;
    authorName: string;
    content: string;
    createdAt: string;
  }>;
}
```

### POST /api/comments

**Request**:
```typescript
{
  postSlug: string;
  authorName: string;
  content: string;
}
```

**Response**:
```typescript
{
  id: number;
  postSlug: string;
  authorName: string;
  content: string;
  createdAt: string;
}
```

### POST /api/subscribe

**Request**:
```typescript
{
  email: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

### POST /api/posts (Server Action)

**Request**:
```typescript
{
  title: string;
  content: string;
  tags: string[];
  summary: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  slug: string;
  message: string;
}
```
