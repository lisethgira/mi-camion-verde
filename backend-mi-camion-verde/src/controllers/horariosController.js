const pool = require('../config/db')
const { withFallback, mock } = require('../lib/dataSource')

async function horariosPorBarrio(req, res) {
  const idBarrio = Number(req.params.idBarrio)
  return withFallback(
    async () => {
      const [rows] = await pool.query(
        `SELECT dia, dia_semana, hora_estimada, hora_inicio, hora_fin,
                tipo_residuo, color_bolsa, color_hex, ruta, jornada, id_horario
         FROM vw_horarios_por_barrio
         WHERE id_barrio = ?
         ORDER BY dia_semana, hora_estimada`,
        [idBarrio]
      )
      return rows
    },
    () => mock.horariosDeBarrio(idBarrio),
    res,
    'No se pudieron cargar los horarios'
  )
}

async function proximasRecolecciones(req, res) {
  const idBarrio = Number(req.params.idBarrio)
  const cantidad = Math.min(Number(req.query.cantidad) || 5, 14)
  return withFallback(
    async () => {
      const [rows] = await pool.query('CALL sp_proximas_recolecciones(?, ?)', [
        idBarrio,
        cantidad,
      ])
      return Array.isArray(rows) ? rows[0] : rows
    },
    () => mock.proximas(idBarrio, cantidad),
    res,
    'No se pudieron cargar las próximas recolecciones'
  )
}

async function resumenHoy(req, res) {
  const idBarrio = Number(req.params.idBarrio)
  return withFallback(
    async () => {
      const [rows] = await pool.query(
        `SELECT dia, dia_semana, hora_estimada, hora_fin, tipo_residuo,
                color_bolsa, color_hex, ruta, jornada
         FROM vw_horarios_por_barrio
         WHERE id_barrio = ? AND dia_semana = WEEKDAY(NOW()) + 1
         ORDER BY hora_estimada`,
        [idBarrio]
      )
      return rows
    },
    () => mock.horariosDeBarrio(idBarrio).filter((h) => h.dia_semana === mock.diaHoy()),
    res,
    'No se pudo cargar el resumen de hoy'
  )
}

module.exports = { horariosPorBarrio, proximasRecolecciones, resumenHoy }
