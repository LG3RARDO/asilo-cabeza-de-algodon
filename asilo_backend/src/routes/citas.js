const express = require('express');
const router = express.Router();
const { obtenerCitas, obtenerCitaPorId, crearCita, actualizarCita, eliminarCita } = require('../controllers/citaController');
const { verificarToken } = require('../middlewares/auth');
const verificarRol = require('../middlewares/verificarRol');

const ROLES = ['administrador', 'medico_general', 'medico_especialista'];

router.get('/',       verificarToken, verificarRol(...ROLES), obtenerCitas);
router.get('/:id',    verificarToken, verificarRol(...ROLES), obtenerCitaPorId);
router.post('/',      verificarToken, verificarRol(...ROLES), crearCita);
router.put('/:id',    verificarToken, verificarRol(...ROLES), actualizarCita);
router.delete('/:id', verificarToken, verificarRol('administrador'), eliminarCita);

module.exports = router;
