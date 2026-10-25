const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const obtenerMovimientos = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT f.*, p.nombres AS paciente_nombre
       FROM finanza f
       LEFT JOIN paciente p ON p.id_paciente = f.id_paciente
       ORDER BY f.fecha DESC`,
      { type: QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener movimientos', error: error.message });
  }
};

const obtenerMovimientoPorId = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT f.*, p.nombres AS paciente_nombre
       FROM finanza f
       LEFT JOIN paciente p ON p.id_paciente = f.id_paciente
       WHERE f.id_finanza = $1`,
      { bind: [req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Movimiento no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener movimiento', error: error.message });
  }
};

const crearMovimiento = async (req, res) => {
  try {
    const { id_paciente, tipo, concepto, monto, fecha, notas } = req.body;
    if (!id_paciente || !tipo || monto == null)
      return res.status(400).json({ mensaje: 'id_paciente, tipo y monto son obligatorios' });

    const rows = await sequelize.query(
      `INSERT INTO finanza (id_paciente, tipo, concepto, monto, fecha, notas)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), $6) RETURNING *`,
      { bind: [id_paciente, tipo, concepto||null, parseFloat(monto), fecha||null, notas||null], type: QueryTypes.SELECT }
    );
    res.status(201).json({ mensaje: 'Movimiento creado', movimiento: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear movimiento', error: error.message });
  }
};

const actualizarMovimiento = async (req, res) => {
  try {
    const { tipo, concepto, monto, fecha, estado, notas } = req.body;
    const rows = await sequelize.query(
      `UPDATE finanza SET
         tipo    = COALESCE($1, tipo),
         concepto= COALESCE($2, concepto),
         monto   = COALESCE($3, monto),
         fecha   = COALESCE($4, fecha),
         estado  = COALESCE($5, estado),
         notas   = COALESCE($6, notas)
       WHERE id_finanza = $7 RETURNING *`,
      { bind: [tipo||null, concepto||null, monto!=null?parseFloat(monto):null, fecha||null, estado||null, notas||null, req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Movimiento no encontrado' });
    res.json({ mensaje: 'Movimiento actualizado', movimiento: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar movimiento', error: error.message });
  }
};

const cambiarEstadoMovimiento = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `UPDATE finanza SET estado = $1 WHERE id_finanza = $2 RETURNING *`,
      { bind: [req.body.estado, req.params.id], type: QueryTypes.SELECT }
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Movimiento no encontrado' });
    res.json({ mensaje: 'Estado actualizado', movimiento: rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar estado', error: error.message });
  }
};

const eliminarMovimiento = async (req, res) => {
  try {
    await sequelize.query(
      `DELETE FROM finanza WHERE id_finanza = $1`,
      { bind: [req.params.id], type: QueryTypes.DELETE }
    );
    res.json({ mensaje: 'Movimiento eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar movimiento', error: error.message });
  }
};

module.exports = { obtenerMovimientos, obtenerMovimientoPorId, crearMovimiento, actualizarMovimiento, cambiarEstadoMovimiento, eliminarMovimiento };
