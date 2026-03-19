#!/usr/bin/env python3
"""
Nasho Technologies Service Marketplace API - Python Flask Backend
Multi-service dispatch system supporting transport, delivery, repair, security, and medical services
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "dispatch_system.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ======================
# DATABASE MODELS
# ======================

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='Dispatcher')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class ServiceType(db.Model):
    __tablename__ = 'service_types'
    service_type_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(10))
    base_price = db.Column(db.Float, default=0)
    price_per_km = db.Column(db.Float, default=0)
    price_per_hour = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class ServiceProvider(db.Model):
    __tablename__ = 'service_providers'
    provider_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), unique=True)
    email = db.Column(db.String(100))
    service_type_id = db.Column(db.Integer, db.ForeignKey('service_types.service_type_id'))
    vehicle_info = db.Column(db.String(100))
    vehicle_registration = db.Column(db.String(20))
    vehicle_make = db.Column(db.String(50))
    vehicle_model = db.Column(db.String(50))
    vehicle_color = db.Column(db.String(20))
    status = db.Column(db.String(20), default='Offline')
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    rating = db.Column(db.Float, default=5.0)
    total_jobs = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    service_type = db.relationship('ServiceType', backref='providers')

class ServiceRequest(db.Model):
    __tablename__ = 'service_requests'
    request_id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100), nullable=False)
    user_phone = db.Column(db.String(20), nullable=False)
    user_email = db.Column(db.String(100))
    service_type_id = db.Column(db.Integer, db.ForeignKey('service_types.service_type_id'), nullable=False)
    description = db.Column(db.Text)
    pickup_location = db.Column(db.String(255))
    dropoff_location = db.Column(db.String(255))
    status = db.Column(db.String(20), default='Pending')
    provider_id = db.Column(db.Integer, db.ForeignKey('service_providers.provider_id'))
    scheduled_time = db.Column(db.DateTime)
    completed_time = db.Column(db.DateTime)
    distance_km = db.Column(db.Float)
    estimated_duration_minutes = db.Column(db.Float)
    actual_duration_minutes = db.Column(db.Float)
    base_price = db.Column(db.Float)
    additional_charges = db.Column(db.Float, default=0)
    total_price = db.Column(db.Float)
    tip_amount = db.Column(db.Float, default=0)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    service_type = db.relationship('ServiceType', backref='requests')
    provider = db.relationship('ServiceProvider', backref='requests')

class Communication(db.Model):
    __tablename__ = 'communications'
    communication_id = db.Column(db.Integer, primary_key=True)
    from_type = db.Column(db.String(20))
    from_id = db.Column(db.Integer)
    from_name = db.Column(db.String(100))
    from_phone = db.Column(db.String(20))
    to_phone = db.Column(db.String(20), nullable=False)
    to_name = db.Column(db.String(100))
    message_type = db.Column(db.String(20))
    message_body = db.Column(db.Text)
    method = db.Column(db.String(20))
    status = db.Column(db.String(20), default='Sent')
    request_id = db.Column(db.Integer, db.ForeignKey('service_requests.request_id'))
    provider_id = db.Column(db.Integer, db.ForeignKey('service_providers.provider_id'))
    twilio_id = db.Column(db.String(100))
    duration_seconds = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# ======================
# DATABASE SETUP
# ======================

def init_db():
    """Initialize database and create tables"""
    with app.app_context():
        db.create_all()
        
        # Check if we need to seed data
        if not User.query.first():
            # Create default admin user
            admin = User(username='admin', password_hash='admin', role='Admin')
            db.session.add(admin)
        
        if not ServiceType.query.first():
            # Create service types
            service_types = [
                ServiceType(name='Transport', description='Taxi and ride services', icon='🚗', base_price=5.00, price_per_km=1.50),
                ServiceType(name='Delivery', description='Package and item delivery', icon='📦', base_price=3.00, price_per_km=0.80),
                ServiceType(name='Repair', description='Home and vehicle repair services', icon='🔧', base_price=0, price_per_hour=25.00),
                ServiceType(name='Security', description='Security and protection services', icon='🛡️', base_price=0, price_per_hour=30.00),
                ServiceType(name='Medical', description='Medical assistance and emergency services', icon='🚑', base_price=50.00, price_per_km=2.00),
            ]
            db.session.add_all(service_types)
        
        # Add sample providers if none exist
        if not ServiceProvider.query.first():
            providers = [
                ServiceProvider(name='John Doe', phone='+263771000001', service_type_id=1, vehicle_info='Toyota Camry', status='Available', lat=-20.15, lng=28.58),
                ServiceProvider(name='Jane Smith', phone='+263771000002', service_type_id=1, vehicle_info='Ford Focus', status='Busy', lat=-20.17, lng=28.60),
                ServiceProvider(name='Quick Delivery', phone='+263771000003', service_type_id=2, vehicle_info='Delivery Van', status='Available', lat=-20.13, lng=28.55),
            ]
            db.session.add_all(providers)
        
        db.session.commit()
        print("✅ Database initialized successfully!")

# ======================
# HELPER FUNCTIONS
# ======================

def format_phone_number(phone):
    """Format phone number for Zimbabwe"""
    phone = phone.strip().replace(' ', '').replace('-', '')
    if phone.startswith('0'):
        phone = '+263' + phone[1:]
    elif not phone.startswith('+'):
        phone = '+263' + phone
    return phone

def send_whatsapp(phone, message):
    """Send WhatsApp message via Twilio"""
    try:
        from twilio.rest import Client
        from twilio.base.exceptions import TwilioRestException
        
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        twilio_phone = os.getenv('TWILIO_WHATSAPP_NUMBER')
        
        if not account_sid or not auth_token:
            return {'success': True, 'demo': True, 'message': 'Demo mode - Twilio not configured'}
        
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            from_=f'whatsapp:{twilio_phone}',
            body=message,
            to=f'whatsapp:{phone}'
        )
        return {'success': True, 'messageId': message.sid}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def send_sms(phone, message):
    """Send SMS via Twilio"""
    try:
        from twilio.rest import Client
        
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        twilio_phone = os.getenv('TWILIO_PHONE_NUMBER')
        
        if not account_sid or not auth_token:
            return {'success': True, 'demo': True, 'message': 'Demo mode - Twilio not configured'}
        
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=message,
            from_=twilio_phone,
            to=phone
        )
        return {'success': True, 'messageId': message.sid}
    except Exception as e:
        return {'success': False, 'error': str(e)}

# ======================
# API ROUTES
# ======================

@app.route('/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.password_hash == password:
        return jsonify({'success': True, 'message': 'Login successful!'})
    return jsonify({'success': False, 'message': 'Invalid credentials'})

@app.route('/services', methods=['GET'])
def get_services():
    """Get all service types"""
    services = ServiceType.query.order_by(ServiceType.name).all()
    return jsonify([{
        'service_type_id': s.service_type_id,
        'name': s.name,
        'description': s.description,
        'icon': s.icon,
        'base_price': s.base_price,
        'price_per_km': s.price_per_km,
        'price_per_hour': s.price_per_hour
    } for s in services])

@app.route('/providers', methods=['GET'])
def get_providers():
    """Get service providers with optional filter"""
    service_type = request.args.get('service_type')
    
    query = ServiceProvider.query.join(ServiceType)
    
    if service_type:
        query = query.filter(ServiceType.name == service_type)
    
    providers = query.order_by(ServiceProvider.name).all()
    
    return jsonify([{
        'provider_id': p.provider_id,
        'name': p.name,
        'phone': p.phone,
        'email': p.email,
        'service_type_id': p.service_type_id,
        'service_type_name': p.service_type.name if p.service_type else None,
        'service_type_icon': p.service_type.icon if p.service_type else None,
        'vehicle_info': p.vehicle_info,
        'vehicle_registration': p.vehicle_registration,
        'vehicle_make': p.vehicle_make,
        'vehicle_model': p.vehicle_model,
        'vehicle_color': p.vehicle_color,
        'status': p.status,
        'lat': p.lat,
        'lng': p.lng,
        'rating': p.rating,
        'total_jobs': p.total_jobs
    } for p in providers])

@app.route('/providers/<int:provider_id>/location', methods=['PUT'])
def update_provider_location(provider_id):
    """Update provider location"""
    data = request.get_json()
    provider = ServiceProvider.query.get(provider_id)
    
    if not provider:
        return jsonify({'error': 'Provider not found'}), 404
    
    provider.lat = data.get('lat')
    provider.lng = data.get('lng')
    provider.updated_at = datetime.datetime.utcnow()
    
    db.session.commit()
    return jsonify({'message': 'Location updated'})

@app.route('/providers/<int:provider_id>/status', methods=['PUT'])
def update_provider_status(provider_id):
    """Update provider status"""
    data = request.get_json()
    provider = ServiceProvider.query.get(provider_id)
    
    if not provider:
        return jsonify({'error': 'Provider not found'}), 404
    
    provider.status = data.get('status')
    provider.updated_at = datetime.datetime.utcnow()
    
    db.session.commit()
    return jsonify({'message': 'Status updated'})

@app.route('/requests', methods=['GET'])
def get_requests():
    """Get all service requests"""
    requests = ServiceRequest.query.order_by(ServiceRequest.created_at.desc()).all()
    
    return jsonify([{
        'request_id': r.request_id,
        'user_name': r.user_name,
        'user_phone': r.user_phone,
        'user_email': r.user_email,
        'service_type_id': r.service_type_id,
        'service_type_name': r.service_type.name if r.service_type else None,
        'service_type_icon': r.service_type.icon if r.service_type else None,
        'description': r.description,
        'pickup_location': r.pickup_location,
        'dropoff_location': r.dropoff_location,
        'status': r.status,
        'provider_id': r.provider_id,
        'provider_name': r.provider.name if r.provider else None,
        'provider_phone': r.provider.phone if r.provider else None,
        'notes': r.notes,
        'created_at': r.created_at.isoformat() if r.created_at else None,
        'updated_at': r.updated_at.isoformat() if r.updated_at else None
    } for r in requests])

@app.route('/requests', methods=['POST'])
def create_request():
    """Create a new service request"""
    data = request.get_json()
    
    # Validate required fields
    if not data.get('user_name') or not data.get('user_phone') or not data.get('service_type_id'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    new_request = ServiceRequest(
        user_name=data.get('user_name'),
        user_phone=data.get('user_phone'),
        user_email=data.get('user_email'),
        service_type_id=data.get('service_type_id'),
        description=data.get('description'),
        pickup_location=data.get('pickup_location'),
        dropoff_location=data.get('dropoff_location'),
        notes=data.get('notes')
    )
    
    db.session.add(new_request)
    db.session.commit()
    
    return jsonify({'message': 'Service request created', 'request_id': new_request.request_id})

@app.route('/requests/<int:request_id>/status', methods=['PUT'])
def update_request_status(request_id):
    """Update request status"""
    data = request.get_json()
    service_request = ServiceRequest.query.get(request_id)
    
    if not service_request:
        return jsonify({'error': 'Request not found'}), 404
    
    service_request.status = data.get('status')
    if data.get('provider_id'):
        service_request.provider_id = data.get('provider_id')
    service_request.updated_at = datetime.datetime.utcnow()
    
    db.session.commit()
    return jsonify({'message': 'Request status updated'})

# ======================
# COMMUNICATIONS ROUTES
# ======================

@app.route('/communicate/whatsapp', methods=['POST'])
def communicate_whatsapp():
    """Send WhatsApp message"""
    data = request.get_json()
    to_phone = format_phone_number(data.get('to_phone', ''))
    message = data.get('message', '')
    request_id = data.get('request_id')
    provider_id = data.get('provider_id')
    to_name = data.get('to_name')
    
    if not to_phone or not message:
        return jsonify({'error': 'Missing required fields'}), 400
    
    result = send_whatsapp(to_phone, message)
    
    if result.get('success'):
        # Log communication
        comm = Communication(
            from_type='dispatcher',
            from_name='Dispatcher',
            to_phone=to_phone,
            to_name=to_name,
            message_type='text',
            message_body=message,
            method='WhatsApp',
            status='Sent' if not result.get('demo') else 'Demo',
            request_id=request_id,
            provider_id=provider_id,
            twilio_id=result.get('messageId')
        )
        db.session.add(comm)
        db.session.commit()
    
    return jsonify(result)

@app.route('/communicate/sms', methods=['POST'])
def communicate_sms():
    """Send SMS"""
    data = request.get_json()
    to_phone = format_phone_number(data.get('to_phone', ''))
    message = data.get('message', '')
    request_id = data.get('request_id')
    provider_id = data.get('provider_id')
    to_name = data.get('to_name')
    
    if not to_phone or not message:
        return jsonify({'error': 'Missing required fields'}), 400
    
    result = send_sms(to_phone, message)
    
    if result.get('success'):
        # Log communication
        comm = Communication(
            from_type='dispatcher',
            from_name='Dispatcher',
            to_phone=to_phone,
            to_name=to_name,
            message_type='text',
            message_body=message,
            method='SMS',
            status='Sent' if not result.get('demo') else 'Demo',
            request_id=request_id,
            provider_id=provider_id,
            twilio_id=result.get('messageId')
        )
        db.session.add(comm)
        db.session.commit()
    
    return jsonify(result)

@app.route('/communicate/history', methods=['GET'])
def get_communication_history():
    """Get communication history"""
    request_id = request.args.get('request_id')
    provider_id = request.args.get('provider_id')
    limit = request.args.get('limit', 50, type=int)
    
    query = Communication.query
    
    if request_id:
        query = query.filter(Communication.request_id == request_id)
    elif provider_id:
        query = query.filter(Communication.provider_id == provider_id)
    
    communications = query.order_by(Communication.created_at.desc()).limit(limit).all()
    
    return jsonify([{
        'communication_id': c.communication_id,
        'from_name': c.from_name,
        'to_phone': c.to_phone,
        'to_name': c.to_name,
        'message_body': c.message_body,
        'method': c.method,
        'status': c.status,
        'created_at': c.created_at.isoformat() if c.created_at else None
    } for c in communications])

# ======================
# LEGACY ROUTES (Backward Compatibility)
# ======================

@app.route('/drivers', methods=['GET'])
def get_drivers():
    """Get drivers (legacy - Transport only)"""
    providers = ServiceProvider.query.join(ServiceType).filter(ServiceType.name == 'Transport').all()
    return jsonify([{
        'driver_id': p.provider_id,
        'name': p.name,
        'phone': p.phone,
        'email': p.email,
        'vehicle_info': p.vehicle_info,
        'vehicle_registration': p.vehicle_registration,
        'status': p.status,
        'lat': p.lat,
        'lng': p.lng
    } for p in providers])

@app.route('/drivers/<int:driver_id>/location', methods=['PUT'])
def update_driver_location(driver_id):
    """Update driver location (legacy)"""
    return update_provider_location(driver_id)

@app.route('/drivers/<int:driver_id>/status', methods=['PUT'])
def update_driver_status(driver_id):
    """Update driver status (legacy)"""
    return update_provider_status(driver_id)

@app.route('/trips', methods=['GET'])
def get_trips():
    """Get trips (legacy)"""
    return get_requests()

@app.route('/trips', methods=['POST'])
def create_trip():
    """Create trip (legacy)"""
    data = request.get_json()
    data['service_type_id'] = 1  # Transport
    return create_request()

@app.route('/trips/<int:trip_id>/status', methods=['PUT'])
def update_trip_status(trip_id):
    """Update trip status (legacy)"""
    return update_request_status(trip_id)

# ======================
# MAIN
# ======================

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    print("🚀 Nasho Technologies Service Marketplace API")
    print(f"📡 Running on http://localhost:5000")
    print("📋 Available services: Transport, Delivery, Repair, Security, Medical")
    
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True)
