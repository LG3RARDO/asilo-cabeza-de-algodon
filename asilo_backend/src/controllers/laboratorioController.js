const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const obtenerExamenes = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT l.*, p.nombres AS paciente_nombre
       FROM laboratorio l
       LEFT JOIN paciente p ON p.id_paciente = l.id_paciente
       ORDER BY l.fecha_solicitud DESC`,
      { type: QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener exámenes', error: error.message });
  }
};

const obtenerExamenPorId = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT l.*, p.nombres AS paciente_nombre
       FROM laboratorio l
       LEFT JOIN paciente p ON p.id_paciente = l.id_paciente
       WHERE l.id_laboratorio = $1`,
      { bind: [req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Examen no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener examen', error: error.message });
  }
};

const crearExamen = async (req, res) => {
  try {
    const { id_paciente, tipo_examen, fecha_solicitud, observaciones } = req.body;
    if (!id_paciente || !tipo_examen || !fecha_solicitud)
      return res.status(400).json({ mensaje: 'id_paciente, tipo_examen y fecha_solicitud son obligatorios' });

    const rows = await sequelize.query(
      `INSERT INTO laboratorio (id_paciente, tipo_examen, fecha_solicitud, observaciones)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      { bind: [id_paciente, tipo_examen, fecha_solicitud, observaciones||null], type: QueryTypes.SELECT }
    );
    res.status(201).json({ mensaje: 'Examen creado', examen: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear examen', error: error.message });
  }
};

const actualizarExamen = async (req, res) => {
  try {
    const { tipo_examen, fecha_solicitud, fecha_resultado, resultado, observaciones, estado } = req.body;
    const rows = await sequelize.query(
      `UPDATE laboratorio SET
         tipo_examen     = COALESCE($1, tipo_examen),
         fecha_solicitud = COALESCE($2, fecha_solicitud),
         fecha_resultado = COALESCE($3, fecha_resultado),
         resultado       = COALESCE($4, resultado),
         observaciones   = COALESCE($5, observaciones),
         estado          = COALESCE($6, estado)
       WHERE id_laboratorio = $7 RETURNING *`,
      { bind: [tipo_examen||null, fecha_solicitud||null, fecha_resultado||null, resultado||null, observaciones||null, estado||null, req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Examen no encontrado' });
    res.json({ mensaje: 'Examen actualizado', examen: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar examen', error: error.message });
  }
};

const eliminarExamen = async (req, res) => {
  try {
    await sequelize.query(
      `DELETE FROM laboratorio WHERE id_laboratorio = $1`,
      { bind: [req.params.id], type: QueryTypes.DELETE }
    );
    res.json({ mensaje: 'Examen eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar examen', error: error.message });
  }
};

module.exports = { obtenerExamenes, obtenerExamenPorId, crearExamen, actualizarExamen, eliminarExamen };
