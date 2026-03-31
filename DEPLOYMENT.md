# Vercel Deployment Guide

This project now uses a GitHub-only data backend (`data/db.json` and `uploads/` in your repository).

## Prerequisites

- Vercel account ([sign up](https://vercel.com/signup))
- GitHub account (your code should be on GitHub)
- Vercel Postgres database (included in Pro plan or can be added separately)

## Step 1: Configure GitHub Data Backend

Add these environment variables:

- `GITHUB_TOKEN` - Personal access token with `repo` permission
- `GITHUB_OWNER` - GitHub username or org
- `GITHUB_REPO` - Repository name used as datastore
- `GITHUB_BRANCH` - Branch to read/write (defaults to `main`)

## Step 2: Configure Environment Variables

### Option A: Using Vercel CLI

```bash
vercel env add DATABASE_URL
```

When prompted, paste your GitHub values.

### Option B: Using Vercel Dashboard

1. Go to your project in Vercel Dashboard
2. Click on **Settings** → **Environment Variables**
3. Add variables:
   - `GITHUB_TOKEN`
   - `GITHUB_OWNER`
   - `GITHUB_REPO`
   - `GITHUB_BRANCH` (optional)
4. Click **Save**

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel
```

### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `bun run build`
   - Output Directory: `.next`
   - Install Command: (leave empty for bun)
5. Add environment variables:
   - `DATABASE_URL` = Your Vercel Postgres connection string
6. Click **Deploy**

## Local Development (GitHub Data Backend)

If you want to use Vercel Postgres for local development:

1. Create `.env.local` file (this file is gitignored)
2. Add your GitHub backend config:
   ```
   GITHUB_TOKEN=ghp_xxx
   GITHUB_OWNER=your-user-or-org
   GITHUB_REPO=AnymeX-themes
   GITHUB_BRANCH=main
   ```

## Environment Variables

### Required

| Variable | Description | Example |
|-----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub token with repo write access | `ghp_xxx` |
| `GITHUB_OWNER` | GitHub user/org | `Shebyyy` |
| `GITHUB_REPO` | Repository used as datastore | `AnymeX-themes` |

### Optional

| Variable | Description | Default |
|-----------|-------------|----------|
| `GITHUB_BRANCH` | Branch for reads/writes | `main` |
| `NODE_ENV` | Environment | `production` (set by Vercel automatically) |

## Troubleshooting

### Database Connection Errors

**Error:** `PrismaClientInitializationError`

**Solution:**
- Check that `DATABASE_URL` is set correctly in Vercel Dashboard
- Ensure the database is created in Vercel Dashboard
- Verify the connection string is correct

### Migration Errors

**Error:** `P3014: The migration was not applied`

**Solution:**
```bash
# Reset and re-run migrations (development only)
bun run db:reset
bun run db:push
```

### Build Errors

**Error:** `Module not found: Can't resolve '@/lib/db'`

**Solution:**
- Ensure all imports are using the correct path aliases
- Check `tsconfig.json` paths configuration

### Runtime Errors

**Error:** `502 Bad Gateway`

**Solution:**
- Check server logs in Vercel Dashboard
- Verify database connection is working
- Ensure all environment variables are set

## Vercel-Specific Considerations

### Serverless Functions

Vercel uses serverless functions which have:
- **Maximum execution time:** 60 seconds
- **Cold starts:** First request may be slower
- **Memory limits:** Depends on plan

### Database Connection Pooling

Vercel Postgres uses connection pooling automatically. The connection string includes pooling parameters.

### Prisma Accelerate

For better performance, consider using Prisma Accelerate:

1. Create a Prisma Cloud account
2. Generate Accelerate connection string
3. Update `DATABASE_URL` to use Accelerate endpoint

## Monitoring

- **Vercel Dashboard:** View logs, deployments, and analytics
- **Vercel Postgres:** Monitor database connections and performance
- **Prisma Studio:** Visual database management (local only)

## Next Steps

After successful deployment:

1. Test your application at the Vercel URL
2. Verify database operations work (create theme, search, like)
3. Set up custom domain in Vercel Dashboard
4. Configure analytics (Vercel Analytics, Google Analytics, etc.)

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Documentation](https://www.prisma.io/docs)
