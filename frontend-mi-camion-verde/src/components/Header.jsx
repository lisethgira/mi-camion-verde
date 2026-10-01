import { NavLink, Link } from 'react-router-dom'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/horarios', label: 'Horarios' },
  { to: '/novedades', label: 'Avisos' },
  { to: '/cuenta', label: 'Cuenta' },
]

export default function Header({ barrio }) {
  return (
    <header className="sticky top-0 z-30 border-b border-eco-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/ecoruta-icono.svg" alt="" className="h-10 w-10 rounded-xl shadow-sm" />
          <div className="leading-tight">
            <p className="font-display text-lg font-extrabold tracking-tight text-eco-700 sm:text-xl">
              Eco<span className="text-eco-600">Ruta</span>
            </p>
            <p className="hidden text-xs text-muted sm:block">Horarios de recolección</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-eco-100 text-eco-800'
                    : 'text-muted hover:bg-eco-50 hover:text-eco-700'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {barrio ? (
          <Link
            to="/barrio"
            className="max-w-[42%] truncate rounded-full border border-eco-200 bg-eco-50 px-3 py-1.5 text-xs font-semibold text-eco-800 sm:max-w-none sm:text-sm"
          >
            {barrio.nombre}
          </Link>
        ) : (
          <Link
            to="/barrio"
            className="rounded-full bg-eco-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm sm:text-sm"
          >
            Elegir barrio
          </Link>
        )}
      </div>
    </header>
  )
}
