import { useState } from 'react'
import './App.css'
import { Catalog } from './components/Catalog'
import { FilterPanel } from './components/FilterPanel'
import { useBrands } from './useBrands'

export default function App() {
  const brands = useBrands()
  const [selected, setSelected] = useState<string[]>([])

  return (
    <main className="page">
      <Catalog
        brands={selected}
        aside={<FilterPanel brands={brands} selected={selected} onChange={setSelected} />}
      />
      <footer className="page-footer">
        AI prototyping for Designers by{' '}
        <a href="https://github.com/ana-rodrigues" target="_blank" rel="noopener noreferrer">
          Ana Rodrigues
        </a>
      </footer>
    </main>
  )
}
