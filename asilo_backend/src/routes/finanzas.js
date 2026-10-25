const express = require('express');
const router = express.Router();
const { obtenerMovimientos, obtenerMovimientoPorId, crearMovimiento, actualizarMovimiento, cambiarEstadoMovimiento, eliminarMovimiento } = require('../controllers/finanzasController');
const { verificarToken } = require('../middlewares/auth');
const verificarRol = require('../middlewares/verificarRol');

const ROLES = ['administrador', 'fundacion'];

router.get('/',              verificarToken, verificarRol(...ROLES), obtenerMovimientos);
router.get('/:id',           verificarToken, verificarRol(...ROLES), obtenerMovimientoPorId);
router.post('/',             verificarToken, verificarRol(...ROLES), crearMovimiento);
router.put('/:id',           verificarToken, verificarRol(...ROLES), actualizarMovimiento);
router.patch('/:id/estado',  verificarToken, verificarRol(...ROLES), cambiarEstadoMovimiento);
router.delete('/:id',        verificarToken, verificarRol('administrador'), eliminarMovimiento);

module.exports = router;
