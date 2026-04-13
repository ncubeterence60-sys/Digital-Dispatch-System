const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Always start with login screen - clear any saved state
  if (isDev) {
    // Load from dev server
    win.loadURL('http://localhost:5173');
    // Open dev tools in development
    win.webContents.openDevTools();
  } else {
    // Load dashboard.html for standalone desktop app
    win.loadFile(path.join(__dirname, 'dashboard.html'));
  }

  // Prevent window from closing without user interaction
  win.on('closed', () => {
    console.log('Admin window closed');
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
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