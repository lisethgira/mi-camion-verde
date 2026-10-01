import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import HorarioCard from '../components/HorarioCard'
import EmptyState from '../components/EmptyState'
import Loading from '../components/Loading'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function Horarios({ barrio }) {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filtroDia, setFiltroDia] = useState('todos')

  useEffect(() => {
    if (!barrio?.id_barrio) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await api.getHorarios(barrio.id_barrio)
        if (!cancelled) setHorarios(data)
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
  }, [barrio])

  const agrupados = useMemo(() => {
    const map = {}
    for (const h of horarios) {
      if (filtroDia !== 'todos' && String(h.dia_semana) !== filtroDia) continue
      if (!map[h.dia_semana]) map[h.dia_semana] = []
      map[h.dia_semana].push(h)
    }
    return map
  }, [horarios, filtroDia])

  if (!barrio) {
    return (
      <EmptyState
        title="Necesitas un barrio"
        description="Elige tu barrio para ver el calendario semanal de recolección."
        action={
          <Link
            to="/barrio"
            className="inline-flex rounded-full bg-eco-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            Elegir barrio
          </Link>
        }
      />
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">Horarios semanales</h1>
        <p className="mt-1 text-sm text-muted">
          Recolección en <strong>{barrio.nombre}</strong> ({barrio.zona})
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={filtroDia === 'todos'} onClick={() => setFiltroDia('todos')}>
          Todos
        </FilterChip>
        {DIAS.map((dia, i) => (
          <FilterChip
            key={dia}
            active={filtroDia === String(i + 1)}
            onClick={() => setFiltroDia(String(i + 1))}
          >
            {dia.slice(0, 3)}
          </FilterChip>
        ))}
      </div>

      {loading && <Loading />}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && Object.keys(agrupados).length === 0 && (
        <p className="text-sm text-muted">No hay horarios para el filtro seleccionado.</p>
      )}

      {!loading &&
        Object.keys(agrupados)
          .sort((a, b) => Number(a) - Number(b))
          .map((diaKey) => (
            <div key={diaKey}>
              <h2 className="mb-3 font-display text-lg font-bold text-eco-800">
                {DIAS[Number(diaKey) - 1]}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {agrupados[diaKey].map((item) => (
                  <HorarioCard key={item.id_horario} item={item} />
                ))}
              </div>
            </div>
          ))}
    </section>
  )
}

function FilterChip({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
        active
          ? 'bg-eco-700 text-white shadow-sm'
          : 'bg-white text-muted ring-1 ring-eco-100 hover:ring-eco-300'
      }`}
    >
      {children}
    </button>
  )
}
