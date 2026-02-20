# AnymeX - Player Themes

A community-driven theme marketplace for the AnymeX media player. Discover, upload, and share custom visual themes to personalize your player experience.

## 🚀 Features

- **🎨 Theme Gallery** - Browse community-created themes with preview cards
- **🔍 Search & Filter** - Find themes by name, creator, or category
- **❤️ Like System** - Heart and favorite your favorite themes
- **📤 Drag & Drop Upload** - Easy JSON file upload with auto-fill
- **📊 Theme Stats** - Track likes and views for each theme
- **🏷️ Categories** - Dark, Light, and AMOLED themes
- **👥 Maintainers** - View project maintainers from GitHub
- **📚 Documentation** - Complete theme creation guide

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui
- **Database**: Prisma ORM with PostgreSQL (Vercel Postgres)
- **Icons**: Iconify React
- **State**: React hooks and state
- **UI Components**: shadcn/ui (Radix UI)

## 📋 Prerequisites

- Node.js 18+ or Bun 1.3+
- PostgreSQL database (Vercel Postgres recommended)
- GitHub account (for Vercel deployment)

## 🏃 Quick Start

### Local Development

```bash
# Install dependencies
bun install

# Set up database (SQLite for local)
bun run db:push

# Start development server
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Vercel deployment instructions.

## 🎨 Theme JSON Structure

```json
{
  "colors": {
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "background": "#171717",
    "foreground": "#fafafa",
    "card": "#262626",
    "border": "#404040"
  },
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "fontSize": {
      "small": "0.875rem",
      "medium": "1rem",
      "large": "1.25rem"
    }
  },
  "effects": {
    "blur": "8px",
    "shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    "borderRadius": "0.5rem"
  }
}
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Build for production (includes Prisma generate) |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema changes to database (development) |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:reset` | Reset database (development) |
| `bun run db:deploy` | Deploy database migrations (production) |

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|-----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |

## 📦 Database Models

- **Theme** - Theme metadata, JSON configuration, stats
- **ThemeLike** - User likes (unique per theme+user)
- **ThemeView** - Theme views (unique per theme+user)
- **User** - User accounts with username, password, role, and profile URL

## 🚢 API Endpoints

### Themes

- `GET /api/themes` - List/Search/Filter themes
- `POST /api/themes` - Create new theme

### Theme Actions

- `POST /api/themes/[id]/like` - Toggle like
- `POST /api/themes/[id]/view` - Track view

## 📚 Documentation

- [Theme Creation Guide](/docs) - How to create custom themes
- [Deployment Guide](./DEPLOYMENT.md) - Vercel deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

© 2024 AnymeX Inc. All rights reserved.

## 🔗 Links

- [GitHub Repository](https://github.com/RyanYuuki/AnymeX)
- [Vercel](https://vercel.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
