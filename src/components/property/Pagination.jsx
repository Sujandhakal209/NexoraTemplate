import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  const numbers = Array.from({ length: pages }, (_, index) => index + 1).filter((value) => value === 1 || value === pages || Math.abs(value - page) <= 1)
  return <nav className="pagination" aria-label="Property result pages">
    <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft /></button>
    {numbers.map((number, index) => <span key={number} className="pagination-item-wrap">{index > 0 && number - numbers[index - 1] > 1 && <span>…</span>}<button type="button" className={number === page ? 'active' : ''} aria-current={number === page ? 'page' : undefined} onClick={() => onChange(number)}>{number}</button></span>)}
    <button type="button" disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight /></button>
  </nav>
}
