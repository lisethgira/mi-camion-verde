const STORAGE_KEY = 'ecoruta_barrio'

export function getBarrioGuardado() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function guardarBarrio(barrio) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(barrio))
}

export function limpiarBarrio() {
  localStorage.removeItem(STORAGE_KEY)
}

export function formatearHora(valor) {
  if (!valor) return ''
  const str = String(valor)
  const [h, m] = str.split(':')
  const hour = Number(h)
  const suffix = hour >= 12 ? 'p. m.' : 'a. m.'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${suffix}`
}

export function etiquetaBolsa(color) {
  const map = {
    blanca: 'Bolsa blanca',
    negra: 'Bolsa negra',
    verde: 'Bolsa verde',
  }
  return map[color] || color
}

export function claseBolsa(color) {
  if (color === 'negra') return 'bg-bag-black text-white'
  if (color === 'verde') return 'bg-bag-green text-white'
  return 'bg-bag-white text-ink border border-slate-300'
}
