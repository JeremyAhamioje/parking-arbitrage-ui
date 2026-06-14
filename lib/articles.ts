// Single source of truth for the "Dive deeper" / Articles content + imagery.
// The homepage dive section shows the `isNew` ones; /learn shows all six.

export const IMG = {
  liveEvent:       'https://res.cloudinary.com/dz6kxumoo/image/upload/v1781432142/Gemini_Generated_Image_szst0gszst0gszst_w4ofxd.png',
  dateInventory:   'https://res.cloudinary.com/dz6kxumoo/image/upload/v1781432141/Gemini_Generated_Image_mjlgrkmjlgrkmjlg_la2jh9.png',
  sheetNormalizer: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1781430979/Gemini_Generated_Image_29yf4p29yf4p29yf_idogxw.png',
  priceTrends:     'https://res.cloudinary.com/dz6kxumoo/image/upload/v1780821869/Gemini_Generated_Image_2t14ip2t14ip2t14_b7hrrj.png',
  changeDetection: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1780822375/download_19_ayug5p.jpg',
  eventDiscovery:  'https://res.cloudinary.com/dz6kxumoo/image/upload/v1780821868/_116313598_ticketmaster_vj2524.jpg',
}

export interface Article {
  slug: string
  title: string
  tag: string
  desc: string
  image: string
  route: string
  isNew?: boolean
}

export const ARTICLES: Article[] = [
  {
    slug: 'live-event-fetch',
    title: 'Live Event Fetch',
    tag: 'Action Tool',
    desc: 'Pull parking for one specific event across SpotHero, Way, and ParkWhiz at once — with typo-tolerant matching and confidence scores.',
    image: IMG.liveEvent,
    route: '/learn/live-event-fetch',
    isNew: true,
  },
  {
    slug: 'date-inventory-fetch',
    title: 'Manual Date & Time Inventory Fetch',
    tag: 'Action Tool',
    desc: 'No event needed — pick a venue and an exact time period to pull generic, time-coded parking inventory across all three platforms in one table.',
    image: IMG.dateInventory,
    route: '/learn/date-inventory-fetch',
    isNew: true,
  },
  {
    slug: 'sheet-normalizer',
    title: 'Sheet Normalizer',
    tag: 'Action Tool',
    desc: 'Upload a messy sheet — the engine auto-detects columns, fetches live prices per row, and appends enriched data without overwriting yours.',
    image: IMG.sheetNormalizer,
    route: '/learn/sheet-normalizer',
    isNew: true,
  },
  {
    slug: 'price-trends',
    title: 'Price Trends',
    tag: 'Insights',
    desc: 'Interactive charts showing parking price movements and venue classifications over time.',
    image: IMG.priceTrends,
    route: '/learn/price-trends',
  },
  {
    slug: 'change-detection',
    title: 'Change Detection',
    tag: 'Monitoring',
    desc: 'Automated alerts for 20%+ price spikes and 40%+ inventory drops across all tracked venues.',
    image: IMG.changeDetection,
    route: '/learn/change-detection',
  },
  {
    slug: 'event-discovery',
    title: 'Event Discovery',
    tag: 'Discovery',
    desc: 'Correlate events with parking demand to identify market opportunities as new events are announced.',
    image: IMG.eventDiscovery,
    route: '/learn/event-discovery',
  },
]

export const NEW_ARTICLES = ARTICLES.filter((a) => a.isNew)
