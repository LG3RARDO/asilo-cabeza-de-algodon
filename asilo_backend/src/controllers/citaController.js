const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const obtenerCitas = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT c.*, p.nombres AS paciente_nombre
       FROM cita c
       LEFT JOIN paciente p ON p.id_paciente = c.id_paciente
       ORDER BY c.fecha DESC, c.hora DESC`,
      { type: QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener citas', error: error.message });
  }
};

const obtenerCitaPorId = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT c.*, p.nombres AS paciente_nombre
       FROM cita c
       LEFT JOIN paciente p ON p.id_paciente = c.id_paciente
       WHERE c.id_cita = $1`,
      { bind: [req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Cita no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener cita', error: error.message });
  }
};

const crearCita = async (req, res) => {
  try {
    const { id_paciente, fecha, hora, tipo = 'Consulta general', medico, observaciones } = req.body;
    if (!id_paciente || !fecha || !hora)
      return res.status(400).json({ mensaje: 'id_paciente, fecha y hora son obligatorios' });

    const rows = await sequelize.query(
      `INSERT INTO cita (id_paciente, fecha, hora, tipo, medico, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      { bind: [id_paciente, fecha, hora, tipo, medico||null, observaciones||null], type: QueryTypes.SELECT }
    );
    res.status(201).json({ mensaje: 'Cita creada', cita: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear cita', error: error.message });
  }
};

const actualizarCita = async (req, res) => {
  try {
    const { fecha, hora, tipo, medico, observaciones, estado } = req.body;
    const rows = await sequelize.query(
      `UPDATE cita SET
         fecha         = COALESCE($1, fecha),
         hora          = COALESCE($2, hora),
         tipo          = COALESCE($3, tipo),
         medico        = COALESCE($4, medico),
         observaciones = COALESCE($5, observaciones),
         estado        = COALESCE($6, estado)
       WHERE id_cita = $7 RETURNING *`,
      { bind: [fecha||null, hora||null, tipo||null, medico||null, observaciones||null, estado||null, req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Cita no encontrada' });
    res.json({ mensaje: 'Cita actualizada', cita: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar cita', error: error.message });
  }
};

const eliminarCita = async (req, res) => {
  try {
    await sequelize.query(
      `DELETE FROM cita WHERE id_cita = $1`,
      { bind: [req.params.id], type: QueryTypes.DELETE }
    );
    res.json({ mensaje: 'Cita eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar cita', error: error.message });
  }
};

module.exports = { obtenerCitas, obtenerCitaPorId, crearCita, actualizarCita, eliminarCita };
