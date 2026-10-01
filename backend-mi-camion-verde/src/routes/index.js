const express = require('express');
const { listarZonas, listarBarrios, obtenerBarrio } = require('../controllers/barriosController');
const {
  horariosPorBarrio,
  proximasRecolecciones,
  resumenHoy,
} = require('../controllers/horariosController');
const { listarNovedades } = require('../controllers/novedadesController');
const { registrar, login } = require('../controllers/authController');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, servicio: 'EcoRuta API' });
});

router.get('/zonas', listarZonas);
router.get('/barrios', listarBarrios);
router.get('/barrios/:id', obtenerBarrio);

router.get('/barrios/:idBarrio/horarios', horariosPorBarrio);
router.get('/barrios/:idBarrio/proximas', proximasRecolecciones);
router.get('/barrios/:idBarrio/hoy', resumenHoy);

router.get('/novedades', listarNovedades);

router.post('/auth/registro', registrar);
router.post('/auth/login', login);

module.exports = router;
