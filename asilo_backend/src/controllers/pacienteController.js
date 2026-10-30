const Paciente = require('../models/paciente');

// Obtener todos los pacientes
const obtenerPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.findAll();
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener pacientes', error });
  }
};

// Obtener un paciente por ID
const obtenerPacientePorId = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) {
      return res.status(404).json({ mensaje: 'Paciente no encontrado' });
    }
    res.json(paciente);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener paciente', error });
  }
};

// Crear un paciente
const crearPaciente = async (req, res) => {
  try {
    const {
      codigo, nombres, fecha_nacimiento, fecha_ingreso,
      motivo_reclusion, psicopatologia, estado,
        nombre_familiar, correo_familiar
    } = req.body;

    const existe = await Paciente.findOne({ where: { codigo } });
    if (existe) {
      return res.status(400).json({ mensaje: 'Ya existe un paciente con ese código.' });
    }

    const nuevoPaciente = await Paciente.create({
      codigo, nombres, fecha_nacimiento, fecha_ingreso,
      motivo_reclusion, psicopatologia, estado,
      nombre_familiar, correo_familiar
    });

    res.status(201).json({ mensaje: 'Paciente registrado exitosamente.', paciente: nuevoPaciente });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear paciente', error });
  }
};

// Actualizar un paciente
const actualizarPaciente = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) {
      return res.status(404).json({ mensaje: 'Paciente no encontrado' });
    }

    await paciente.update(req.body);
    res.json({ mensaje: 'Paciente actualizado exitosamente.', paciente });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar paciente', error });
  }
};

// Cambiar estado del paciente
const cambiarEstado = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) {
      return res.status(404).json({ mensaje: 'Paciente no encontrado' });
    }

    await paciente.update({ estado: req.body.estado });
    res.json({ mensaje: 'Estado actualizado exitosamente.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar estado', error });
  }
};

module.exports = {
  obtenerPacientes,
  obtenerPacientePorId,
  crearPaciente,
  actualizarPaciente,
  cambiarEstado
};