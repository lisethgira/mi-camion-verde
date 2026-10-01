import { useState } from 'react'
import { api } from '../api'

const USER_KEY = 'ecoruta_usuario'
const TOKEN_KEY = 'ecoruta_token'

function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export default function Cuenta() {
  const [modo, setModo] = useState('login')
  const [usuario, setUsuario] = useState(getUsuario)
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    contrasena: '',
    telefono: '',
    acepta_tratamiento: false,
  })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function onChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMensaje('')
    try {
      if (modo === 'login') {
        const data = await api.login({
          correo: form.correo,
          contrasena: form.contrasena,
        })
        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(USER_KEY, JSON.stringify(data.usuario))
        setUsuario(data.usuario)
        setMensaje('Sesión iniciada')
      } else {
        await api.registro(form)
        setMensaje('Cuenta creada. Ahora puedes iniciar sesión.')
        setModo('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function salir() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUsuario(null)
  }

  if (usuario) {
    return (
      <section className="mx-auto max-w-lg space-y-6">
        <h1 className="font-display text-3xl font-extrabold text-ink">Tu cuenta</h1>
        <div className="rounded-2xl border border-eco-100 bg-white p-6 shadow-sm">
          <p className="font-display text-xl font-bold">
            {usuario.nombres} {usuario.apellidos}
          </p>
          <p className="mt-1 text-sm text-muted">{usuario.correo}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-eco-700">
            {usuario.rol}
          </p>
          <button
            type="button"
            onClick={salir}
            className="mt-6 rounded-full border border-eco-200 px-4 py-2 text-sm font-semibold text-eco-800 hover:bg-eco-50"
          >
            Cerrar sesión
          </button>
        </div>
        <p className="text-sm text-muted">
          Usuario de prueba: <code className="rounded bg-eco-50 px-1">ana@correo.com</code> /
          <code className="rounded bg-eco-50 px-1">Eco2026*</code>
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">
          {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Guarda tu barrio y recibe recordatorios (próximamente push).
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-eco-100 bg-white p-5 shadow-sm sm:p-6">
        {modo === 'registro' && (
          <>
            <Field label="Nombres" name="nombres" value={form.nombres} onChange={onChange} required />
            <Field label="Apellidos" name="apellidos" value={form.apellidos} onChange={onChange} required />
            <Field label="Teléfono" name="telefono" value={form.telefono} onChange={onChange} />
          </>
        )}
        <Field
          label="Correo"
          name="correo"
          type="email"
          value={form.correo}
          onChange={onChange}
          required
        />
        <Field
          label="Contraseña"
          name="contrasena"
          type="password"
          value={form.contrasena}
          onChange={onChange}
          required
        />
        {modo === 'registro' && (
          <label className="flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="acepta_tratamiento"
              checked={form.acepta_tratamiento}
              onChange={onChange}
              className="mt-1"
              required
            />
            Acepto el tratamiento de datos personales (Ley 1581 de 2012).
          </label>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {mensaje && <p className="text-sm text-eco-700">{mensaje}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-eco-600 py-3 text-sm font-bold text-white transition hover:bg-eco-700 disabled:opacity-60"
        >
          {loading ? 'Espera…' : modo === 'login' ? 'Entrar' : 'Registrarme'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
        className="text-sm font-semibold text-eco-700 hover:underline"
      >
        {modo === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </section>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-eco-200 px-3 py-2.5 text-sm outline-none ring-eco-400 focus:ring-2"
      />
    </label>
  )
}
