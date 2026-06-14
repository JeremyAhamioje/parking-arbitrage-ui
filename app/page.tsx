import { Header } from '@/components/header'
import Hero from '@/components/hero'
import DiveDeeper from '@/components/dive-deeper'
import ToolsGridRedesigned from '@/components/tools-grid-redesigned'

export default function Home() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Header />
      <Hero />
      <DiveDeeper />
      <ToolsGridRedesigned />
    </main>
  )
}
