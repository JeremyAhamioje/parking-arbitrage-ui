import { Header } from '@/components/header'

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Header />
      {children}
    </main>
  )
}
