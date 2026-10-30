const express = require('express');
const router = express.Router();
const { registrar, login, verificarSesion } = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Rutas de autenticación
// POST /auth/registrar — solo administradores pueden crear usuarios (SQA A01)
router.post('/registrar', verificarToken, verificarRol('admin'), registrar);
router.post('/login', login);
router.get('/sesion', verificarToken, verificarSesion);

module.exports = router;
