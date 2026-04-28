const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mqtt = require('mqtt');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let client;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.on('ready-to-show', () => {
    mainWindow = win;
  });

  // Always start with login screen - clear any saved state
  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  win.on('closed', () => {
    console.log('Admin window closed');
  });
}

function connectMqtt() {
  const brokerUrl = 'mqtt://127.0.0.1:1883';
  const options = {
    reconnectPeriod: 1000,
    clean: true,
    connectTimeout: 30000,
  };

  client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log('✅ MQTT Connected to', brokerUrl);
    mainWindow?.webContents.send('mqtt-status', { connected: true });

    client.subscribe('#', (err) => {
      if (!err) {
        console.log('📡 Subscribed to all topics (#)');
      } else {
        console.error('❌ Subscribe error:', err);
        mainWindow?.webContents.send('mqtt-status', { connected: true, error: err.message });
      }
    });
  });

  client.on('reconnect', () => {
    console.log('🔄 MQTT Reconnecting...');
    mainWindow?.webContents.send('mqtt-status', { connected: false, reconnecting: true });
  });

  client.on('close', () => {
    console.log('🔌 MQTT Connection closed');
    mainWindow?.webContents.send('mqtt-status', { connected: false });
  });

  client.on('offline', () => {
    console.log('📴 MQTT Offline');
    mainWindow?.webContents.send('mqtt-status', { connected: false, offline: true });
  });

  client.on('error', (err) => {
    console.error('❌ MQTT Error:', err);
    mainWindow?.webContents.send('mqtt-status', { connected: false, error: err.message });
  });

  client.on('message', (topic, message) => {
    const payload = message.toString();
    console.log(`📨 MQTT [${topic}]: ${payload}`);
    mainWindow?.webContents.send('mqtt-message', { topic: topic.toString(), message: payload });
  });
}

app.whenReady().then(() => {
  createWindow();
  connectMqtt();
});

app.on('window-all-closed', () => {
  if (client) {
    client.end(() => {
      console.log('MQTT client disconnected');
    });
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

console.log(`Digital Dispatch Admin - ${isDev ? 'Development' : 'Production'} Mode`);
console.log('Backend: http://localhost:3000');
console.log('Frontend: http://localhost:5173');

