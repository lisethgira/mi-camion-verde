/** Datos de demostración alineados con docs/04_Base_de_Datos_EcoRuta.sql */

const zonas = [
  { id_zona: 1, nombre: 'Zona Centro', descripcion: 'Casco urbano central' },
  { id_zona: 2, nombre: 'Zona Sur', descripcion: 'Sector sur y corredor San Antonio' },
  { id_zona: 3, nombre: 'Zona Norte', descripcion: 'Sector norte urbano' },
  { id_zona: 4, nombre: 'Zona Rural', descripcion: 'Veredas del municipio' },
]

const barrios = [
  { id_barrio: 1, id_zona: 1, nombre: 'Centro', tipo: 'barrio', zona: 'Zona Centro', latitud: 6.1554, longitud: -75.3743 },
  { id_barrio: 2, id_zona: 1, nombre: 'El Porvenir', tipo: 'barrio', zona: 'Zona Centro', latitud: 6.1509, longitud: -75.3818 },
  { id_barrio: 3, id_zona: 1, nombre: 'Alto del Medio', tipo: 'barrio', zona: 'Zona Centro', latitud: 6.1582, longitud: -75.3701 },
  { id_barrio: 4, id_zona: 2, nombre: 'San Antonio de Pereira', tipo: 'sector', zona: 'Zona Sur', latitud: 6.1247, longitud: -75.3841 },
  { id_barrio: 5, id_zona: 2, nombre: 'Barro Blanco', tipo: 'barrio', zona: 'Zona Sur', latitud: 6.1416, longitud: -75.3789 },
  { id_barrio: 6, id_zona: 3, nombre: 'Gualanday', tipo: 'barrio', zona: 'Zona Norte', latitud: 6.1663, longitud: -75.3739 },
  { id_barrio: 7, id_zona: 3, nombre: 'Cuatro Esquinas', tipo: 'barrio', zona: 'Zona Norte', latitud: 6.1631, longitud: -75.3792 },
  { id_barrio: 8, id_zona: 4, nombre: 'Vereda Abreo', tipo: 'vereda', zona: 'Zona Rural', latitud: null, longitud: null },
  { id_barrio: 9, id_zona: 4, nombre: 'Vereda Cabeceras', tipo: 'vereda', zona: 'Zona Rural', latitud: null, longitud: null },
]

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

/** minutos_desde_inicio por barrio en su ruta */
const offset = {
  1: 0, 2: 45, 3: 90, 5: 0, 4: 60, 6: 0, 7: 50, 8: 0, 9: 80,
}

const plantillas = {
  1: [
    { tipo_residuo: 'No aprovechables', color_bolsa: 'negra', color_hex: '#1F2937', ruta: 'R-01', dia_semana: 1, hora_inicio: '19:00:00', hora_fin: '23:00:00', jornada: 'noche' },
    { tipo_residuo: 'No aprovechables', color_bolsa: 'negra', color_hex: '#1F2937', ruta: 'R-01', dia_semana: 3, hora_inicio: '19:00:00', hora_fin: '23:00:00', jornada: 'noche' },
    { tipo_residuo: 'No aprovechables', color_bolsa: 'negra', color_hex: '#1F2937', ruta: 'R-01', dia_semana: 5, hora_inicio: '19:00:00', hora_fin: '23:00:00', jornada: 'noche' },
    { tipo_residuo: 'Aprovechables', color_bolsa: 'blanca', color_hex: '#E5E7EB', ruta: 'R-01', dia_semana: 2, hora_inicio: '08:00:00', hora_fin: '12:00:00', jornada: 'mañana' },
    { tipo_residuo: 'Orgánicos aprovechables', color_bolsa: 'verde', color_hex: '#16A34A', ruta: 'R-01', dia_semana: 4, hora_inicio: '08:00:00', hora_fin: '12:00:00', jornada: 'mañana' },
  ],
  2: [
    { tipo_residuo: 'No aprovechables', color_bolsa: 'negra', color_hex: '#1F2937', ruta: 'R-02', dia_semana: 2, hora_inicio: '06:00:00', hora_fin: '11:00:00', jornada: 'mañana' },
    { tipo_residuo: 'No aprovechables', color_bolsa: 'negra', color_hex: '#1F2937', ruta: 'R-02', dia_semana: 4, hora_inicio: '06:00:00', hora_fin: '11:00:00', jornada: 'mañana' },
    { tipo_residuo: 'No aprovechables', color_bolsa: 'negra', color_hex: '#1F2937', ruta: 'R-02', dia_semana: 6, hora_inicio: '06:00:00', hora_fin: '11:00:00', jornada: 'mañana' },
    { tipo_residuo: 'Aprovechables', color_bolsa: 'blanca', color_hex: '#E5E7EB', ruta: 'R-02', dia_semana: 3, hora_inicio: '13:00:00', hora_fin: '17:00:00', jornada: 'tarde' },
  ],
  3: [
    { tipo_residuo: 'No aprovechables', color_bolsa: 'negra', color_hex: '#1F2937', ruta: 'R-03', dia_semana: 1, hora_inicio: '06:00:00', hora_fin: '10:00:00', jornada: 'mañana' },
    { tipo_residuo: 'No aprovechables', color_bolsa: 'negra', color_hex: '#1F2937', ruta: 'R-03', dia_semana: 4, hora_inicio: '06:00:00', hora_fin: '10:00:00', jornada: 'mañana' },
    { tipo_residuo: 'Aprovechables', color_bolsa: 'blanca', color_hex: '#E5E7EB', ruta: 'R-03', dia_semana: 5, hora_inicio: '13:00:00', hora_fin: '17:00:00', jornada: 'tarde' },
  ],
  4: [
    { tipo_residuo: 'No aprovechables', color_bolsa: 'negra', color_hex: '#1F2937', ruta: 'R-04', dia_semana: 6, hora_inicio: '07:00:00', hora_fin: '14:00:00', jornada: 'mañana' },
  ],
}

const barrioRuta = { 1: 1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 3, 7: 3, 8: 4, 9: 4 }

function addMinutes(time, minutes) {
  const [h, m, s] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(s || 0).padStart(2, '0')}`
}

function horariosDeBarrio(idBarrio) {
  const rutaId = barrioRuta[idBarrio]
  const mins = offset[idBarrio] || 0
  return (plantillas[rutaId] || []).map((h, i) => ({
    id_horario: idBarrio * 100 + i,
    dia: DIAS[h.dia_semana - 1],
    dia_semana: h.dia_semana,
    hora_inicio: h.hora_inicio,
    hora_estimada: addMinutes(h.hora_inicio, mins),
    hora_fin: h.hora_fin,
    tipo_residuo: h.tipo_residuo,
    color_bolsa: h.color_bolsa,
    color_hex: h.color_hex,
    ruta: h.ruta,
    jornada: h.jornada,
  }))
}

function diaHoy() {
  // JS: 0=domingo → ISO 1=lunes..7=domingo
  const d = new Date().getDay()
  return d === 0 ? 7 : d
}

function proximas(idBarrio, cantidad) {
  const lista = horariosDeBarrio(idBarrio)
  const hoy = diaHoy()
  const ahora = new Date()
  const horaAhora = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}:00`

  const enriched = lista.map((h) => {
    let daysAhead
    if (h.dia_semana > hoy) daysAhead = h.dia_semana - hoy
    else if (h.dia_semana === hoy && h.hora_estimada >= horaAhora) daysAhead = 0
    else daysAhead = h.dia_semana - hoy + 7

    const fecha = new Date()
    fecha.setDate(fecha.getDate() + daysAhead)
    return {
      ...h,
      fecha: fecha.toISOString().slice(0, 10),
      _sort: daysAhead * 1440 + Number(h.hora_estimada.slice(0, 2)) * 60 + Number(h.hora_estimada.slice(3, 5)),
    }
  })

  return enriched
    .sort((a, b) => a._sort - b._sort)
    .slice(0, cantidad)
    .map(({ _sort, ...rest }) => rest)
}

const novedades = [
  {
    id_novedad: 1,
    tipo: 'informativo',
    titulo: 'Bienvenida a EcoRuta',
    descripcion:
      'Consulta los horarios de tu barrio y prepara la bolsa correcta según el tipo de residuo.',
    fecha_inicio: '2026-10-01',
    fecha_fin: '2026-12-31',
    fecha_publicacion: '2026-10-01',
    ruta: null,
    ruta_nombre: null,
  },
  {
    id_novedad: 2,
    tipo: 'festivo',
    titulo: 'Horario especial por festivo',
    descripcion:
      'El lunes festivo la recolección de la Ruta Centro se traslada al martes en el mismo horario.',
    fecha_inicio: '2026-10-12',
    fecha_fin: '2026-10-13',
    fecha_publicacion: '2026-10-01',
    ruta: null,
    ruta_nombre: null,
  },
  {
    id_novedad: 3,
    tipo: 'cambio_horario',
    titulo: 'Ruta Sur inicia más temprano',
    descripcion:
      'Por obras en la vía, la Ruta Sur iniciará a las 5:30 a. m. durante esta semana.',
    fecha_inicio: '2026-10-05',
    fecha_fin: '2026-10-10',
    fecha_publicacion: '2026-10-01',
    ruta: 'R-02',
    ruta_nombre: 'Ruta Sur',
  },
]

const usuarios = [
  {
    id_usuario: 3,
    nombres: 'Ana',
    apellidos: 'Ciudadana',
    correo: 'ana@correo.com',
    rol: 'ciudadano',
    contrasena: 'Eco2026*',
  },
]

module.exports = {
  zonas,
  barrios,
  horariosDeBarrio,
  proximas,
  diaHoy,
  novedades,
  usuarios,
}
