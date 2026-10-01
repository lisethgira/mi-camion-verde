export default function Loading({ label = 'Cargando…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-eco-700">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-eco-200 border-t-eco-600" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  )
}
