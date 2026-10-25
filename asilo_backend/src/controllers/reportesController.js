const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const obtenerResumen = async (req, res) => {
  try {
    const [
      pacientes, solicitudes, citas, laboratorio, farmacia, finanzas
    ] = await Promise.all([
      sequelize.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN estado='activo' THEN 1 ELSE 0 END) AS activos FROM paciente`, { type: QueryTypes.SELECT }),
      sequelize.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN estado='pendiente' THEN 1 ELSE 0 END) AS pendientes, SUM(CASE WHEN estado='atendida' THEN 1 ELSE 0 END) AS atendidas FROM solicitud`, { type: QueryTypes.SELECT }),
      sequelize.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN estado='programada' THEN 1 ELSE 0 END) AS programadas, SUM(CASE WHEN estado='completada' THEN 1 ELSE 0 END) AS completadas FROM cita`, { type: QueryTypes.SELECT }),
      sequelize.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN estado='pendiente' THEN 1 ELSE 0 END) AS pendientes, SUM(CASE WHEN estado='completado' THEN 1 ELSE 0 END) AS completados FROM laboratorio`, { type: QueryTypes.SELECT }),
      sequelize.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN estado='pendiente' THEN 1 ELSE 0 END) AS pendientes, SUM(CASE WHEN estado='entregado' THEN 1 ELSE 0 END) AS entregados FROM farmacia`, { type: QueryTypes.SELECT }),
      sequelize.query(`SELECT COALESCE(SUM(CASE WHEN tipo='cargo' THEN monto ELSE 0 END),0) AS total_cargos, COALESCE(SUM(CASE WHEN tipo='pago' THEN monto ELSE 0 END),0) AS total_cobrado, COALESCE(SUM(CASE WHEN tipo='donacion' THEN monto ELSE 0 END),0) AS total_donaciones FROM finanza`, { type: QueryTypes.SELECT }),
    ]);

    const fin = finanzas[0];
    res.json({
      pacientes_total:        parseInt(pacientes[0].total) || 0,
      pacientes_activos:      parseInt(pacientes[0].activos) || 0,
      solicitudes_total:      parseInt(solicitudes[0].total) || 0,
      solicitudes_pendientes: parseInt(solicitudes[0].pendientes) || 0,
      solicitudes_atendidas:  parseInt(solicitudes[0].atendidas) || 0,
      citas_total:            parseInt(citas[0].total) || 0,
      citas_programadas:      parseInt(citas[0].programadas) || 0,
      citas_completadas:      parseInt(citas[0].completadas) || 0,
      examenes_total:         parseInt(laboratorio[0].total) || 0,
      examenes_pendientes:    parseInt(laboratorio[0].pendientes) || 0,
      examenes_completados:   parseInt(laboratorio[0].completados) || 0,
      recetas_total:          parseInt(farmacia[0].total) || 0,
      recetas_pendientes:     parseInt(farmacia[0].pendientes) || 0,
      recetas_entregadas:     parseInt(farmacia[0].entregados) || 0,
      total_cargos:           parseFloat(fin.total_cargos) || 0,
      total_cobrado:          parseFloat(fin.total_cobrado) || 0,
      total_donaciones:       parseFloat(fin.total_donaciones) || 0,
      pendiente_cobro:        (parseFloat(fin.total_cargos) - parseFloat(fin.total_cobrado)) || 0,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener resumen', error: error.message });
  }
};

module.exports = { obtenerResumen };
