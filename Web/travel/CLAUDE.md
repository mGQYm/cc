# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TripCraft** is a Next.js-based travel route planning platform that helps users create, edit, and share personalized travel itineraries. The platform features AI-powered route generation, drag-and-drop timeline editing, real-time collaboration, and social sharing capabilities.

## Technology Stack

- **Frontend**: Next.js 15.4.6 (App Router), React 19.1.0, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: NextAuth.js with Google/GitHub OAuth
- **Maps**: AMap (高德地图) API integration
- **Deployment**: Vercel (optimized for serverless)
- **Development**: ESLint, PostCSS, Turbopack

## Project Structure

```
tripcraft/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/[...nextauth]/    # Authentication
│   │   │   ├── generate/              # Route generation
│   │   │   ├── routes/                # CRUD operations
│   │   │   ├── share/                 # Sharing functionality
│   │   │   └── spots/                 # POI management
│   │   ├── auth/signin/       # Login page
│   │   ├── editor/            # Route editor page
│   │   ├── my-routes/         # User routes dashboard
│   │   ├── share/[token]/     # Public route sharing
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── DestinationInput.tsx    # Location search
│   │   ├── MapPreview.tsx          # Interactive map
│   │   ├── PreferencesSelector.tsx # User preferences
│   │   ├── RouteCard.tsx           # Route display card
│   │   ├── RouteToolbar.tsx        # Save/share actions
│   │   ├── SpotLibrary.tsx         # POI library
│   │   └── TimelineEditor.tsx      # Drag-drop editor
│   ├── lib/                   # Core business logic
│   │   ├── api.ts             # API client utilities
│   │   ├── auth.ts            # Authentication helpers
│   │   ├── map-service.ts     # Map integration
│   │   ├── route-generator.ts # AI route generation
│   │   └── supabase.ts        # Database client
│   └── types/                 # TypeScript definitions
├── supabase/
│   └── schema.sql            # Database schema & sample data
└── scripts/
    └── seed-database.ts      # Data seeding utilities
```

## Key Commands

### Development
```bash
# Start MVP (from project root)
./start-mvp.sh                    # One-click start with remote access

# Manual development
npm run dev                       # Start dev server (localhost:3000)
npm run build                     # Build for production
npm run start                     # Start production server
npm run lint                      # Run ESLint
```

### Database Management
```bash
# Apply database schema
psql -h your-supabase-host -d postgres -f tripcraft/supabase/schema.sql

# Seed sample data (included in schema.sql)
# Popular destinations: 厦门, 北京, 上海 with real POI data
```

### Environment Setup
Create `.env.local` in tripcraft/ directory:
```bash
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Core Functionality

### Route Generation
- **Endpoint**: `POST /api/generate`
- **Input**: `{ location, days, interests, budgetLevel }`
- **Algorithm**: Rule-based matching with location clustering
- **Output**: 3 optimized route options

### Route Management
- **CRUD Operations**: Full REST API for routes
- **Authentication**: JWT-based with RLS policies
- **Sharing**: Auto-generated 8-character share tokens
- **Real-time**: Optimistic updates with Supabase

### Map Integration
- **Service**: AMap (高德地图) API
- **Features**: Interactive markers, route drawing, location search
- **Caching**: CDN + Redis for POI data
- **Fallback**: Local mock data for development

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/generate | Generate travel routes |
| GET | /api/routes | Get user's routes |
| POST | /api/routes | Create new route |
| GET | /api/routes/[id] | Get specific route |
| PUT | /api/routes/[id] | Update route |
| DELETE | /api/routes/[id] | Delete route |
| POST | /api/routes/[id]/share | Generate share link |
| GET | /api/share/[token] | Access shared route |

## Database Schema

### Key Tables
- **users**: OAuth user profiles
- **routes**: Travel itineraries with JSONB days structure
- **spots**: Point of interest database
- **route_spots**: Junction table for route-spot relationships
- **user_favorites**: User bookmarked routes

### Security Features
- RLS policies protect user data
- Share tokens provide limited public access
- Auto-generated timestamps with triggers
- Optimized indexes for performance

## Development Workflow

### 1. Initial Setup
```bash
git clone <repository>
cd tripcraft
npm install
cp .env.local.example .env.local
# Configure environment variables
npm run dev
```

### 2. Testing Checklist
- [ ] User registration/login flow
- [ ] Route generation with popular cities
- [ ] Route saving and editing
- [ ] Share functionality
- [ ] Responsive design on mobile

### 3. Performance Optimizations
- **CDN**: Cloudflare for static assets
- **Caching**: Redis for API responses
- **Images**: WebP format with lazy loading
- **Database**: Indexed queries and connection pooling

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Configure environment variables
3. Deploy with zero configuration
4. Enable automatic HTTPS

### Self-hosted
```bash
npm run build
# Deploy .next/ directory to your hosting provider
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Check Supabase URL and keys
2. **OAuth Issues**: Verify redirect URLs in provider settings
3. **Map Loading**: Ensure AMap API key is configured
4. **CORS**: Check NEXT_PUBLIC_BASE_URL matches deployment

### Debug Mode
```bash
DEBUG=tripcraft:* npm run dev
```

## Architecture Notes

### Scalability Strategy
- **Phase 1**: Serverless (current) - 0-1000 users
- **Phase 2**: Vercel Pro + Redis - 1K-10K users
- **Phase 3**: Kubernetes + CDN - 10K+ users

### Cost Optimization
- Free tier maximization (Supabase, Vercel, Cloudflare)
- Cache-first strategies
- Image optimization
- API call batching

## Testing Data

### Sample Locations for Testing
- 厦门 (Xiamen):鼓浪屿, 厦门大学, 南普陀寺
- 北京 (Beijing):故宫, 天安门, 颐和园, 长城
- 上海 (Shanghai):外滩, 东方明珠, 豫园, 迪士尼

### Test User Flow
1. Visit http://localhost:3000
2. Select "厦门" as destination
3. Choose 3 days, interests: ["美食", "摄影"]
4. Generate and select a route
5. Save and share the route