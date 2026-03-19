# 📱 Communications Integration Guide
## WhatsApp, SMS & Phone Call Setup

### Overview
Your service marketplace now includes integrated communications via Twilio:
- 📲 WhatsApp messaging
- 💬 SMS messaging
- ☎️ Phone calls
- 📞 Automated notifications

---

## ✅ Quick Start (Demo Mode)

The system runs in **demo mode** by default. All communications are logged but not actually sent.

### Test the API:

**Send WhatsApp Message:**
```bash
curl -X POST http://localhost:3000/communicate/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to_phone": "0782944287",
    "message": "Hello! This is a test message",
    "to_name": "Provider Name"
  }'
```

**Send SMS:**
```bash
curl -X POST http://localhost:3000/communicate/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to_phone": "0782944287",
    "message": "Hello! This is a test SMS",
    "to_name": "Provider Name"
  }'
```

**Send Auto-Notification (WhatsApp fallback to SMS):**
```bash
curl -X POST http://localhost:3000/communicate/notify \
  -H "Content-Type: application/json" \
  -d '{
    "to_phone": "0782944287",
    "message": "Your request has been accepted!",
    "request_id": 1
  }'
```

---

## 🔧 Production Setup (Enable Real Twilio)

### Step 1: Get Twilio Credentials
1. Sign up: https://www.twilio.com/console
2. Get your **Account SID** and **Auth Token**
3. Get a Twilio phone number
4. Optional: Enable WhatsApp sandbox

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your Twilio credentials:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
ENABLE_COMMUNICATIONS=true
```

### Step 3: Install Dependencies
```bash
npm install twilio dotenv
```

### Step 4: Restart Server
```bash
node backend/server-marketplace.js
```

---

## 📡 API Endpoints

### Communication Endpoints

#### 1. Send WhatsApp Message
**POST** `/communicate/whatsapp`

Request:
```json
{
  "to_phone": "0782944287",
  "message": "Your message here",
  "request_id": 1,
  "provider_id": 5,
  "to_name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "message": "WhatsApp message sent",
  "messageId": "SMxxxxxxxxxxxxxxxx"
}
```

#### 2. Send SMS
**POST** `/communicate/sms`

Same request/response format as WhatsApp

#### 3. Auto-Notify (Smart Selection)
**POST** `/communicate/notify`

Automatically sends via WhatsApp if available, falls back to SMS.

#### 4. Notify Provider of Request
**POST** `/communicate/notify-request`

```json
{
  "provider_id": 5,
  "request_id": 1
}
```

Automatically formats and sends provider notification with request details.

#### 5. Notify Customer of Assignment
**POST** `/communicate/notify-assignment`

```json
{
  "request_id": 1,
  "provider_id": 5
}
```

Notifies customer that a provider has been assigned.

#### 6. Get Communication History
**GET** `/communicate/history?request_id=1&limit=50`

Returns all communications for a request or provider.

#### 7. Get Communication Statistics
**GET** `/communicate/stats`

Returns message counts and status by communication method.

---

## 🎨 Frontend Features

### In the Dashboard:

**Message Icon Menu** (for customers):
- 📱 WhatsApp - Direct WhatsApp message
- 💬 SMS - Direct SMS message

**Provider Menu**:
- 📱 WhatsApp - Contact provider
- 💬 SMS - Contact provider  
- ☎️ Call - Dial provider directly

### Database Tracking:
All communications are automatically logged in the `communications` table:
- Timestamp
- Direction (dispatcher, customer, provider)
- Phone numbers
- Message content
- Status
- Twilio message ID

---

## 💡 Usage Examples

### Example 1: Notify Provider of New Request
```javascript
// Automatically calls this endpoint when request is created
fetch('/communicate/notify-request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider_id: 7,
    request_id: 42
  })
});
```

Message sent to provider:
```
🔔 New Transport Request!
Customer: John Doe
Phone: 0787654321
Location: 123 Main Street, Bulawayo
Reply to accept the job!
```

### Example 2: Send Custom Message
```javascript
fetch('/communicate/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to_phone: '0782944287',
    message: 'Your delivery is on the way! ETA: 15 minutes',
    request_id: 42,
    to_name: 'Sarah Johnson'
  })
});
```

### Example 3: Broadcast Message
```javascript
const providers = ['0782944287', '0771234567', '0789876543'];

providers.forEach(phone => {
  fetch('/communicate/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to_phone: phone,
      message: 'New delivery jobs available in your area!',
      to_name: 'Provider'
    })
  });
});
```

---

## 🔐 Phone Number Formatting

The system automatically formats phone numbers:
- **278294287** → 263782944287 (adds Zimbabwe country code)
- **+263782944287** → 263782944287 (removes +)
- **263782944287** → 263782944287 (keeps as is)
- **0782944287** → 263782944287 (0 replaced with 263)

---

## 📊 Communication History

View all past communications:
```bash
curl http://localhost:3000/communicate/history?request_id=1
```

Response:
```json
[
  {
    "communication_id": 1,
    "from_type": "dispatcher",
    "to_phone": "0782944287",
    "to_name": "Provider",
    "message_body": "New request available",
    "method": "WhatsApp",
    "status": "Sent",
    "created_at": "2026-03-10 12:45:30"
  }
]
```

---

## ☁️ Free Cloud Hosting Options

The project includes configuration files for popular free Node.js hosts. You can deploy the application quickly using any of the following services:

- **Render** (render.com) – uses `render.yaml`.
- **Railway** (railway.app) – uses `railway.json`.
- **Vercel** (vercel.com) – uses `vercel.json`.

Each file is already committed to the repository; simply connect your GitHub account to the chosen service and let it detect the configuration. Remember to add your Twilio credentials as environment variables or secrets in the platform dashboard.

### Render Setup
1. Sign in and create a new **Web Service**.
2. Connect your repository and let Render read `render.yaml`.
3. Provide environment variables (TWILIO_* and any others).
4. Push to Git and Render will build & deploy automatically.

### Railway Setup
1. Create a project, import the repo, and select `railway.json` if prompted.
2. Railway auto-detects Node and uses the provided start command.
3. Set env vars in the project dashboard and deploy.

### Vercel Setup
1. Import the repo on vercel.com.
2. Vercel uses `vercel.json` to run your server as a function.
3. Add environment variables in the project settings.
4. Deploy and test your endpoints via the generated domain.

These hosting providers offer generous free tiers suitable for development, testing, or light production use.

## 🚨 Troubleshooting

### Issue: "Twilio not configured"
**Solution**: Check `.env` file and set `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`

### Issue: "Invalid phone number"
**Solution**: Ensure phone numbers are in format: 263782944287 (without spaces/dashes)

### Issue: WhatsApp not working
**Solution**: 
1. Enable WhatsApp in Twilio console
2. Join WhatsApp sandbox: `whatsapp:+1234567890` (check Twilio console for code)
3. Send test message to customer

### Issue: Demo mode - messages not actually sending
**Solution**: This is correct! In demo mode, they're logged to console only. Configure Twilio to enable real sending.

---

## 📈 Performance Tips

1. **Batch Notifications**: Group multiple notifications into one request
2. **Scheduled Messages**: Use timestamps to schedule for less busy times
3. **Rate Limiting**: Twilio has rate limits - implement exponential backoff
4. **Message Queuing**: Queue messages to handle failures gracefully

---

## 🔗 Twilio Resources

- **Twilio Console**: https://www.twilio.com/console
- **Twilio SMS Docs**: https://www.twilio.com/docs/sms
- **Twilio WhatsApp**: https://www.twilio.com/docs/whatsapp
- **Twilio Voice**: https://www.twilio.com/docs/voice
- **Status Callbacks**: https://www.twilio.com/docs/sms/api/message-resource#status-callbacks

---

## 📞 Next Steps

1. **Set up Twilio account** (free trial available)
2. **Get WhatsApp sandbox access** (for testing)
3. **Add real phone numbers** to your providers
4. **Configure `.env` file** with credentials
5. **Test with a real message**
6. **Deploy to production** when ready

---

**Created**: March 10, 2026  
**Version**: 1.0  
**System**: Nasho Technologies Service Marketplace