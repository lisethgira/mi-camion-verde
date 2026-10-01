import { useEffect, useState } from 'react'
import { api } from '../api'
import Loading from '../components/Loading'

const TIPO_LABEL = {
  cambio_horario: 'Cambio de horario',
  cancelacion: 'Cancelación',
  festivo: 'Festivo',
  informativo: 'Informativo',
}

export default function Novedades() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await api.getNovedades()
        if (!cancelled) setItems(data)
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

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">Avisos y novedades</h1>
        <p className="mt-1 text-sm text-muted">
          Cambios de ruta, festivos y mensajes del operador.
        </p>
      </div>

      {loading && <Loading />}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="rounded-2xl bg-white/80 px-4 py-8 text-center text-sm text-muted">
          No hay novedades activas por ahora.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((n) => (
          <article
            key={n.id_novedad}
            className="rounded-2xl border border-eco-100 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-eco-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-eco-800">
                {TIPO_LABEL[n.tipo] || n.tipo}
              </span>
              {n.ruta && (
                <span className="text-xs font-semibold text-muted">Ruta {n.ruta}</span>
              )}
            </div>
            <h2 className="mt-3 font-display text-lg font-bold text-ink">{n.titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{n.descripcion}</p>
            <p className="mt-4 text-xs text-slate-400">
              Vigente del {n.fecha_inicio} al {n.fecha_fin}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
