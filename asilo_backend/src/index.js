const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { conectarDB } = require('./config/database');
const pacientesRouter = require('./routes/pacientes');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/pacientes', pacientesRouter);
app.use('/api/auth', authRouter);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API Sistema Asilo Cabeza de Algodón funcionando',
    version: '1.0.0'
  });
});

// Iniciar servidor
const iniciar = async () => {
  await conectarDB();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

iniciar();
