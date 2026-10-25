const express = require('express');
const router = express.Router();
const { obtenerResumen } = require('../controllers/reportesController');
const { verificarToken } = require('../middlewares/auth');
const verificarRol = require('../middlewares/verificarRol');

router.get('/resumen', verificarToken, verificarRol('administrador', 'fundacion'), obtenerResumen);

module.exports = router;
