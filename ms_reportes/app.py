import os
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

try:
    import psycopg2
    import psycopg2.extras
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

app = Flask(__name__)
CORS(app)

# ─── Seguridad interna: API Key (SQA A03) ───────────────────────────────────
INTERNAL_API_KEY = os.environ.get('INTERNAL_API_KEY', 'clave-interna-asilo-2026')

def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.headers.get('X-API-Key') != INTERNAL_API_KEY:
            return jsonify({'error': 'No autorizado'}), 401
        return f(*args, **kwargs)
    return decorated

# ─── Conexión PostgreSQL ─────────────────────────────────────────────────────
DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_conn():
    if not HAS_PSYCOPG2 or not DATABASE_URL:
        return None
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f'DB Error: {e}')
        return None

def query_db(sql, params=None):
    conn = get_conn()
    if not conn:
        return None
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql, params or [])
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        print(f'Query Error: {e}')
        conn.close()
        return None

# ─── Endpoints ───────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'estado': 'ok', 'servicio': 'ms_reportes', 'db': bool(DATABASE_URL)}), 200

@app.route('/reportes/pacientes', methods=['GET'])
@require_api_key
def reporte_pacientes():
    estado = request.args.get('estado')
    rows = query_db(
        """SELECT p.id_paciente, p.codigo, p.nombres || ' ' || p.apellidos AS nombre,
                  p.fecha_ingreso, p.estado
           FROM paciente p
           WHERE ($1::text IS NULL OR p.estado = $1)
           ORDER BY p.nombres""",
        [estado]
    )
    if rows is None:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 503
    return jsonify({
        'reporte': 'Reporte de Pacientes — Asilo Cabeza de Algodón',
        'fecha_generacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'total': len(rows),
        'pacientes': rows
    }), 200

@app.route('/reportes/resumen', methods=['GET'])
@require_api_key
def reporte_resumen():
    rows = query_db(
        """SELECT
             COUNT(*) AS total,
             COUNT(*) FILTER (WHERE estado = 'activo') AS activos,
             COUNT(*) FILTER (WHERE estado = 'inactivo') AS inactivos
           FROM paciente"""
    )
    cuotas = query_db(
        "SELECT COALESCE(SUM(monto), 0) AS deuda_total FROM cuota_mensual WHERE estado = 'pendiente'"
    )
    if rows is None:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 503
    resumen = rows[0] if rows else {}
    resumen['deuda_total'] = float(cuotas[0]['deuda_total']) if cuotas else 0
    return jsonify({
        'reporte': 'Resumen General — Asilo Cabeza de Algodón',
        'fecha_generacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        **resumen
    }), 200

@app.route('/reportes/citas', methods=['GET'])
@require_api_key
def reporte_citas():
    rows = query_db(
        """SELECT c.id_cita, p.nombres || ' ' || p.apellidos AS paciente,
                  c.fecha, c.hora, c.tipo, c.estado
           FROM cita c
           JOIN paciente p ON p.id_paciente = c.id_paciente
           ORDER BY c.fecha DESC
           LIMIT 100"""
    )
    if rows is None:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 503
    return jsonify({
        'reporte': 'Reporte de Citas — Asilo Cabeza de Algodón',
        'fecha_generacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'total': len(rows),
        'citas': rows
    }), 200

if __name__ == '__main__':
    print("Microservicio de Reportes corriendo en puerto 5002")
    app.run(host='0.0.0.0', port=5002, debug=True)
