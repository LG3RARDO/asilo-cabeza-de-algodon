const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const obtenerRecetas = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT f.*, p.nombres AS paciente_nombre
       FROM farmacia f
       LEFT JOIN paciente p ON p.id_paciente = f.id_paciente
       ORDER BY f.fecha_prescripcion DESC`,
      { type: QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener recetas', error: error.message });
  }
};

const obtenerRecetaPorId = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT f.*, p.nombres AS paciente_nombre
       FROM farmacia f
       LEFT JOIN paciente p ON p.id_paciente = f.id_paciente
       WHERE f.id_farmacia = $1`,
      { bind: [req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Receta no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener receta', error: error.message });
  }
};

const crearReceta = async (req, res) => {
  try {
    const { id_paciente, medicamento, dosis, frecuencia, duracion, medico_prescribe, fecha_prescripcion, costo = 0 } = req.body;
    if (!id_paciente || !medicamento)
      return res.status(400).json({ mensaje: 'id_paciente y medicamento son obligatorios' });

    const rows = await sequelize.query(
      `INSERT INTO farmacia (id_paciente, medicamento, dosis, frecuencia, duracion, medico_prescribe, fecha_prescripcion, costo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      { bind: [id_paciente, medicamento, dosis||null, frecuencia||null, duracion||null, medico_prescribe||null, fecha_prescripcion||null, parseFloat(costo)], type: QueryTypes.SELECT }
    );
    res.status(201).json({ mensaje: 'Receta creada', receta: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear receta', error: error.message });
  }
};

const actualizarReceta = async (req, res) => {
  try {
    const { medicamento, dosis, frecuencia, duracion, medico_prescribe, fecha_prescripcion, estado, costo } = req.body;
    const rows = await sequelize.query(
      `UPDATE farmacia SET
         medicamento       = COALESCE($1, medicamento),
         dosis             = COALESCE($2, dosis),
         frecuencia        = COALESCE($3, frecuencia),
         duracion          = COALESCE($4, duracion),
         medico_prescribe  = COALESCE($5, medico_prescribe),
         fecha_prescripcion= COALESCE($6, fecha_prescripcion),
         estado            = COALESCE($7, estado),
         costo             = COALESCE($8, costo)
       WHERE id_farmacia = $9 RETURNING *`,
      { bind: [medicamento||null, dosis||null, frecuencia||null, duracion||null, medico_prescribe||null, fecha_prescripcion||null, estado||null, costo!=null?parseFloat(costo):null, req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Receta no encontrada' });
    res.json({ mensaje: 'Receta actualizada', receta: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar receta', error: error.message });
  }
};

const cambiarEstadoReceta = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `UPDATE farmacia SET estado = $1 WHERE id_farmacia = $2 RETURNING *`,
      { bind: [req.body.estado, req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Receta no encontrada' });
    res.json({ mensaje: 'Estado actualizado', receta: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar estado', error: error.message });
  }
};

const eliminarReceta = async (req, res) => {
  try {
    await sequelize.query(
      `DELETE FROM farmacia WHERE id_farmacia = $1`,
      { bind: [req.params.id], type: QueryTypes.DELETE }
    );
    res.json({ mensaje: 'Receta eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar receta', error: error.message });
  }
};

module.exports = { obtenerRecetas, obtenerRecetaPorId, crearReceta, actualizarReceta, cambiarEstadoReceta, eliminarReceta };
