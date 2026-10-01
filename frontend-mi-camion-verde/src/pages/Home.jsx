import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import HorarioCard from '../components/HorarioCard'
import EmptyState from '../components/EmptyState'
import Loading from '../components/Loading'

export default function Home({ barrio }) {
  const [proximas, setProximas] = useState([])
  const [hoy, setHoy] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!barrio?.id_barrio) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [prox, today] = await Promise.all([
          api.getProximas(barrio.id_barrio, 4),
          api.getHoy(barrio.id_barrio),
        ])
        if (!cancelled) {
          setProximas(prox)
          setHoy(today)
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
  }, [barrio])

  if (!barrio) {
    return (
      <section className="animate-in">
        <Hero />
        <EmptyState
          title="Elige tu barrio para empezar"
          description="Te mostramos cuándo pasa el camión y qué bolsa sacar."
          action={
            <Link
              to="/barrio"
              className="inline-flex rounded-full bg-eco-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-eco-700"
            >
              Buscar mi barrio
            </Link>
          }
        />
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-eco-700 via-eco-600 to-eco-500 px-5 py-7 text-white shadow-lg sm:px-8 sm:py-9">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 right-4 opacity-20 sm:right-10 sm:opacity-30">
          <img src="/ecoruta-icono.svg" alt="" className="h-28 w-28 sm:h-36 sm:w-36" />
        </div>
        <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-eco-100">
          EcoRuta
        </p>
        <h1 className="mt-2 max-w-xl font-display text-3xl font-extrabold leading-tight sm:text-4xl">
          ¿Cuándo pasa el camión en {barrio.nombre}?
        </h1>
        <p className="mt-3 max-w-lg text-sm text-eco-50/90 sm:text-base">
          Zona {barrio.zona}. Consulta la próxima recolección y prepara la bolsa correcta.
        </p>
        <Link
          to="/barrio"
          className="mt-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
        >
          Cambiar barrio
        </Link>
      </div>

      {loading && <Loading label="Consultando horarios…" />}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-ink">Hoy</h2>
              <Link to="/horarios" className="text-sm font-semibold text-eco-700 hover:underline">
                Ver semana
              </Link>
            </div>
            {hoy.length === 0 ? (
              <p className="rounded-xl bg-white/80 px-4 py-5 text-sm text-muted">
                No hay recolección programada para hoy en tu barrio.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {hoy.map((item) => (
                  <HorarioCard key={`${item.tipo_residuo}-${item.hora_estimada}`} item={item} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 font-display text-xl font-bold text-ink">Próximas recolecciones</h2>
            {proximas.length === 0 ? (
              <p className="text-sm text-muted">Sin próximas recolecciones disponibles.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                {proximas.map((item, i) => (
                  <HorarioCard
                    key={`${item.fecha}-${item.hora_estimada}-${i}`}
                    item={item}
                    showFecha
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

function Hero() {
  return (
    <div className="mb-6 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-eco-800 via-eco-700 to-eco-500 px-5 py-10 text-white shadow-lg sm:px-10 sm:py-14">
      <img
        src="/ecoruta-logo.svg"
        alt="EcoRuta"
        className="mb-6 h-12 w-auto brightness-0 invert sm:h-14"
      />
      <h1 className="max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-5xl">
        Nunca más te quedes sin sacar la basura a tiempo
      </h1>
      <p className="mt-4 max-w-xl text-base text-eco-50/90 sm:text-lg">
        Consulta el horario del camión en tu barrio, tablet o computadora, e instálalo como app.
      </p>
    </div>
  )
}
