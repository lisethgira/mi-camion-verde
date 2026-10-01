import { formatearHora, etiquetaBolsa, claseBolsa } from '../lib/utils'

export default function HorarioCard({ item, showFecha = false }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-eco-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: item.color_hex || '#16A34A' }}
      />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div>
          <p className="font-display text-lg font-bold text-ink">
            {showFecha && item.fecha ? formatFecha(item.fecha) : item.dia}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {formatearHora(item.hora_estimada)}
            {item.hora_fin ? ` – ${formatearHora(item.hora_fin)}` : ''}
          </p>
          <p className="mt-2 text-sm font-semibold text-eco-800">{item.tipo_residuo}</p>
          {item.ruta && <p className="text-xs text-muted">Ruta {item.ruta}</p>}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${claseBolsa(item.color_bolsa)}`}
        >
          {etiquetaBolsa(item.color_bolsa)}
        </span>
      </div>
      {item.jornada && (
        <p className="mt-3 pl-2 text-xs font-medium capitalize text-eco-700">
          Jornada {item.jornada}
        </p>
      )}
    </article>
  )
}

function formatFecha(fecha) {
  try {
    const d = new Date(`${fecha}T12:00:00`)
    return d.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return fecha
  }
}
