/**
 * Middleware para verificar rol del usuario autenticado.
 * Debe usarse DESPUÉS de verificarToken.
 * @param {...string} rolesPermitidos - Roles que tienen acceso a la ruta
 */
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'No autenticado' });
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: `Acceso denegado. Se requiere uno de los roles: ${rolesPermitidos.join(', ')}`,
        rol_actual: req.usuario.rol
      });
    }
    next();
  };
};

module.exports = verificarRol;
