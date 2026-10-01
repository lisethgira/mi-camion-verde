const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Error de conexión con el servidor')
  }
  return data
}

export const api = {
  getZonas: () => request('/zonas'),
  getBarrios: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/barrios${q ? `?${q}` : ''}`)
  },
  getBarrio: (id) => request(`/barrios/${id}`),
  getHorarios: (idBarrio) => request(`/barrios/${idBarrio}/horarios`),
  getProximas: (idBarrio, cantidad = 5) =>
    request(`/barrios/${idBarrio}/proximas?cantidad=${cantidad}`),
  getHoy: (idBarrio) => request(`/barrios/${idBarrio}/hoy`),
  getNovedades: () => request('/novedades'),
  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  registro: (body) =>
    request('/auth/registro', { method: 'POST', body: JSON.stringify(body) }),
}
