# Parking Arbitrage Dashboard

A clean, minimalist SaaS dashboard for monitoring parking prices and events in real-time. Inspired by Google Trends aesthetic.

## Features

- **Real-time Parking Monitor** - Track availability and prices across 50+ major venues
- **Price Alerts** - Get notified when prices drop or spike
- **Event Integration** - Monitor upcoming events and their parking demand
- **Light/Dark Mode** - Automatic theme switching with persistent user preference
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Historical Analytics** - View pricing trends and patterns

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Components**: Lucide Icons
- **Theme**: next-themes for light/dark mode
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Update API endpoints in .env.local
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend API endpoint
NEXT_PUBLIC_SUPABASE_URL=<url>             # Supabase instance URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>        # Supabase anonymous key
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── header.tsx          # Navigation header
│   ├── metrics-grid.tsx    # Key metrics display
│   ├── pricing-chart.tsx   # Price trends chart
│   ├── events-list.tsx     # Upcoming events list
│   ├── tools-grid.tsx      # Feature cards
│   ├── theme-toggle.tsx    # Light/dark mode toggle
│   └── theme-provider.tsx  # Theme configuration
├── public/                 # Static assets
└── tailwind.config.js      # Tailwind configuration
```

## Components

### MetricsGrid
Displays key performance indicators:
- Average parking price
- Number of venues tracked
- Available parking spots
- Best current deal

### PricingChart
Shows price trends over time with:
- Daily pricing patterns
- Peak and low price indicators
- Visual bar chart

### EventsList
Lists upcoming events with:
- Event name and venue
- Date and time
- Available spots
- Price trends
- Quick action buttons

### ToolsGrid
Showcases platform features:
- Active tools with descriptions
- Coming soon features
- Color-coded by category

## Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel deploy

# Set environment variables in Vercel dashboard
# Project Settings > Environment Variables
```

### Manual Deployment

```bash
npm run build
# Deploy the .next folder and public directory
```

## API Integration

The dashboard connects to the backend scraper via REST API:

```typescript
// Example API call
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/metrics`)
const data = await response.json()
```

## Real-time Updates

For real-time updates, the dashboard can integrate with Supabase:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Subscribe to real-time updates
supabase
  .from('parking_listings')
  .on('*', (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

## Future Enhancements

- [ ] Ticketmaster event integration
- [ ] Waze traffic data
- [ ] Advanced analytics dashboard
- [ ] Price prediction models
- [ ] User accounts and saved preferences
- [ ] Mobile app (React Native)
- [ ] Historical data export
- [ ] API documentation

## License

MIT
