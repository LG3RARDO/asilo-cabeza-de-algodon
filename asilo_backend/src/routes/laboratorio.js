const express = require('express');
const router = express.Router();
const { obtenerExamenes, obtenerExamenPorId, crearExamen, actualizarExamen, eliminarExamen } = require('../controllers/laboratorioController');
const { verificarToken } = require('../middlewares/auth');
const verificarRol = require('../middlewares/verificarRol');

const ROLES = ['administrador', 'medico_general', 'medico_especialista', 'laboratorio'];

router.get('/',       verificarToken, verificarRol(...ROLES), obtenerExamenes);
router.get('/:id',    verificarToken, verificarRol(...ROLES), obtenerExamenPorId);
router.post('/',      verificarToken, verificarRol(...ROLES), crearExamen);
router.put('/:id',    verificarToken, verificarRol(...ROLES), actualizarExamen);
router.delete('/:id', verificarToken, verificarRol('administrador', 'laboratorio'), eliminarExamen);

module.exports = router;
