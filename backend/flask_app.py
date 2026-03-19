from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_PATH = './dispatch_system.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()
    
    if user and user['password_hash'] == password:
        return jsonify({'success': True, 'message': 'Login successful!'})
    return jsonify({'success': False, 'message': 'Invalid credentials'})

@app.route('/services', methods=['GET'])
def services():
    conn = get_db_connection()
    services = conn.execute("SELECT * FROM service_types").fetchall()
    conn.close()
    return jsonify([dict(service) for service in services])

@app.route('/providers', methods=['GET'])
def providers():
    service_type = request.args.get('service_type')
    conn = get_db_connection()
    
    if service_type:
        providers = conn.execute("""
            SELECT sp.*, st.name as service_type_name, st.icon as service_type_icon
            FROM service_providers sp
            JOIN service_types st ON sp.service_type_id = st.service_type_id
            WHERE st.name = ?
        """, (service_type,)).fetchall()
    else:
        providers = conn.execute("""
            SELECT sp.*, st.name as service_type_name, st.icon as service_type_icon
            FROM service_providers sp
            JOIN service_types st ON sp.service_type_id = st.service_type_id
        """).fetchall()
    
    conn.close()
    return jsonify([dict(provider) for provider in providers])

@app.route('/requests', methods=['GET'])
def requests():
    conn = get_db_connection()
    requests = conn.execute("""
        SELECT sr.*, st.name as service_type_name, st.icon as service_type_icon,
               sp.name as provider_name, sp.phone as provider_phone
        FROM service_requests sr
        JOIN service_types st ON sr.service_type_id = st.service_type_id
        LEFT JOIN service_providers sp ON sr.provider_id = sp.provider_id
        ORDER BY sr.created_at DESC
    """).fetchall()
    conn.close()
    return jsonify([dict(req) for req in requests])

@app.route('/requests', methods=['POST'])
def create_request():
    data = request.get_json()
    conn = get_db_connection()
    conn.execute("""
        INSERT INTO service_requests (user_name, user_phone, user_email, service_type_id, 
        description, pickup_location, dropoff_location, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (data.get('user_name'), data.get('user_phone'), data.get('user_email'),
          data.get('service_type_id'), data.get('description'),
          data.get('pickup_location'), data.get('dropoff_location'),
          data.get('notes')))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Service request created'})

@app.route('/requests/<int:request_id>/status', methods=['PUT'])
def update_request_status(request_id):
    data = request.get_json()
    status = data.get('status')
    provider_id = data.get('provider_id')
    conn = get_db_connection()
    conn.execute("UPDATE service_requests SET status = ?, provider_id = ?, updated_at = datetime('now') WHERE request_id = ?", 
                 (status, provider_id, request_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Request status updated'})

@app.route('/providers/<int:provider_id>/location', methods=['PUT'])
def update_provider_location(provider_id):
    data = request.get_json()
    conn = get_db_connection()
    conn.execute("UPDATE service_providers SET lat = ?, lng = ?, updated_at = datetime('now') WHERE provider_id = ?", 
                 (data.get('lat'), data.get('lng'), provider_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Location updated'})

@app.route('/providers/<int:provider_id>/status', methods=['PUT'])
def update_provider_status(provider_id):
    data = request.get_json()
    conn = get_db_connection()
    conn.execute("UPDATE service_providers SET status = ?, updated_at = datetime('now') WHERE provider_id = ?", 
                 (data.get('status'), provider_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Status updated'})

@app.route('/communicate/whatsapp', methods=['POST'])
def communicate_whatsapp():
    data = request.get_json()
    return jsonify({'success': True, 'message': 'WhatsApp sent (demo)', 'demo': True})

@app.route('/communicate/sms', methods=['POST'])
def communicate_sms():
    data = request.get_json()
    return jsonify({'success': True, 'message': 'SMS sent (demo)', 'demo': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)


