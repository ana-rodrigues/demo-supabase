import { useState } from 'react'
import './App.css'
import { SegmentControl } from './SegmentControl'

type Variant = 'before' | 'after'

const OPTIONS: { value: Variant; label: string }[] = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
]

export default function App() {
  const [variant, setVariant] = useState<Variant>('before')

  return (
    <main className="stage" data-variant={variant}>
      <header className="page-header">
        <h1 className="page-title">Demo</h1>
        <img className="avatar" src="/IMG_6723.jpg" alt="Profile" />
      </header>

      {/* DEMO CONTENT GOES HERE. Use key={variant} on it to reset state per variant. */}

      <SegmentControl options={OPTIONS} value={variant} onChange={setVariant} />
      <footer className="page-footer">
        AI prototyping for Designers by{' '}
        <a
          href="https://github.com/ana-rodrigues"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ana Rodrigues
        </a>
      </footer>
    </main>
  )
}
