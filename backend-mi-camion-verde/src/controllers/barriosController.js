const pool = require('../config/db')
const { withFallback, mock } = require('../lib/dataSource')

async function listarZonas(_req, res) {
  return withFallback(
    async () => {
      const [rows] = await pool.query(
        'SELECT id_zona, nombre, descripcion FROM zonas WHERE activo = TRUE ORDER BY nombre'
      )
      return rows
    },
    () => mock.zonas,
    res,
    'No se pudieron cargar las zonas'
  )
}

async function listarBarrios(req, res) {
  const { zona, q } = req.query
  return withFallback(
    async () => {
      let sql = `
        SELECT b.id_barrio, b.nombre, b.tipo, b.latitud, b.longitud,
               z.id_zona, z.nombre AS zona
        FROM barrios b
        JOIN zonas z ON z.id_zona = b.id_zona
        WHERE b.activo = TRUE
      `
      const params = []
      if (zona) {
        sql += ' AND b.id_zona = ?'
        params.push(zona)
      }
      if (q) {
        sql += ' AND b.nombre LIKE ?'
        params.push(`%${q}%`)
      }
      sql += ' ORDER BY z.nombre, b.nombre'
      const [rows] = await pool.query(sql, params)
      return rows
    },
    () =>
      mock.barrios.filter((b) => {
        const okZona = !zona || String(b.id_zona) === String(zona)
        const okQ = !q || b.nombre.toLowerCase().includes(String(q).toLowerCase())
        return okZona && okQ
      }),
    res,
    'No se pudieron cargar los barrios'
  )
}

async function obtenerBarrio(req, res) {
  const id = Number(req.params.id)
  return withFallback(
    async () => {
      const [rows] = await pool.query(
        `SELECT b.id_barrio, b.nombre, b.tipo, b.latitud, b.longitud,
                z.id_zona, z.nombre AS zona
         FROM barrios b
         JOIN zonas z ON z.id_zona = b.id_zona
         WHERE b.id_barrio = ? AND b.activo = TRUE`,
        [id]
      )
      if (!rows.length) {
        const err = new Error('Barrio no encontrado')
        err.status = 404
        throw err
      }
      return rows[0]
    },
    () => {
      const b = mock.barrios.find((x) => x.id_barrio === id)
      if (!b) throw Object.assign(new Error('Barrio no encontrado'), { status: 404 })
      return b
    },
    res,
    'No se pudo cargar el barrio'
  )
}

module.exports = { listarZonas, listarBarrios, obtenerBarrio }
