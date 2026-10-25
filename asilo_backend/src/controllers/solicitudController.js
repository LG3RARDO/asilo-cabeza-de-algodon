const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const obtenerSolicitudes = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT s.*, p.nombres AS paciente_nombre
       FROM solicitud s
       LEFT JOIN paciente p ON p.id_paciente = s.id_paciente
       ORDER BY s.fecha_solicitud DESC`,
      { type: QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener solicitudes', error: error.message });
  }
};

const obtenerSolicitudPorId = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT s.*, p.nombres AS paciente_nombre
       FROM solicitud s
       LEFT JOIN paciente p ON p.id_paciente = s.id_paciente
       WHERE s.id_solicitud = $1`,
      { bind: [req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener solicitud', error: error.message });
  }
};

const crearSolicitud = async (req, res) => {
  try {
    const { id_paciente, tipo_solicitud, descripcion, prioridad = 'normal' } = req.body;
    if (!id_paciente || !tipo_solicitud)
      return res.status(400).json({ mensaje: 'id_paciente y tipo_solicitud son obligatorios' });

    const rows = await sequelize.query(
      `INSERT INTO solicitud (id_paciente, tipo_solicitud, descripcion, prioridad)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      { bind: [id_paciente, tipo_solicitud, descripcion || null, prioridad], type: QueryTypes.SELECT }
    );
    res.status(201).json({ mensaje: 'Solicitud creada', solicitud: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear solicitud', error: error.message });
  }
};

const actualizarSolicitud = async (req, res) => {
  try {
    const { tipo_solicitud, descripcion, prioridad, estado } = req.body;
    const rows = await sequelize.query(
      `UPDATE solicitud SET
         tipo_solicitud = COALESCE($1, tipo_solicitud),
         descripcion    = COALESCE($2, descripcion),
         prioridad      = COALESCE($3, prioridad),
         estado         = COALESCE($4, estado)
       WHERE id_solicitud = $5 RETURNING *`,
      { bind: [tipo_solicitud||null, descripcion||null, prioridad||null, estado||null, req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    res.json({ mensaje: 'Solicitud actualizada', solicitud: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar solicitud', error: error.message });
  }
};

const cambiarEstadoSolicitud = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `UPDATE solicitud SET estado = $1 WHERE id_solicitud = $2 RETURNING *`,
      { bind: [req.body.estado, req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    res.json({ mensaje: 'Estado actualizado', solicitud: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar estado', error: error.message });
  }
};

const eliminarSolicitud = async (req, res) => {
  try {
    await sequelize.query(
      `DELETE FROM solicitud WHERE id_solicitud = $1`,
      { bind: [req.params.id], type: QueryTypes.DELETE }
    );
    res.json({ mensaje: 'Solicitud eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar solicitud', error: error.message });
  }
};

module.exports = { obtenerSolicitudes, obtenerSolicitudPorId, crearSolicitud, actualizarSolicitud, cambiarEstadoSolicitud, eliminarSolicitud };
