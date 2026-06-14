import { ArticleShell } from '@/components/article'
import { IMG } from '@/lib/articles'

export default function DateInventoryFetchArticle() {
  return (
    <ArticleShell
      tag="Action Tool"
      title="Manual Date & Time Inventory Fetch"
      intro="No event needed. Pick a venue and an exact time period to pull generic, time-coded parking inventory across SpotHero, Way, and ParkWhiz — all in one unified table."
      image={IMG.dateInventory}
      ctaLabel="Open Date & Time Fetch"
      ctaHref="/date-fetch"
      steps={[
        { title: 'Enter the venue', body: 'Type the venue — the same fuzzy venue matching as Live Event Fetch applies.' },
        { title: 'Set the time period', body: 'Choose a start date & time and an end date & time. The window can be a few hours or span days; the end defaults to four hours after the start.' },
        { title: 'Hit Fetch', body: 'The engine writes that exact window into each platform’s search — SpotHero’s start/end params, Way’s check-in/check-out filter, and ParkWhiz’s time-coded URL — then pulls the inventory priced for it.' },
        { title: 'Compare across platforms', body: 'Results land in one table, grouped by platform and sorted cheapest-first within each, so you can compare prices side by side.' },
        { title: 'Export or copy', body: 'Download as XLSX or copy into your sheet with the full column set — price, availability, distance, and timestamp.' },
      ]}
      tips={[
        'Use this for a baseline — e.g. normal weekday pricing for a given window when there is no event.',
        'Pair it with Live Event Fetch to measure the event premium versus an ordinary day at the same venue and time.',
        'The window is applied as each platform’s own search parameter, so pricing reflects exactly that period.',
      ]}
    />
  )
}
