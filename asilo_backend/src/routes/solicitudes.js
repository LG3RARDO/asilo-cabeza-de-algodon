const express = require('express');
const router = express.Router();
const { obtenerSolicitudes, obtenerSolicitudPorId, crearSolicitud, actualizarSolicitud, cambiarEstadoSolicitud, eliminarSolicitud } = require('../controllers/solicitudController');
const { verificarToken } = require('../middlewares/auth');
const verificarRol = require('../middlewares/verificarRol');

const ROLES = ['administrador', 'medico_general', 'medico_especialista'];

router.get('/',        verificarToken, verificarRol(...ROLES), obtenerSolicitudes);
router.get('/:id',     verificarToken, verificarRol(...ROLES), obtenerSolicitudPorId);
router.post('/',       verificarToken, verificarRol(...ROLES), crearSolicitud);
router.put('/:id',     verificarToken, verificarRol(...ROLES), actualizarSolicitud);
router.patch('/:id/estado', verificarToken, verificarRol(...ROLES), cambiarEstadoSolicitud);
router.delete('/:id',  verificarToken, verificarRol('administrador'), eliminarSolicitud);

module.exports = router;
