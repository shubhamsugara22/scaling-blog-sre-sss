# DevOps & SRE Blog

A modern blog platform built with Next.js 14, featuring interactive elements like likes, comments, and newsletter subscriptions.

## Features

- 📝 **Blog Post Editor** - Create and publish posts through a web interface with live markdown preview
- ❤️ **Like System** - Readers can like posts with persistent storage
- 💬 **Comments** - Interactive comment system for reader engagement
- 📧 **Newsletter Subscription** - Email subscription for blog updates
- 🔐 **Authentication** - Secure admin access with NextAuth.js
- 🎨 **Modern UI** - Built with Tailwind CSS and dark mode support
- ⚡ **Fast & Responsive** - Server-side rendering with Next.js 14

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Authentication**: NextAuth.js v5
- **Markdown**: remark, remark-html
- **Validation**: Zod
- **Testing**: Jest, fast-check (property-based testing)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd devops-sre-blog
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add:
```env
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
```

4. Initialize the database and create admin user:
```bash
npm run seed:admin
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your blog.

## Usage

### Creating Blog Posts

1. Navigate to `/login` and sign in with your admin credentials
2. Go to `/admin/editor` to access the post editor
3. Write your post in Markdown with live preview
4. Add title, tags, and summary
5. Click "Publish Post" to save

### Managing Content

- **Blog Posts**: Stored as markdown files in `content/blog/`
- **TIL Posts**: Stored in `content/til/`
- **Database**: SQLite database (`blog.db`) stores likes, comments, and subscribers

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin routes (protected)
│   ├── api/               # API routes
│   └── blog/              # Blog post pages
├── components/            # React components
├── lib/                   # Utility functions and services
│   ├── db.ts             # Database initialization
│   ├── likes.ts          # Like system
│   ├── comments.ts       # Comment system
│   ├── subscribers.ts    # Subscription system
│   └── auth.ts           # Authentication
├── content/              # Markdown content
│   ├── blog/            # Blog posts
│   └── til/             # Today I Learned posts
└── __tests__/           # Test files
```

## API Endpoints

- `POST /api/likes` - Toggle like on a post
- `GET /api/comments?postSlug={slug}` - Get comments for a post
- `POST /api/comments` - Create a new comment
- `POST /api/subscribe` - Subscribe to newsletter

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run seed:admin` - Create admin user

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own blog!
