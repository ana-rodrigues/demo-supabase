import { useState } from 'react'
import type { Brand } from '../lib/products'

type Props = {
  brands: Brand[] | null
  selected: string[]
  onChange: (next: string[]) => void
}

export function FilterPanel({ brands, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)

  const toggle = (name: string) =>
    onChange(
      selected.includes(name)
        ? selected.filter((b) => b !== name)
        : [...selected, name].sort(),
    )

  return (
    <aside className="filters" data-open={open}>
      <div className="filters-head">
        <h2 className="filters-title">Filters</h2>
        <div className="filters-actions">
          <button
            type="button"
            className="filters-link"
            onClick={() => onChange([])}
            disabled={selected.length === 0}
          >
            Clear
          </button>
          <button
            type="button"
            className="filters-link filters-toggle"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      <div className="filters-body">
        <fieldset className="filters-group" aria-label="Brand">
          {brands === null
            ? Array.from({ length: 6 }, (_, i) => (
                <div className="filters-row" key={i} aria-hidden="true">
                  <span className="skeleton skeleton-line filters-skeleton" />
                </div>
              ))
            : brands.map((brand) => (
                <label className="filters-row" key={brand.name}>
                  <input
                    type="checkbox"
                    checked={selected.includes(brand.name)}
                    onChange={() => toggle(brand.name)}
                  />
                  <span className="filters-label">{brand.name}</span>
                  <span className="filters-count">{brand.count}</span>
                </label>
              ))}
        </fieldset>
        <button type="button" className="filters-apply" onClick={() => setOpen(false)}>
          Apply
        </button>
      </div>
    </aside>
  )
}
