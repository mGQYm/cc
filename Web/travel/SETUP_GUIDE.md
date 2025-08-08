# TripCraft MVP Setup Guide

## Quick Start

This guide will help you complete the remaining MVP tasks for TripCraft, a travel route planning platform.

## ✅ Completed Tasks

### Authentication System
- ✅ NextAuth.js configured with Supabase adapter
- ✅ Google and GitHub OAuth providers setup
- ✅ Signin/signup pages created
- ✅ User profile management integrated
- ✅ Authentication connected to route creation

### Database Setup
- ✅ Supabase client configuration completed
- ✅ Database schema created
- ✅ Database seeding script ready
- ✅ Environment variables template created

## 🔄 Next Steps (Ready to Continue)

### 1. Database Migration (db-2)
**Status**: Pending - Ready to implement

**Task**: Replace mock data with real Supabase data

**Files to modify**:
- `src/lib/route-generator.ts` - Replace MOCK_SPOTS with database calls
- `src/app/page.tsx` - Update route generation to use API
- `src/components/SpotLibrary.tsx` - Load spots from database

**Implementation**:
```typescript
// Replace MOCK_SPOTS with:
const spots = await db.getSpotsByLocation(location);
```

### 2. Database Connection Testing (db-5)
**Status**: Pending - Ready to test

**Commands to run**:
```bash
cd tripcraft
npm run db:seed    # Seed database with sample data
npm run build      # Test build with new configuration
npm run dev        # Start development server
```

### 3. API Routes Creation
**New files needed**:
- `src/app/api/routes/route.ts` - GET/POST routes
- `src/app/api/spots/route.ts` - GET spots
- `src/app/api/routes/[id]/route.ts` - GET/PUT/DELETE specific route

### 4. Data Persistence
**Replace localStorage with database**:
- Update `handleSelectRoute` to save to database
- Create `useRoutes` hook for data management
- Implement auto-save functionality

## 🔧 Environment Setup

### Required Environment Variables
Copy `.env.local.example` to `.env.local` and fill in:

```bash
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Supabase Setup
1. Create new Supabase project
2. Run the schema from `supabase/schema.sql`
3. Run seeding script: `npm run db:seed`

## 📁 Key Files Structure

### Authentication
- `src/lib/auth.ts` - NextAuth.js configuration
- `src/app/api/auth/[...nextauth]/route.ts` - Auth API route
- `src/app/auth/signin/page.tsx` - Signin page
- `src/app/providers.tsx` - Session provider wrapper

### Database
- `src/lib/supabase.ts` - Supabase client configuration
- `scripts/seed-database.ts` - Database seeding script
- `supabase/schema.sql` - Database schema

### Components
- `src/app/page.tsx` - Homepage with auth integration
- `src/app/editor/page.tsx` - Route editor (needs auth protection)

## 🚀 Development Commands

```bash
# Install dependencies
cd tripcraft
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your keys

# Database operations
npm run db:seed        # Seed database
npm run db:reset       # Reset and reseed

# Development
npm run dev            # Start dev server
npm run build          # Build for production
npm run lint           # Run linter
```

## 📊 Testing Checklist

### Authentication Testing
- [ ] Google login works
- [ ] GitHub login works
- [ ] User session persists across page reloads
- [ ] Protected routes redirect to signin
- [ ] User profile displays correctly

### Database Testing
- [ ] Spots load correctly from database
- [ ] Routes can be created/saved
- [ ] User-specific routes work
- [ ] Public routes are accessible

## 📋 Migration Tasks

### Phase 1: Replace Mock Data
1. Update `RouteGenerator.generateRoutes()` to use database
2. Create API endpoint for route generation
3. Update homepage to use API instead of mock data

### Phase 2: User Routes
1. Create "My Routes" page
2. Implement route CRUD operations
3. Add route sharing functionality

### Phase 3: Production
1. Deploy to Vercel
2. Setup production environment variables
3. Configure custom domain

## 🔍 Code Review Points

### Security
- [ ] All API routes have proper authentication
- [ ] Database queries use RLS policies
- [ ] Environment variables are properly secured
- [ ] Input validation is implemented

### Performance
- [ ] Database queries are optimized
- [ ] Images are properly optimized
- [ ] Caching is implemented where appropriate

### User Experience
- [ ] Loading states are implemented
- [ ] Error handling is user-friendly
- [ ] Mobile responsiveness is tested
- [ ] Accessibility is considered

## 🆘 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check Supabase URL and keys
   - Ensure RLS policies are configured
   - Verify network connectivity

2. **Authentication not working**
   - Check OAuth provider settings
   - Verify redirect URLs in provider settings
   - Check NEXTAUTH_URL configuration

3. **Build fails**
   - Run `npm run lint` to check for errors
   - Check TypeScript compilation
   - Verify all environment variables are set

### Debug Commands
```bash
# Check database connection
npx supabase status

# Test authentication
npm run dev & open http://localhost:3000/auth/signin

# Check logs
npm run dev & open http://localhost:3000/api/auth/session
```

## 📞 Next Steps

1. **Complete database migration** (Priority: High)
2. **Test authentication flow** (Priority: High)
3. **Create API routes** (Priority: Medium)
4. **Add route sharing** (Priority: Medium)
5. **Deploy to production** (Priority: Low)

## 📞 Support

If you encounter issues:
1. Check the `todos.md` file for detailed task breakdown
2. Review the `TripCraft_Development_Document.md` for architecture details
3. Use the troubleshooting section above
4. Check environment variables and API keys

**Happy coding! 🚀**