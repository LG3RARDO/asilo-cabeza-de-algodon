import os
from dotenv import load_dotenv
load_dotenv()
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import psycopg2
import psycopg2.extras

app = Flask(__name__)
CORS(app)

# ─── Seguridad interna: API Key (SQA A03) ───────────────────────────────────
INTERNAL_API_KEY = os.environ.get('INTERNAL_API_KEY', 'clave-interna-asilo-2026')

def require_api_key(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.headers.get('X-API-Key') != INTERNAL_API_KEY:
            return jsonify({'error': 'No autorizado'}), 401
        return f(*args, **kwargs)
    return decorated


# ─── Config email (variables de entorno) ────────────────────────────────────
EMAIL_SENDER   = os.environ.get('EMAIL_SENDER',   '')   # tu Gmail
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD', '')   # contraseña de app Gmail
EMAIL_HOST     = os.environ.get('EMAIL_HOST',     'smtp.gmail.com')
EMAIL_PORT     = int(os.environ.get('EMAIL_PORT', '587'))

# ─── Config DB (opcional, para guardar historial) ───────────────────────────
DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_conn():
    if not DATABASE_URL:
        return None
    try:
        return psycopg2.connect(DATABASE_URL)
    except:
        return None

def init_db():
    conn = get_conn()
    if not conn:
        return
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS notificaciones_historial (
            id SERIAL PRIMARY KEY,
            tipo VARCHAR(50),
            paciente VARCHAR(200),
            destinatario VARCHAR(200),
            correo VARCHAR(200),
            asunto VARCHAR(300),
            mensaje TEXT,
            estado VARCHAR(20) DEFAULT 'enviado',
            fecha TIMESTAMP DEFAULT NOW()
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

# ─── Función de envío real ───────────────────────────────────────────────────
def enviar_email(destinatario, correo, asunto, cuerpo_html):
    if not EMAIL_SENDER or not EMAIL_PASSWORD:
        print(f"[SIMULADO] Email a {correo}: {asunto}")
        return True, "simulado"

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = asunto
        msg['From']    = f"Asilo Cabeza de Algodón <{EMAIL_SENDER}>"
        msg['To']      = correo

        part = MIMEText(cuerpo_html, 'html', 'utf-8')
        msg.attach(part)

        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, correo, msg.as_string())

        return True, "enviado"
    except Exception as e:
        print(f"[ERROR email] {e}")
        return False, str(e)

def guardar_historial(tipo, paciente, destinatario, correo, asunto, mensaje, estado):
    conn = get_conn()
    if not conn:
        return
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO notificaciones_historial
              (tipo, paciente, destinatario, correo, asunto, mensaje, estado)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, (tipo, paciente, destinatario, correo, asunto, mensaje, estado))
        conn.commit()
        cur.close()
    except Exception as e:
        print(f"[ERROR historial] {e}")
    finally:
        conn.close()

# ─── Templates HTML ──────────────────────────────────────────────────────────
def template_cambio_estado(paciente, estado, nombre_familiar):
    colores = {
        'Activo':   {'bg': '#d1fae5', 'border': '#10B981', 'text': '#065f46'},
        'Egresado': {'bg': '#fef3c7', 'border': '#F59E0B', 'text': '#92400e'},
        'Fallecido':{'bg': '#f1f5f9', 'border': '#475569', 'text': '#1e293b'},
    }
    c = colores.get(estado, colores['Activo'])
    iconos = {'Activo': '✅', 'Egresado': '🚪', 'Fallecido': '🕊️'}
    icono = iconos.get(estado, '📋')

    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc">
      <div style="background:#1e293b;padding:24px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px">🏥 Asilo Cabeza de Algodón</h1>
        <p style="color:#94a3b8;margin:6px 0 0;font-size:14px">Sistema de Notificaciones</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px">
        <p style="color:#374151;font-size:16px">Estimado/a <strong>{nombre_familiar}</strong>,</p>
        <p style="color:#6b7280;font-size:15px;line-height:1.6">
          Le informamos que el estado de su familiar residente en nuestro asilo ha sido actualizado.
        </p>
        <div style="background:#f1f5f9;border-radius:10px;padding:20px;margin:20px 0">
          <p style="margin:0 0 8px;color:#374151"><strong>👤 Paciente:</strong> {paciente}</p>
          <p style="margin:0">
            <strong>Estado actual:</strong>
            <span style="background:{c['bg']};border:1px solid {c['border']};color:{c['text']};
                         padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600">
              {icono} {estado}
            </span>
          </p>
        </div>
        <p style="color:#6b7280;font-size:14px;line-height:1.6">
          Si tiene alguna pregunta o desea más información, no dude en comunicarse con nosotros.<br>
          Estamos disponibles para atenderle.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0">
          Asilo de Ancianos Cabeza de Algodón · Sistema de Gestión v1.0
        </p>
      </div>
    </div>
    """

def template_cita(paciente, fecha_cita, tipo_cita, nombre_familiar):
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc">
      <div style="background:#1e293b;padding:24px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px">🏥 Asilo Cabeza de Algodón</h1>
        <p style="color:#94a3b8;margin:6px 0 0;font-size:14px">Recordatorio de Cita Médica</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px">
        <p style="color:#374151;font-size:16px">Estimado/a <strong>{nombre_familiar}</strong>,</p>
        <p style="color:#6b7280;font-size:15px;line-height:1.6">
          Se ha programado una cita médica para su familiar.
        </p>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px;margin:20px 0">
          <p style="margin:0 0 8px;color:#374151"><strong>👤 Paciente:</strong> {paciente}</p>
          <p style="margin:0 0 8px;color:#374151"><strong>📅 Fecha:</strong> {fecha_cita}</p>
          <p style="margin:0;color:#374151"><strong>🩺 Tipo:</strong> {tipo_cita}</p>
        </div>
        <p style="color:#6b7280;font-size:14px;line-height:1.6">
          Por favor, esté pendiente de la fecha indicada.<br>
          Si necesita reprogramar, comuníquese con nosotros con anticipación.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0">
          Asilo de Ancianos Cabeza de Algodón · Sistema de Gestión v1.0
        </p>
      </div>
    </div>
    """

# ─── Endpoints ───────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'email_configurado': bool(EMAIL_SENDER)}), 200

@app.route('/notificaciones/cambio-estado', methods=['POST'])
@require_api_key
def notif_cambio_estado():
    datos = request.get_json()
    paciente       = datos.get('paciente', '')
    estado         = datos.get('estado', '')
    nombre_familiar = datos.get('nombre_familiar', 'Familiar')
    correo         = datos.get('correo_familiar', '')

    if not correo:
        return jsonify({'error': 'correo_familiar es requerido'}), 400

    asunto = f"Actualización de estado: {paciente} — Asilo Cabeza de Algodón"
    cuerpo = template_cambio_estado(paciente, estado, nombre_familiar)

    ok, detalle = enviar_email(nombre_familiar, correo, asunto, cuerpo)
    guardar_historial('cambio_estado', paciente, nombre_familiar, correo, asunto, cuerpo,
                      'enviado' if ok else 'error')

    if ok:
        return jsonify({'mensaje': 'Notificación enviada', 'detalle': detalle}), 200
    else:
        return jsonify({'error': 'No se pudo enviar', 'detalle': detalle}), 500

@app.route('/notificaciones/cita', methods=['POST'])
@require_api_key
def notif_cita():
    datos = request.get_json()
    paciente       = datos.get('paciente', '')
    fecha_cita     = datos.get('fecha_cita', '')
    tipo_cita      = datos.get('tipo_cita', 'Consulta general')
    nombre_familiar = datos.get('nombre_familiar', 'Familiar')
    correo         = datos.get('correo_familiar', '')

    if not correo:
        return jsonify({'error': 'correo_familiar es requerido'}), 400

    asunto = f"Cita médica programada: {paciente} — Asilo Cabeza de Algodón"
    cuerpo = template_cita(paciente, fecha_cita, tipo_cita, nombre_familiar)

    ok, detalle = enviar_email(nombre_familiar, correo, asunto, cuerpo)
    guardar_historial('cita', paciente, nombre_familiar, correo, asunto, cuerpo,
                      'enviado' if ok else 'error')

    if ok:
        return jsonify({'mensaje': 'Notificación de cita enviada', 'detalle': detalle}), 200
    else:
        return jsonify({'error': 'No se pudo enviar', 'detalle': detalle}), 500

@app.route('/notificaciones/enviar', methods=['POST'])
@require_api_key
def enviar_notificacion():
    """Endpoint genérico (compatible con el original)"""
    datos = request.get_json()
    paciente       = datos.get('paciente', '')
    nombre_familiar = datos.get('familiar', datos.get('nombre_familiar', 'Familiar'))
    correo         = datos.get('correo', datos.get('correo_familiar', ''))
    mensaje_custom = datos.get('mensaje', '')

    asunto = f"Notificación del Asilo Cabeza de Algodón"
    cuerpo = mensaje_custom or template_cambio_estado(paciente, 'Activo', nombre_familiar)

    ok, detalle = enviar_email(nombre_familiar, correo, asunto, cuerpo)
    guardar_historial('general', paciente, nombre_familiar, correo, asunto, cuerpo,
                      'enviado' if ok else 'error')

    return jsonify({
        'mensaje': 'Notificación procesada',
        'enviado': ok,
        'detalle': detalle
    }), 200 if ok else 500

@app.route('/notificaciones', methods=['GET'])
def listar_notificaciones():
    conn = get_conn()
    if not conn:
        return jsonify({'total': 0, 'notificaciones': [], 'nota': 'Sin DB configurada'}), 200
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM notificaciones_historial ORDER BY fecha DESC LIMIT 100")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({'total': len(rows), 'notificaciones': [dict(r) for r in rows]}), 200

if __name__ == '__main__':
    init_db()
    print("=" * 50)
    print("  Microservicio de Notificaciones — Puerto 5001")
    print(f"  Email sender: {EMAIL_SENDER or 'NO CONFIGURADO (modo simulación)'}")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5001, debug=True)
