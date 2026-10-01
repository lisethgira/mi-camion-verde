import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { getBarrioGuardado, guardarBarrio } from '../lib/utils'
import Loading from '../components/Loading'

export default function BarrioSelect({ onSelect }) {
  const [barrios, setBarrios] = useState([])
  const [zonas, setZonas] = useState([])
  const [zona, setZona] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [z, b] = await Promise.all([api.getZonas(), api.getBarrios()])
        if (!cancelled) {
          setZonas(z)
          setBarrios(b)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtrados = useMemo(() => {
    return barrios.filter((b) => {
      const matchZona = !zona || String(b.id_zona) === String(zona)
      const matchQ = !q || b.nombre.toLowerCase().includes(q.toLowerCase())
      return matchZona && matchQ
    })
  }, [barrios, zona, q])

  function elegir(barrio) {
    guardarBarrio(barrio)
    onSelect?.(barrio)
  }

  const actual = getBarrioGuardado()

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">Tu barrio</h1>
        <p className="mt-1 text-sm text-muted">
          Selecciona dónde vives para ver los horarios del camión.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            Buscar
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ej. Centro, Gualanday…"
            className="w-full rounded-xl border border-eco-200 bg-white px-4 py-3 text-sm outline-none ring-eco-400 transition focus:ring-2"
          />
        </label>
        <label className="block sm:min-w-[200px]">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            Zona
          </span>
          <select
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className="w-full rounded-xl border border-eco-200 bg-white px-4 py-3 text-sm outline-none ring-eco-400 focus:ring-2"
          >
            <option value="">Todas</option>
            {zonas.map((z) => (
              <option key={z.id_zona} value={z.id_zona}>
                {z.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <Loading />}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}. ¿Está corriendo el backend?
        </p>
      )}

      {!loading && !error && (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((b) => {
            const selected = actual?.id_barrio === b.id_barrio
            return (
              <li key={b.id_barrio}>
                <button
                  type="button"
                  onClick={() => elegir(b)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? 'border-eco-500 bg-eco-50 shadow-sm'
                      : 'border-eco-100 bg-white hover:border-eco-300 hover:shadow-sm'
                  }`}
                >
                  <span>
                    <span className="block font-display text-base font-bold text-ink">
                      {b.nombre}
                    </span>
                    <span className="text-xs capitalize text-muted">
                      {b.tipo} · {b.zona}
                    </span>
                  </span>
                  {selected && (
                    <span className="rounded-full bg-eco-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Actual
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {actual && (
        <div className="pt-2">
          <Link to="/" className="text-sm font-semibold text-eco-700 hover:underline">
            Volver al inicio con {actual.nombre} →
          </Link>
        </div>
      )}
    </section>
  )
}
