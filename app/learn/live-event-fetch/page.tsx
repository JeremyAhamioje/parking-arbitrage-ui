import { ArticleShell } from '@/components/article'
import { IMG } from '@/lib/articles'

export default function LiveEventFetchArticle() {
  return (
    <ArticleShell
      tag="Action Tool"
      title="Live Event Fetch"
      intro="Pull parking for one specific event across SpotHero, Way, and ParkWhiz at once — without visiting any platform. Typos and abbreviations are fine."
      image={IMG.liveEvent}
      ctaLabel="Open Live Event Fetch"
      ctaHref="/live-fetch"
      steps={[
        { title: 'Enter the venue and event', body: "Type the venue (e.g. 'MSG') and the event (e.g. 'Tylor Swift'). Fuzzy matching resolves abbreviations, acronyms, and typos automatically." },
        { title: 'Optionally add a date', body: 'When a venue hosts the same act on multiple nights, add a date to narrow to the exact show.' },
        { title: 'Hit Fetch', body: 'The engine searches all three platforms live and isolates parking tied to that event only — never generic venue inventory or nearby recommendations.' },
        { title: 'Check confidence and confirm', body: 'Each platform shows a match confidence. Below 80%, pick the correct event from the suggested titles to refine the result.' },
        { title: 'Export or copy', body: 'Download the unified table as XLSX or copy it straight into your working sheet. Rows are grouped by platform, cheapest-first within each.' },
      ]}
      tips={[
        'Way clears Cloudflare on every run, so it is the slowest leg — give a fetch up to a minute.',
        'If a platform finds no matching event, it still returns its closest candidates so you can pick the right one.',
        'The unified table includes price, availability, walking distance, event date, and a per-row confidence score.',
      ]}
    />
  )
}
