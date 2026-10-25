const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
require('dotenv').config();
 
// Registrar usuario
const registrar = async (req, res) => {
  try {
    const { correo, contrasena, id_rol } = req.body;
 
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }
 
    const salt = await bcrypt.genSalt(10);
    const contrasena_hash = await bcrypt.hash(contrasena, salt);
 
    const usuario = await Usuario.create({
      correo,
      contrasena_hash,
      id_rol,
      estado: 'activo'
    });
 
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente.',
      usuario: { id: usuario.id_usuario, correo: usuario.correo }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error });
  }
};
 
// Iniciar sesión
const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
 
    // Buscar usuario con nombre de rol
    const rows = await sequelize.query(
      `SELECT u.id_usuario, u.correo, u.contrasena_hash, u.estado, r.nombre AS rol
       FROM usuario u
       LEFT JOIN rol r ON r.id_rol = u.id_rol
       WHERE u.correo = $1`,
      { bind: [correo], type: QueryTypes.SELECT }
    );
 
    if (!rows.length) {
      return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos.' });
    }
 
    const usuario = rows[0];
 
    if (usuario.estado !== 'activo') {
      return res.status(403).json({ mensaje: 'Usuario inactivo. Contacte al administrador.' });
    }
 
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!contrasenaValida) {
      return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos.' });
    }
 
    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        correo: usuario.correo,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
 
    res.json({
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id: usuario.id_usuario,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error });
  }
};
 
// Verificar token
const verificarSesion = async (req, res) => {
  try {
    res.json({
      mensaje: 'Sesión válida.',
      usuario: req.usuario
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al verificar sesión', error });
  }
};
 
module.exports = { registrar, login, verificarSesion };