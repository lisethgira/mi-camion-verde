const pool = require('../config/db')
const { withFallback, mock } = require('../lib/dataSource')

async function listarNovedades(req, res) {
  const { activas } = req.query
  return withFallback(
    async () => {
      let sql = `
        SELECT n.id_novedad, n.tipo, n.titulo, n.descripcion,
               n.fecha_inicio, n.fecha_fin, n.fecha_publicacion,
               r.codigo AS ruta, r.nombre AS ruta_nombre
        FROM novedades n
        LEFT JOIN rutas r ON r.id_ruta = n.id_ruta
        WHERE n.publicada = TRUE
      `
      if (activas !== 'false') {
        sql += ' AND CURDATE() BETWEEN n.fecha_inicio AND n.fecha_fin'
      }
      sql += ' ORDER BY n.fecha_publicacion DESC LIMIT 20'
      const [rows] = await pool.query(sql)
      return rows
    },
    () => {
      if (activas === 'false') return mock.novedades
      const today = new Date().toISOString().slice(0, 10)
      return mock.novedades.filter(
        (n) => n.fecha_inicio <= today && n.fecha_fin >= today
      )
    },
    res,
    'No se pudieron cargar las novedades'
  )
}

module.exports = { listarNovedades }
