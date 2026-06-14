import { ArticleShell } from '@/components/article'
import { IMG } from '@/lib/articles'

export default function SheetNormalizerArticle() {
  return (
    <ArticleShell
      tag="Action Tool"
      title="Sheet Normalizer"
      intro="Upload a messy XLSX or CSV. The engine auto-detects your columns, fetches live parking per row, and appends enriched data with a confidence score — never overwriting your originals."
      image={IMG.sheetNormalizer}
      ctaLabel="Open Sheet Normalizer"
      ctaHref="/normalize"
      steps={[
        { title: 'Upload your sheet', body: 'Drop an XLSX, XLS, or CSV file. Messy, abbreviated, or out-of-order headers are welcome.' },
        { title: 'Review detected columns', body: "The engine maps your headers to venue, event, date, price, status, and remarks automatically — even abbreviations like 'Vnue' or 'Evt'." },
        { title: 'Process and enrich', body: 'Each row is scraped live and matched back to the result using a 2-of-3 validation rule across venue, event, and date.' },
        { title: 'Read the match status', body: 'Every row gets a status — MATCHED, FLAGGED, NO_DATA, or SKIPPED — alongside the live low price, matched platform, confidence, and any error flags.' },
        { title: 'Download the enriched sheet', body: 'Your original columns are returned untouched; the enriched columns are appended. Download as XLSX or copy to clipboard.' },
      ]}
      tips={[
        'Your values are never overwritten — enrichment is strictly append-only.',
        'Processing is sequential and live, so large sheets take time; start with a smaller row limit to preview.',
        'Add GEMINI_API_KEY to enable semantic row matching; without it, matching falls back to the local fuzzy matcher.',
      ]}
    />
  )
}
