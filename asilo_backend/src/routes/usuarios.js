const express = require('express');
const router = express.Router();
const { obtenerUsuarios, obtenerUsuarioPorId, crearUsuario, actualizarUsuario, cambiarEstadoUsuario } = require('../controllers/usuarioController');
const { verificarToken } = require('../middlewares/auth');
const verificarRol = require('../middlewares/verificarRol');

// Solo administrador puede gestionar usuarios
router.get('/',              verificarToken, verificarRol('administrador'), obtenerUsuarios);
router.get('/:id',           verificarToken, verificarRol('administrador'), obtenerUsuarioPorId);
router.post('/',             verificarToken, verificarRol('administrador'), crearUsuario);
router.put('/:id',           verificarToken, verificarRol('administrador'), actualizarUsuario);
router.patch('/:id/estado',  verificarToken, verificarRol('administrador'), cambiarEstadoUsuario);

module.exports = router;
