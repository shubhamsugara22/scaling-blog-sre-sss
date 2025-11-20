# Implementation Plan

- [ ] 1. Set up database and core infrastructure
  - [x] 1.1 Install dependencies (better-sqlite3, next-auth, zod, fast-check)


    - Install better-sqlite3 for SQLite database
    - Install @auth/core and next-auth for authentication
    - Install zod for schema validation
    - Install fast-check for property-based testing
    - Install @types packages for TypeScript support
    - _Requirements: 6.1, 5.1_



  - [ ] 1.2 Create database schema and initialization
    - Create database schema file with tables for likes, comments, subscribers, and users
    - Write database initialization function to create tables if they don't exist


    - Create database connection utility with error handling
    - _Requirements: 6.1, 6.4_



  - [ ] 1.3 Write property test for database initialization
    - **Property: Database initialization creates required tables**
    - **Validates: Requirements 6.1**



  - [ ] 1.4 Create TypeScript types and Zod schemas
    - Define TypeScript interfaces for Like, Comment, Subscriber, User, PostFormData


    - Create Zod validation schemas for API request/response types
    - Create type guards and utility types
    - _Requirements: 7.5_

  - [x] 1.5 Write property test for schema validation


    - **Property 24: API invalid data handling**
    - **Validates: Requirements 7.5**

- [ ] 2. Implement authentication system
  - [x] 2.1 Set up NextAuth.js configuration


    - Create auth.ts configuration file with credentials provider
    - Configure session strategy and callbacks
    - Set up environment variables for auth secrets
    - Create initial admin user seed script


    - _Requirements: 5.1, 5.3, 5.4_

  - [ ] 2.2 Create login page and components
    - Build login page UI with email and password fields
    - Implement form validation with Zod


    - Add error message display for failed login attempts
    - Style with Tailwind CSS to match existing design
    - _Requirements: 5.2, 5.4_

  - [x] 2.3 Implement authentication middleware


    - Create middleware to protect /admin routes
    - Implement redirect logic for unauthenticated users
    - Add session validation
    - _Requirements: 5.1, 5.2, 5.5_



  - [ ] 2.4 Write property tests for authentication
    - **Property 14: Editor access requires authentication**


    - **Property 15: Valid credentials grant access**
    - **Property 16: Invalid credentials deny access**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 3. Build post editor interface


  - [ ] 3.1 Create post editor page component
    - Build editor page at /admin/editor with form fields
    - Implement markdown textarea with syntax highlighting
    - Add fields for title, tags (as comma-separated), and summary
    - Create save/publish button with loading states
    - _Requirements: 1.1_



  - [x] 3.2 Implement live markdown preview

    - Create preview pane component that renders markdown to HTML
    - Use remark and remark-html for markdown processing
    - Update preview in real-time as user types


    - Style preview to match blog post styling
    - _Requirements: 1.2_

  - [ ] 3.3 Write property test for markdown preview
    - **Property 1: Markdown preview consistency**


    - **Validates: Requirements 1.2**

  - [x] 3.4 Implement slug generation utility


    - Create function to generate URL-safe slugs from titles
    - Handle special characters, spaces, and unicode
    - Ensure slugs are lowercase and hyphenated
    - Add uniqueness check against existing posts
    - _Requirements: 1.4_



  - [x] 3.5 Create post save server action


    - Implement server action to save post as markdown file
    - Generate slug from title
    - Add current date to frontmatter
    - Write file to content/blog directory using fs
    - Validate all required fields are present
    - _Requirements: 1.3, 1.4, 1.5_



  - [ ] 3.6 Write property test for post creation
    - **Property 2: Post creation completeness**



    - **Validates: Requirements 1.3, 1.4, 1.5**

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.



- [ ] 5. Implement like system
  - [ ] 5.1 Create database service for likes
    - Implement getLikeCount function to query likes table
    - Implement toggleLike function to increment/decrement likes
    - Add error handling and logging


    - Use parameterized queries to prevent SQL injection
    - _Requirements: 2.2, 2.3, 2.4, 6.2, 6.3_

  - [ ] 5.2 Write property tests for like persistence
    - **Property 3: Like toggle round-trip**


    - **Property 4: Like persistence**
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [ ] 5.3 Create like API endpoint
    - Implement POST /api/likes route handler


    - Validate request body with Zod
    - Call database service to toggle like
    - Return updated like count and liked status


    - _Requirements: 7.1_

  - [ ] 5.4 Write property test for like API
    - **Property 20: Like API toggle behavior**
    - **Validates: Requirements 7.1**



  - [ ] 5.5 Build LikeButton component
    - Create client component with like button UI

    - Display current like count
    - Implement optimistic UI updates
    - Handle click events to call API
    - Store liked state in localStorage for anonymous users
    - Show active state when post is liked
    - _Requirements: 2.1, 2.2, 2.3, 2.5_



  - [ ] 5.6 Write property test for like button state
    - **Property 5: Like button state reflects data**


    - **Validates: Requirements 2.5**

  - [ ] 5.7 Integrate LikeButton into blog post page
    - Add LikeButton component to app/blog/[slug]/page.tsx
    - Fetch initial like count from database

    - Pass postSlug and initialLikes as props
    - Position button appropriately in the layout
    - _Requirements: 2.1, 6.5_



- [ ] 6. Implement comments system
  - [ ] 6.1 Create database service for comments
    - Implement getComments function to fetch comments by post slug
    - Implement createComment function to insert new comments


    - Add sorting by createdAt descending
    - Include error handling and validation
    - _Requirements: 3.1, 3.3, 3.5, 6.2, 6.3_



  - [ ] 6.2 Write property tests for comments persistence
    - **Property 6: All comments displayed**
    - **Property 8: Comment creation completeness**
    - **Property 10: Comment chronological ordering**
    - **Property 17: Interaction data persistence round-trip**
    - **Validates: Requirements 3.1, 3.3, 3.5, 6.2, 6.3**



  - [x] 6.3 Create comments API endpoints



    - Implement GET /api/comments route to fetch comments
    - Implement POST /api/comments route to create comments
    - Validate request data with Zod schemas
    - Return appropriate status codes and error messages
    - _Requirements: 7.2, 7.3_



  - [ ] 6.4 Write property tests for comments API
    - **Property 21: Comments API retrieval**
    - **Property 22: Comment API creation round-trip**
    - **Validates: Requirements 7.2, 7.3**

  - [x] 6.5 Build Comments component


    - Create client component to display comment list
    - Implement comment form with name and content fields
    - Add form validation (non-empty fields)
    - Enable/disable submit button based on validation


    - Show loading state during submission
    - _Requirements: 3.1, 3.2_



  - [ ] 6.6 Write property test for comment form validation
    - **Property 7: Comment form validation**
    - **Validates: Requirements 3.2**


  - [ ] 6.7 Implement comment submission logic
    - Handle form submission in Comments component
    - Call POST /api/comments endpoint
    - Optimistically add comment to UI
    - Update comment list on successful submission
    - Handle errors and show error messages

    - _Requirements: 3.3, 3.4_

  - [ ] 6.8 Write property test for comment immediate visibility
    - **Property 9: Comment immediate visibility**
    - **Validates: Requirements 3.4**



  - [ ] 6.9 Integrate Comments into blog post page
    - Add Comments component to app/blog/[slug]/page.tsx



    - Fetch initial comments from database
    - Pass postSlug and initialComments as props
    - Position below post content
    - _Requirements: 3.1, 6.5_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement subscription system
  - [ ] 8.1 Create database service for subscribers
    - Implement addSubscriber function to insert email
    - Implement checkSubscriber function to check for duplicates
    - Add email format validation
    - Include error handling for database operations
    - _Requirements: 4.3, 4.5, 6.2_

  - [ ] 8.2 Write property tests for subscription
    - **Property 11: Valid email subscription**
    - **Property 12: Invalid email rejection**
    - **Property 13: Duplicate subscription handling**
    - **Validates: Requirements 4.3, 4.4, 4.5**

  - [ ] 8.3 Create subscribe API endpoint
    - Implement POST /api/subscribe route handler
    - Validate email format with Zod
    - Check for existing subscription
    - Call database service to add subscriber
    - Return success/error response
    - _Requirements: 7.4_

  - [ ] 8.4 Write property test for subscribe API
    - **Property 23: Subscribe API success**
    - **Validates: Requirements 7.4**

  - [ ] 8.5 Build Subscribe component
    - Create component with subscribe button and form
    - Implement modal or inline form variant
    - Add email input with validation
    - Show success message after subscription
    - Handle duplicate subscription gracefully
    - Display error messages for invalid emails
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 8.6 Integrate Subscribe component into layout
    - Add Subscribe component to app/layout.tsx or Header
    - Position in prominent location (header or footer)
    - Ensure it's visible on all pages
    - Style to match existing design
    - _Requirements: 4.1_

- [ ] 9. Add error handling and logging
  - [ ] 9.1 Implement error logging utility
    - Create centralized error logging function
    - Log errors with context (timestamp, user, action)
    - Write logs to file or console based on environment
    - _Requirements: 6.4_

  - [ ] 9.2 Write property test for error handling
    - **Property 18: Database error handling**
    - **Validates: Requirements 6.4**

  - [ ] 9.3 Add error boundaries to components
    - Wrap interactive components in error boundaries
    - Display user-friendly error messages
    - Implement fallback UI for component errors
    - Log errors for debugging

  - [ ] 9.4 Implement API error responses
    - Ensure all API routes return consistent error format
    - Use appropriate HTTP status codes
    - Include error messages in response body
    - Sanitize error messages to avoid leaking sensitive info
    - _Requirements: 7.5_

- [ ] 10. Implement data loading and integration
  - [ ] 10.1 Update blog post page to load interaction data
    - Fetch likes count for the post
    - Fetch comments for the post
    - Pass data to LikeButton and Comments components
    - Handle loading states
    - _Requirements: 6.5_

  - [ ] 10.2 Write property test for post data loading
    - **Property 19: Post data loading completeness**
    - **Validates: Requirements 6.5**

  - [ ] 10.3 Add loading and error states to components
    - Implement skeleton loaders for comments and likes
    - Show loading spinners during API calls
    - Display error messages when data fails to load
    - Add retry buttons for failed requests

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Polish and optimization
  - [ ] 12.1 Add rate limiting to API endpoints
    - Implement rate limiting middleware
    - Apply to POST endpoints (likes, comments, subscribe)
    - Return 429 status when rate limit exceeded
    - Configure reasonable limits (e.g., 10 requests per minute)

  - [ ] 12.2 Optimize database queries
    - Add indexes to post_slug columns
    - Implement connection pooling if needed
    - Add query result caching where appropriate

  - [ ] 12.3 Improve UI/UX
    - Add animations for like button
    - Implement toast notifications for success/error messages
    - Add keyboard shortcuts for editor
    - Improve mobile responsiveness
    - Add loading skeletons

  - [ ] 12.4 Add accessibility features
    - Ensure all interactive elements are keyboard accessible
    - Add ARIA labels to buttons and forms
    - Test with screen readers
    - Ensure proper focus management
