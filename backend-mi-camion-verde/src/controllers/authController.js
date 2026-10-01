const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')
const { useMock, mock } = require('../lib/dataSource')

async function registrar(req, res) {
  try {
    const { nombres, apellidos, correo, contrasena, telefono, acepta_tratamiento } = req.body

    if (!nombres || !apellidos || !correo || !contrasena) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }
    if (!acepta_tratamiento) {
      return res.status(400).json({ error: 'Debes aceptar el tratamiento de datos' })
    }

    if (useMock()) {
      return res.status(201).json({
        mensaje: 'Cuenta creada (modo demo)',
        id_usuario: Date.now(),
      })
    }

    const hash = await bcrypt.hash(contrasena, 10)
    const [result] = await pool.query(
      `INSERT INTO usuarios (id_rol, nombres, apellidos, correo, contrasena_hash, telefono, acepta_tratamiento)
       VALUES (1, ?, ?, ?, ?, ?, TRUE)`,
      [nombres, apellidos, correo.toLowerCase(), hash, telefono || null]
    )

    await pool.query('INSERT INTO preferencias_notificacion (id_usuario) VALUES (?)', [
      result.insertId,
    ])

    res.status(201).json({
      mensaje: 'Cuenta creada',
      id_usuario: result.insertId,
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ese correo ya está registrado' })
    }
    console.error('Error registrar:', error)
    res.status(500).json({ error: 'No se pudo registrar el usuario' })
  }
}

async function login(req, res) {
  try {
    const { correo, contrasena } = req.body
    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' })
    }

    if (useMock()) {
      const user = mock.usuarios.find((u) => u.correo === correo.toLowerCase())
      if (!user || user.contrasena !== contrasena) {
        return res.status(401).json({ error: 'Credenciales incorrectas' })
      }
      const token = jwt.sign(
        { id: user.id_usuario, rol: user.rol },
        process.env.JWT_SECRET || 'demo',
        { expiresIn: '7d' }
      )
      return res.json({
        token,
        usuario: {
          id_usuario: user.id_usuario,
          nombres: user.nombres,
          apellidos: user.apellidos,
          correo: user.correo,
          rol: user.rol,
        },
      })
    }

    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombres, u.apellidos, u.correo, u.contrasena_hash,
              u.estado, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.correo = ?`,
      [correo.toLowerCase()]
    )

    if (!rows.length) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const user = rows[0]
    if (user.estado !== 'activo') {
      return res.status(403).json({ error: 'Usuario inactivo o bloqueado' })
    }

    const ok = await bcrypt.compare(contrasena, user.contrasena_hash)
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    await pool.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id_usuario = ?', [
      user.id_usuario,
    ])

    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo,
        rol: user.rol,
      },
    })
  } catch (error) {
    console.error('Error login:', error)
    if (process.env.FALLBACK_MOCK !== 'false') {
      const user = mock.usuarios.find((u) => u.correo === String(correo).toLowerCase())
      if (user && user.contrasena === contrasena) {
        const token = jwt.sign(
          { id: user.id_usuario, rol: user.rol },
          process.env.JWT_SECRET || 'demo',
          { expiresIn: '7d' }
        )
        return res.json({
          token,
          usuario: {
            id_usuario: user.id_usuario,
            nombres: user.nombres,
            apellidos: user.apellidos,
            correo: user.correo,
            rol: user.rol,
          },
        })
      }
    }
    res.status(500).json({ error: 'No se pudo iniciar sesión' })
  }
}

module.exports = { registrar, login }
