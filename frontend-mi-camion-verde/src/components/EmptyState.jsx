export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-eco-300 bg-white/70 px-6 py-10 text-center">
      <p className="font-display text-xl font-bold text-eco-800">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
