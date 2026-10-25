require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ── Middlewares globales ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rutas ───────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/pacientes',   require('./routes/pacientes'));
app.use('/api/solicitudes', require('./routes/solicitudes'));
app.use('/api/citas',       require('./routes/citas'));
app.use('/api/laboratorio', require('./routes/laboratorio'));
app.use('/api/farmacia',    require('./routes/farmacia'));
app.use('/api/finanzas',    require('./routes/finanzas'));
app.use('/api/usuarios',    require('./routes/usuarios'));
app.use('/api/reportes',    require('./routes/reportes'));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 para rutas no definidas ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ mensaje: `Ruta ${req.method} ${req.path} no encontrada` });
});

// ── Arranque ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
