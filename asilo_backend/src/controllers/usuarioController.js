const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const rolesValidos = ['administrador', 'medico_general', 'fundacion', 'medico_especialista', 'laboratorio', 'farmacia'];

const obtenerUsuarios = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT u.id_usuario, u.correo, u.estado, r.nombre AS rol
       FROM usuario u
       LEFT JOIN rol r ON r.id_rol = u.id_rol
       ORDER BY u.id_usuario ASC`,
      { type: QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT u.id_usuario, u.correo, u.estado, r.nombre AS rol
       FROM usuario u
       LEFT JOIN rol r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = $1`,
      { bind: [req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuario', error: error.message });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const { correo, contrasena, rol } = req.body;
    if (!correo || !contrasena || !rol)
      return res.status(400).json({ mensaje: 'correo, contrasena y rol son obligatorios' });
    if (!rolesValidos.includes(rol))
      return res.status(400).json({ mensaje: `Rol inválido. Válidos: ${rolesValidos.join(', ')}` });

    // Verificar correo duplicado
    const existe = await sequelize.query(
      `SELECT id_usuario FROM usuario WHERE correo = $1`,
      { bind: [correo], type: QueryTypes.SELECT }
    );
    if (existe.length) return res.status(400).json({ mensaje: 'El correo ya está registrado' });

    // Obtener id_rol
    const rolRow = await sequelize.query(
      `SELECT id_rol FROM rol WHERE nombre = $1`,
      { bind: [rol], type: QueryTypes.SELECT }
    );
    if (!rolRow.length) return res.status(400).json({ mensaje: 'Rol no encontrado en la base de datos' });

    const contrasena_hash = await bcrypt.hash(contrasena, 10);
    const rows = await sequelize.query(
      `INSERT INTO usuario (correo, contrasena_hash, id_rol, estado)
       VALUES ($1, $2, $3, 'activo') RETURNING id_usuario, correo, estado`,
      { bind: [correo, contrasena_hash, rolRow[0].id_rol], type: QueryTypes.SELECT }
    );
    res.status(201).json({ mensaje: 'Usuario creado', usuario: { ...rows[0], rol } });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear usuario', error: error.message });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { correo, contrasena, rol } = req.body;
    let id_rol = null;

    if (rol) {
      if (!rolesValidos.includes(rol))
        return res.status(400).json({ mensaje: `Rol inválido. Válidos: ${rolesValidos.join(', ')}` });
      const rolRow = await sequelize.query(
        `SELECT id_rol FROM rol WHERE nombre = $1`,
        { bind: [rol], type: QueryTypes.SELECT }
      );
      if (rolRow.length) id_rol = rolRow[0].id_rol;
    }

    let contrasena_hash = null;
    if (contrasena) contrasena_hash = await bcrypt.hash(contrasena, 10);

    const rows = await sequelize.query(
      `UPDATE usuario SET
         correo          = COALESCE($1, correo),
         contrasena_hash = COALESCE($2, contrasena_hash),
         id_rol          = COALESCE($3, id_rol)
       WHERE id_usuario = $4
       RETURNING id_usuario, correo, estado`,
      { bind: [correo||null, contrasena_hash, id_rol, req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario actualizado', usuario: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
};

const cambiarEstadoUsuario = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `UPDATE usuario SET estado = $1 WHERE id_usuario = $2 RETURNING id_usuario, correo, estado`,
      { bind: [req.body.estado, req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Estado actualizado', usuario: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar estado', error: error.message });
  }
};

module.exports = { obtenerUsuarios, obtenerUsuarioPorId, crearUsuario, actualizarUsuario, cambiarEstadoUsuario };
