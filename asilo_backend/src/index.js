const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { conectarDB } = require('./config/database');
const pacientesRouter = require('./routes/pacientes');
const authRouter = require('./routes/auth');
const solicitudesRouter = require('./routes/solicitudes');
const citasRouter = require('./routes/citas');
const laboratorioRouter = require('./routes/laboratorio');
const farmaciaRouter = require('./routes/farmacia');
const finanzasRouter = require('./routes/finanzas');
const usuariosRouter = require('./routes/usuarios');
const reportesRouter = require('./routes/reportes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',        authRouter);
app.use('/api/pacientes',   pacientesRouter);
app.use('/api/solicitudes', solicitudesRouter);
app.use('/api/citas',       citasRouter);
app.use('/api/laboratorio', laboratorioRouter);
app.use('/api/farmacia',    farmaciaRouter);
app.use('/api/finanzas',    finanzasRouter);
app.use('/api/usuarios',    usuariosRouter);
app.use('/api/reportes',    reportesRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Sistema Asilo Cabeza de Algodón funcionando', version: '1.0.0' });
});

const iniciar = async () => {
  await conectarDB();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

iniciar();