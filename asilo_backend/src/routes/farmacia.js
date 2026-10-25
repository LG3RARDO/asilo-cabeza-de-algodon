const express = require('express');
const router = express.Router();
const { obtenerRecetas, obtenerRecetaPorId, crearReceta, actualizarReceta, cambiarEstadoReceta, eliminarReceta } = require('../controllers/farmaciaController');
const { verificarToken } = require('../middlewares/auth');
const verificarRol = require('../middlewares/verificarRol');

const ROLES = ['administrador', 'medico_general', 'medico_especialista', 'farmacia'];

router.get('/',              verificarToken, verificarRol(...ROLES), obtenerRecetas);
router.get('/:id',           verificarToken, verificarRol(...ROLES), obtenerRecetaPorId);
router.post('/',             verificarToken, verificarRol(...ROLES), crearReceta);
router.put('/:id',           verificarToken, verificarRol(...ROLES), actualizarReceta);
router.patch('/:id/estado',  verificarToken, verificarRol(...ROLES), cambiarEstadoReceta);
router.delete('/:id',        verificarToken, verificarRol('administrador', 'farmacia'), eliminarReceta);

module.exports = router;
