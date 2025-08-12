# Personal Finance Tracker

A modern, full-featured personal finance tracking application built with Next.js 15, Supabase, and TypeScript. Track your income, expenses, budgets, and financial goals with an intuitive dashboard and powerful analytics.

## Features

### 🔐 Authentication
- Email/password authentication with Supabase Auth
- User registration and email confirmation
- Password reset functionality
- Secure session management

### 📊 Dashboard
- Overview of financial health
- Interactive charts and analytics using Recharts
- Monthly spending trends
- Account balance summaries
- Budget progress tracking

### 💳 Account Management
- Multiple account types (checking, savings, credit cards, investments)
- Real-time balance tracking
- Account categorization and organization

### 📝 Transaction Management
- Add, edit, and delete transactions
- Categorize income and expenses
- Advanced filtering by date, category, account, and type
- Mark transactions as essential/non-essential
- Bulk transaction views with daily grouping

### 🏷️ Category System
- Pre-defined default categories
- Custom user categories with color coding
- Visual category identification
- Category-based spending analysis

### 🎯 Budget Tracking
- Set monthly spending limits by category
- Real-time budget progress monitoring
- Visual progress indicators
- Budget overspend alerts
- Monthly budget reset automation

### 🎨 User Interface
- Modern, responsive design with Tailwind CSS
- Dark/light theme toggle
- Mobile-friendly interface
- Accessible components with Radix UI
- Smooth animations and transitions

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives
- **Charts**: Recharts
- **Language**: TypeScript
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager
- A Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   - Update `.env.local` with your actual Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up the database**
   - Run the SQL migration files in your Supabase SQL editor:
   - First run: `supabase/migrations/001_initial_schema.sql`
   - Then run: `supabase/migrations/002_enable_rls.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### Tables

- **accounts**: User's financial accounts (checking, savings, etc.)
- **categories**: Transaction categories (both default and user-created)
- **transactions**: Income and expense records
- **budgets**: Monthly spending limits by category

### Security

- Row Level Security (RLS) enabled on all tables
- User isolation ensures data privacy
- Secure authentication with Supabase Auth

## Usage

### First Time Setup

1. **Create an account** - Sign up with your email address
2. **Add accounts** - Add your bank accounts, credit cards, etc.
3. **Set up categories** - Use defaults or create custom categories
4. **Add transactions** - Start tracking your income and expenses
5. **Create budgets** - Set monthly spending limits

### Daily Usage

1. **Add transactions** as they occur
2. **Check dashboard** for spending overview
3. **Monitor budgets** to stay on track
4. **Use filters** to analyze spending patterns

## Project Structure

```
expense-tracker/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── accounts/          # Account-related components
│   ├── transactions/      # Transaction components
│   ├── categories/        # Category components
│   └── budgets/           # Budget components
├── lib/                   # Utility functions and types
│   ├── supabase/          # Supabase client configuration
│   └── types/             # TypeScript type definitions
└── supabase/              # Database migrations
    └── migrations/        # SQL migration files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database and Auth by [Supabase](https://supabase.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)